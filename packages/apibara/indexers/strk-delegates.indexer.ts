import type {
  ExtractTablesWithRelations,
  TablesRelationalConfig,
} from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { defineIndexer } from "@apibara/indexer";
import { useLogger as getLogger } from "@apibara/indexer/plugins";
import {
  drizzleStorage,
  useDrizzleStorage as getDrizzleStorage,
} from "@apibara/plugin-drizzle";
import { decodeEvent, getSelector, StarknetStream } from "@apibara/starknet";

import { ChainId, CollectionAddresses } from "@realms-world/constants";
import { db } from "@realms-world/db/poolClient";

import { env } from "../env";
import { getStarknetStreamUrl } from "../streams";
import {
  applyDelegateChange,
  applyDelegateVotesChange,
  DELEGATES_INDEXER_ID,
  recordDelegatesProgress,
  toDelegateChange,
  toDelegateVotesChange,
} from "./realm-delegates";
import {
  DELEGATE_CHANGED_EVENT,
  DELEGATE_VOTES_CHANGED_EVENT,
  REALMS_DELEGATES_ABI,
} from "./realms-delegates-abi";

const DELEGATE_CHANGED_SELECTOR = getSelector("DelegateChanged");
const DELEGATE_VOTES_CHANGED_SELECTOR = getSelector("DelegateVotesChanged");
const MAINNET_STARTING_BLOCK = 664_161n;

function getDelegatesStorageSchema<TSchema extends TablesRelationalConfig>(
  schema: TSchema | undefined,
): TablesRelationalConfig {
  const delegates = schema?.starknetDelegates;
  const delegators = schema?.starknetDelegators;
  const status = schema?.starknetDelegatesStatus;

  if (!delegates || !delegators || !status) {
    throw new Error("Delegate tables are missing from the database schema");
  }

  return {
    starknetDelegates: delegates,
    starknetDelegators: delegators,
    starknetDelegatesStatus: status,
  };
}

export default function () {
  return createIndexer({ database: db });
}

export function createIndexer<
  TQueryResult extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends TablesRelationalConfig =
    ExtractTablesWithRelations<TFullSchema>,
>({ database }: { database: PgDatabase<TQueryResult, TFullSchema, TSchema> }) {
  const l2ChainId =
    env.VITE_PUBLIC_CHAIN === "sepolia" ? ChainId.SN_SEPOLIA : ChainId.SN_MAIN;
  const address = CollectionAddresses.realms[l2ChainId] as `0x${string}`;

  return defineIndexer(StarknetStream)({
    streamUrl: getStarknetStreamUrl(env.VITE_PUBLIC_CHAIN),
    finality: "pending",
    startingCursor: {
      orderKey: env.VITE_PUBLIC_CHAIN === "sepolia" ? 0n : MAINNET_STARTING_BLOCK,
    },
    filter: {
      header: "on_data_or_on_new_block",
      events: [
        { address, keys: [DELEGATE_CHANGED_SELECTOR] },
        { address, keys: [DELEGATE_VOTES_CHANGED_SELECTOR] },
      ],
    },
    plugins: [
      drizzleStorage({
        db: database,
        schema: getDelegatesStorageSchema(database._.schema),
        idColumn: "_id",
        persistState: true,
        indexerName: DELEGATES_INDEXER_ID,
      }),
    ],
    async transform({ block }) {
      const logger = getLogger();
      const { db: storage } = getDrizzleStorage();
      const blockNumber = block.header.blockNumber;

      // The position guards rely on ascending order, across both event filters.
      const events = [...block.events].sort(
        (a, b) => a.eventIndex - b.eventIndex,
      );
      for (const event of events) {
        const location = { blockNumber, eventIndex: event.eventIndex };
        if (event.keys[0] === DELEGATE_VOTES_CHANGED_SELECTOR) {
          await applyDelegateVotesChange(
            storage,
            toDelegateVotesChange(
              decodeEvent({
                abi: REALMS_DELEGATES_ABI,
                eventName: DELEGATE_VOTES_CHANGED_EVENT,
                event,
              }),
              location,
            ),
          );
        } else if (event.keys[0] === DELEGATE_CHANGED_SELECTOR) {
          await applyDelegateChange(
            storage,
            toDelegateChange(
              decodeEvent({
                abi: REALMS_DELEGATES_ABI,
                eventName: DELEGATE_CHANGED_EVENT,
                event,
              }),
              location,
            ),
          );
        }
      }

      await recordDelegatesProgress(storage, {
        blockNumber,
        blockTimestamp: block.header.timestamp,
      });

      if (events.length > 0) {
        logger.info(
          `Indexed ${events.length} delegate event(s) at Starknet block ${blockNumber}`,
        );
      }
    },
  });
}
