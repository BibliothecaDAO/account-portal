import type {
  ExtractTablesWithRelations,
  TablesRelationalConfig,
} from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";

import { REALM_OWNERSHIP_FRESHNESS_WINDOW_MS } from "@realms-world/db";
import {
  DELEGATES_INDEXER_ID,
  starknetDelegates,
  starknetDelegatesStatus,
  starknetDelegators,
} from "@realms-world/db/schema";

import { toDecimalAmount } from "./amount-utils";
import { normalizeStarknetAddress } from "./realm-ownership";

export { DELEGATES_INDEXER_ID } from "@realms-world/db/schema";

interface EventLocation {
  blockNumber: bigint;
  eventIndex: number;
}

interface EventPosition {
  blockNumber: string;
  eventIndex: number;
  transactionHash: string;
}

export interface DelegateChange extends EventPosition {
  delegator: string | null;
  fromDelegate: string | null;
  toDelegate: string | null;
}

export interface DelegateVotesChange extends EventPosition {
  delegate: string | null;
  votes: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** The 0x + 64 hex form delegate profiles and the portal use; null for the zero address. */
export function toDelegateAddress(value: unknown): string | null {
  const address = normalizeStarknetAddress(value);
  if (address === "0x0") return null;
  return `0x${address.slice(2).padStart(64, "0")}`;
}

function readDecoded(value: unknown, fields: string[]) {
  if (!isRecord(value) || typeof value.transactionHash !== "string") {
    throw new TypeError("Invalid decoded delegate event");
  }
  const args = value.args;
  if (!isRecord(args) || fields.some((field) => !(field in args))) {
    throw new TypeError("Invalid decoded delegate event args");
  }
  return { args, transactionHash: value.transactionHash };
}

export function toDelegateChange(
  decodedValue: unknown,
  location: EventLocation,
): DelegateChange {
  const { args, transactionHash } = readDecoded(decodedValue, [
    "delegator",
    "from_delegate",
    "to_delegate",
  ]);
  return {
    delegator: toDelegateAddress(args.delegator),
    fromDelegate: toDelegateAddress(args.from_delegate),
    toDelegate: toDelegateAddress(args.to_delegate),
    blockNumber: location.blockNumber.toString(),
    eventIndex: location.eventIndex,
    transactionHash,
  };
}

export function toDelegateVotesChange(
  decodedValue: unknown,
  location: EventLocation,
): DelegateVotesChange {
  const { args, transactionHash } = readDecoded(decodedValue, [
    "delegate",
    "new_votes",
  ]);
  return {
    delegate: toDelegateAddress(args.delegate),
    votes: toDecimalAmount(args.new_votes),
    blockNumber: location.blockNumber.toString(),
    eventIndex: location.eventIndex,
    transactionHash,
  };
}

/** True when the delegate row has not yet seen an event at or after this position. */
function delegateRowIsOlderThan(position: EventPosition) {
  return sql`(${starknetDelegates.last_block_number}, ${starknetDelegates.last_event_index}) < (${position.blockNumber}::numeric, ${position.eventIndex}::integer)`;
}

/**
 * Sets a delegate's votes from the event's absolute value. Drizzle storage undoes
 * reorged writes; the position guard keeps a replayed older event from winning.
 */
export async function applyDelegateVotesChange<
  TQueryResult extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends TablesRelationalConfig =
    ExtractTablesWithRelations<TFullSchema>,
>(
  database: PgDatabase<TQueryResult, TFullSchema, TSchema>,
  change: DelegateVotesChange,
) {
  if (!change.delegate) return;

  await database
    .insert(starknetDelegates)
    .values({
      _id: change.delegate,
      address: change.delegate,
      votes: change.votes,
      token_holders_represented: 0,
      last_block_number: change.blockNumber,
      last_event_index: change.eventIndex,
      last_transaction_hash: change.transactionHash,
    })
    .onConflictDoUpdate({
      target: starknetDelegates._id,
      set: {
        votes: change.votes,
        last_block_number: change.blockNumber,
        last_event_index: change.eventIndex,
        last_transaction_hash: change.transactionHash,
      },
      where: delegateRowIsOlderThan(change),
    });
}

/**
 * Moves the delegator, then recounts each affected delegate from the mapping rather
 * than adding and subtracting, so a replay cannot drift the count.
 */
export async function applyDelegateChange<
  TQueryResult extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends TablesRelationalConfig =
    ExtractTablesWithRelations<TFullSchema>,
>(
  database: PgDatabase<TQueryResult, TFullSchema, TSchema>,
  change: DelegateChange,
) {
  if (!change.delegator) return;

  const rows = await database
    .select()
    .from(starknetDelegators)
    .where(eq(starknetDelegators._id, change.delegator));
  const previous = rows.at(0);

  if (previous) {
    const previousBlock = BigInt(previous.last_block_number);
    const block = BigInt(change.blockNumber);
    const isNewer =
      block > previousBlock ||
      (block === previousBlock && change.eventIndex > previous.last_event_index);
    if (!isNewer) return;
  }

  await database
    .insert(starknetDelegators)
    .values({
      _id: change.delegator,
      delegator: change.delegator,
      delegate: change.toDelegate,
      last_block_number: change.blockNumber,
      last_event_index: change.eventIndex,
      last_transaction_hash: change.transactionHash,
    })
    .onConflictDoUpdate({
      target: starknetDelegators._id,
      set: {
        delegate: change.toDelegate,
        last_block_number: change.blockNumber,
        last_event_index: change.eventIndex,
        last_transaction_hash: change.transactionHash,
      },
    });

  const affected = new Set(
    [previous?.delegate, change.fromDelegate, change.toDelegate].filter(
      (address): address is string => !!address,
    ),
  );
  for (const delegate of affected) {
    const holders = sql<number>`(SELECT count(*)::integer FROM ${starknetDelegators} WHERE ${starknetDelegators.delegate} = ${delegate})`;
    const isNewer = delegateRowIsOlderThan(change);
    await database
      .insert(starknetDelegates)
      .values({
        _id: delegate,
        address: delegate,
        votes: "0",
        token_holders_represented: holders,
        last_block_number: change.blockNumber,
        last_event_index: change.eventIndex,
        last_transaction_hash: change.transactionHash,
      })
      .onConflictDoUpdate({
        target: starknetDelegates._id,
        set: {
          token_holders_represented: holders,
          last_block_number: sql`CASE WHEN ${isNewer} THEN ${change.blockNumber}::numeric ELSE ${starknetDelegates.last_block_number} END`,
          last_event_index: sql`CASE WHEN ${isNewer} THEN ${change.eventIndex}::integer ELSE ${starknetDelegates.last_event_index} END`,
          last_transaction_hash: sql`CASE WHEN ${isNewer} THEN ${change.transactionHash} ELSE ${starknetDelegates.last_transaction_hash} END`,
        },
      });
  }
}

export async function recordDelegatesProgress<
  TQueryResult extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends TablesRelationalConfig =
    ExtractTablesWithRelations<TFullSchema>,
>(
  database: PgDatabase<TQueryResult, TFullSchema, TSchema>,
  update: { blockNumber: bigint; blockTimestamp: Date; processedAt?: Date },
) {
  const processedAt = update.processedAt ?? new Date();
  const hasReachedHead =
    Math.abs(processedAt.getTime() - update.blockTimestamp.getTime()) <=
    REALM_OWNERSHIP_FRESHNESS_WINDOW_MS;

  await database
    .insert(starknetDelegatesStatus)
    .values({
      _id: DELEGATES_INDEXER_ID,
      latest_block_number: update.blockNumber.toString(),
      latest_block_timestamp: update.blockTimestamp,
      last_processed_at: processedAt,
      has_reached_head: hasReachedHead,
    })
    .onConflictDoUpdate({
      target: starknetDelegatesStatus._id,
      set: {
        latest_block_number: update.blockNumber.toString(),
        latest_block_timestamp: update.blockTimestamp,
        last_processed_at: processedAt,
        has_reached_head: sql`${starknetDelegatesStatus.has_reached_head} OR ${hasReachedHead}`,
      },
    });
}
