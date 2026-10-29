import { normalizeBridgeRequest } from "@realms-world/bridge";

import type { StarknetBlockHeader, StarknetEvent } from "../chains/starknet";
import type { Network } from "../config";
import type { DecodedStarknetEvent } from "../decoders/starknet";
import type { Felt } from "../felt";
import type { Queryable } from "./migrations";
import { toHex } from "../felt";

// PostgreSQL store for one generation schema. Every write happens inside a
// short transaction on the single writer connection, after the RPC reads it
// commits have finished. A commit checks the expected cursor, so a stale or
// duplicate writer fails instead of interleaving.

export interface Checkpoint {
  height: bigint;
  hash: Felt;
  timestamp: Date;
  atHead: boolean;
}

export interface StreamState {
  id: string;
  startBlock: bigint;
  processedHeight: bigint;
  processedHash: Felt | null;
  processedAtHead: boolean;
  /** Newest first. */
  checkpoints: Checkpoint[];
}

export interface StreamDefinition {
  id: string;
  network: Network;
  chainId: Felt;
  fingerprint: string;
  startBlock: bigint;
}

export interface DecodedEnvelope {
  event: StarknetEvent;
  decoded: DecodedStarknetEvent;
}

export interface BlockBatch {
  header: StarknetBlockHeader;
  events: DecodedEnvelope[];
}

export interface Advance {
  streamId: string;
  expected: { height: bigint; hash: Felt | null };
  /** Delete stored events at or above this block before inserting. */
  repairFrom?: bigint;
  blocks: BlockBatch[];
  cursor: Checkpoint;
  head: bigint;
}

export class CursorConflictError extends Error {
  constructor(streamId: string) {
    super(`Stream ${streamId} cursor changed underneath this writer`);
    this.name = "CursorConflictError";
  }
}

export class FingerprintMismatchError extends Error {
  constructor(streamId: string) {
    super(
      `Stream ${streamId} was built with different filters or decoders; select a new generation schema or replay explicitly`,
    );
    this.name = "FingerprintMismatchError";
  }
}

const CHECKPOINTS_RETAINED = 64;

/** Serializes store operations so transactions never interleave on one connection. */
class Mutex {
  private tail: Promise<unknown> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task, task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

interface StreamRow {
  start_block: string;
  processed_height: string;
  processed_hash: string | null;
  processed_at_head: boolean;
  fingerprint: string;
  network: string;
  chain_id: string;
}

export interface StoredEvent {
  blockNumber: bigint;
  blockHash: Felt;
  transactionHash: Felt;
  eventIndexInTransaction: number;
  fromAddress: Felt;
  keys: Felt[];
  data: Felt[];
}

export class PostgresStore {
  private readonly mutex = new Mutex();

  constructor(
    private readonly db: Queryable,
    private readonly schema: string,
    private readonly network: Network,
  ) {}

  /** Create the stream row, or verify an existing one matches this build. */
  ensureStream(definition: StreamDefinition): Promise<StreamState> {
    return this.mutex.run(async () => {
      const s = this.schema;
      await this.db.query(
        `INSERT INTO ${s}.streams (id, network, chain_id, fingerprint, start_block, processed_height)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          definition.id,
          definition.network,
          definition.chainId,
          definition.fingerprint,
          definition.startBlock.toString(),
          (definition.startBlock - 1n).toString(),
        ],
      );
      const row = await this.streamRow(definition.id);
      if (
        row.fingerprint !== definition.fingerprint ||
        row.network !== definition.network ||
        row.chain_id !== definition.chainId ||
        BigInt(row.start_block) !== definition.startBlock
      ) {
        throw new FingerprintMismatchError(definition.id);
      }
      return this.loadStateUnlocked(definition.id);
    });
  }

  loadState(streamId: string): Promise<StreamState> {
    return this.mutex.run(() => this.loadStateUnlocked(streamId));
  }

  loadEvents(
    streamId: string,
    from: bigint,
    to: bigint,
  ): Promise<StoredEvent[]> {
    return this.mutex.run(async () => {
      const { rows } = await this.db.query<{
        block_number: string;
        block_hash: string;
        transaction_hash: string;
        event_index_in_transaction: number;
        from_address: string;
        keys: string[];
        data: string[];
      }>(
        `SELECT block_number::text, block_hash, transaction_hash,
                event_index_in_transaction, from_address, keys, data
         FROM ${this.schema}.events e
         WHERE e.stream_id = $1 AND e.block_number BETWEEN $2 AND $3
         -- Qualified so the numeric column sorts, not the ::text output alias.
         ORDER BY e.block_number, e.transaction_index, e.event_index_in_transaction`,
        [streamId, from.toString(), to.toString()],
      );
      return rows.map((row) => ({
        blockNumber: BigInt(row.block_number),
        blockHash: row.block_hash as Felt,
        transactionHash: row.transaction_hash as Felt,
        eventIndexInTransaction: row.event_index_in_transaction,
        fromAddress: row.from_address as Felt,
        keys: row.keys as Felt[],
        data: row.data as Felt[],
      }));
    });
  }

  /** Forget a checkpoint whose hash the chain no longer has. */
  dropCheckpoint(streamId: string, height: bigint): Promise<void> {
    return this.mutex.run(async () => {
      await this.db.query(
        `DELETE FROM ${this.schema}.checkpoints WHERE stream_id = $1 AND height >= $2`,
        [streamId, height.toString()],
      );
    });
  }

  recordObservation(
    streamId: string,
    observation: { head: bigint; error?: string },
  ): Promise<void> {
    return this.mutex.run(async () => {
      await this.db.query(
        `UPDATE ${this.schema}.streams
         SET head_height = $2, head_seen_at = now(),
             last_error = $3, last_error_at = CASE WHEN $3::text IS NULL THEN last_error_at ELSE now() END,
             updated_at = now()
         WHERE id = $1`,
        [streamId, observation.head.toString(), observation.error ?? null],
      );
    });
  }

  recordFailure(streamId: string, message: string): Promise<void> {
    return this.mutex.run(async () => {
      await this.db.query(
        `UPDATE ${this.schema}.streams
         SET last_error = $2, last_error_at = now(), updated_at = now()
         WHERE id = $1`,
        [streamId, message.slice(0, 2_000)],
      );
    });
  }

  commit(advance: Advance): Promise<void> {
    return this.mutex.run(async () => {
      await this.db.query("BEGIN");
      try {
        await this.commitUnlocked(advance);
        await this.db.query("COMMIT");
      } catch (error) {
        await this.db.query("ROLLBACK");
        throw error;
      }
    });
  }

  private async commitUnlocked(advance: Advance) {
    const s = this.schema;
    const { rows } = await this.db.query<{
      processed_height: string;
      processed_hash: string | null;
    }>(
      `SELECT processed_height::text, processed_hash FROM ${s}.streams WHERE id = $1 FOR UPDATE`,
      [advance.streamId],
    );
    const current = rows[0];
    if (
      !current ||
      BigInt(current.processed_height) !== advance.expected.height ||
      current.processed_hash !== advance.expected.hash
    ) {
      throw new CursorConflictError(advance.streamId);
    }

    const affectedTokens = new Set<string>();
    if (advance.repairFrom !== undefined) {
      const removed = await this.db.query<{ token_id: string }>(
        `SELECT DISTINCT t.token_id::text
         FROM ${s}.realm_transfers t JOIN ${s}.events e ON e.id = t.event_id
         WHERE e.stream_id = $1 AND e.block_number >= $2`,
        [advance.streamId, advance.repairFrom.toString()],
      );
      for (const row of removed.rows) affectedTokens.add(row.token_id);
      await this.db.query(
        `DELETE FROM ${s}.event_blocks WHERE stream_id = $1 AND block_number >= $2`,
        [advance.streamId, advance.repairFrom.toString()],
      );
      await this.db.query(
        `DELETE FROM ${s}.checkpoints WHERE stream_id = $1 AND height >= $2`,
        [advance.streamId, advance.repairFrom.toString()],
      );
    }

    for (const block of advance.blocks) {
      if (block.events.length === 0) continue;
      await this.db.query(
        `INSERT INTO ${s}.event_blocks (stream_id, block_number, block_hash, block_timestamp, event_count)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          advance.streamId,
          block.header.number.toString(),
          block.header.hash,
          block.header.timestamp,
          block.events.length,
        ],
      );
      for (const envelope of block.events) {
        const token = await this.insertEvent(
          advance.streamId,
          block.header,
          envelope,
        );
        if (token !== undefined) affectedTokens.add(token);
      }
    }

    if (affectedTokens.size > 0) {
      await this.recomputeOwners([...affectedTokens]);
    }

    const cursor = advance.cursor;
    await this.db.query(
      `INSERT INTO ${s}.checkpoints (stream_id, height, hash, block_timestamp, at_head)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (stream_id, height) DO UPDATE
       SET hash = excluded.hash, block_timestamp = excluded.block_timestamp, at_head = excluded.at_head`,
      [
        advance.streamId,
        cursor.height.toString(),
        cursor.hash,
        cursor.timestamp,
        cursor.atHead,
      ],
    );
    await this.db.query(
      `DELETE FROM ${s}.checkpoints
       WHERE stream_id = $1 AND height NOT IN (
         SELECT height FROM ${s}.checkpoints WHERE stream_id = $1
         ORDER BY height DESC LIMIT ${CHECKPOINTS_RETAINED}
       )`,
      [advance.streamId],
    );
    await this.db.query(
      `UPDATE ${s}.streams
       SET processed_height = $2, processed_hash = $3, processed_timestamp = $4,
           processed_at_head = $5, head_height = $6, head_seen_at = now(),
           last_success_at = now(), last_error = NULL, updated_at = now()
       WHERE id = $1`,
      [
        advance.streamId,
        cursor.height.toString(),
        cursor.hash,
        cursor.timestamp,
        cursor.atHead,
        advance.head.toString(),
      ],
    );
  }

  /** Insert the raw event and its typed row; returns a touched token ID. */
  private async insertEvent(
    streamId: string,
    header: StarknetBlockHeader,
    { event, decoded }: DecodedEnvelope,
  ): Promise<string | undefined> {
    const s = this.schema;
    const { rows } = await this.db.query<{ id: string }>(
      `INSERT INTO ${s}.events (stream_id, block_number, block_hash, transaction_hash,
         transaction_index, event_index_in_transaction, from_address, keys, data, kind)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id::text`,
      [
        streamId,
        event.blockNumber.toString(),
        event.blockHash,
        event.transactionHash,
        event.transactionIndex,
        event.eventIndexInTransaction,
        event.fromAddress,
        event.keys,
        event.data,
        decoded.kind,
      ],
    );
    const eventId = (rows[0] as { id: string }).id;
    const common = [
      event.transactionHash,
      event.blockNumber.toString(),
      header.timestamp,
    ];

    switch (decoded.kind) {
      case "Transfer": {
        const tokenId = decoded.tokenId.toString();
        await this.db.query(
          `INSERT INTO ${s}.realm_transfers (event_id, token_id, from_address, to_address,
             block_number, transaction_hash, transaction_index, event_index_in_transaction)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            eventId,
            tokenId,
            toHex(decoded.from),
            toHex(decoded.to),
            event.blockNumber.toString(),
            event.transactionHash,
            event.transactionIndex,
            event.eventIndexInTransaction,
          ],
        );
        return tokenId;
      }
      case "RewardClaimed":
        await this.db.query(
          `INSERT INTO ${s}.realms_lords_claims (event_id, recipient, amount, transaction_hash, block_number, block_timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            eventId,
            toHex(decoded.recipient),
            decoded.amount.toString(),
            ...common,
          ],
        );
        return undefined;
      case "ModifyLock":
        await this.db.query(
          `INSERT INTO ${s}.velords_locks (event_id, caller, owner, amount, end_time, transaction_hash, block_number, block_timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            eventId,
            toHex(decoded.caller),
            toHex(decoded.owner),
            decoded.amount.toString(),
            decoded.endTime.toString(),
            ...common,
          ],
        );
        return undefined;
      case "RewardReceived":
        await this.db.query(
          `INSERT INTO ${s}.velords_rewards (event_id, sender, amount, transaction_hash, block_number, block_timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            eventId,
            toHex(decoded.sender),
            decoded.amount.toString(),
            ...common,
          ],
        );
        return undefined;
      case "DepositRequestInitiated":
      case "WithdrawRequestCompleted": {
        // Matches the isolated Apibara L2 projection: an L2 deposit-initiated
        // event starts a withdrawal to L1, and an L2 withdraw-completed event
        // finishes a deposit from L1.
        const completed = decoded.kind === "WithdrawRequestCompleted";
        const normalized = normalizeBridgeRequest(
          this.network,
          completed ? "deposit" : "withdrawal",
          {
            reqHash: decoded.request.hash,
            ownerL1: decoded.request.ownerL1,
            ownerL2: decoded.request.ownerL2,
            tokenIds: decoded.request.tokenIds,
          },
        );
        await this.db.query(
          `INSERT INTO ${s}.l2_bridge_events (event_id, request_key, network, direction, req_hash,
             owner_l1, owner_l2, token_ids, payload, event_name, type, block_number, block_hash,
             transaction_hash, transaction_index, event_index_in_transaction, block_timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            eventId,
            normalized.requestKey,
            normalized.network,
            normalized.direction,
            normalized.reqHash,
            normalized.ownerL1,
            normalized.ownerL2,
            normalized.tokenIds,
            normalized.payload,
            decoded.kind,
            completed ? "withdraw_completed_l2" : "deposit_initiated_l2",
            event.blockNumber.toString(),
            event.blockHash,
            event.transactionHash,
            event.transactionIndex,
            event.eventIndexInTransaction,
            header.timestamp,
          ],
        );
        return undefined;
      }
    }
  }

  /**
   * Rebuild owners from the latest surviving transfer of each token, in full
   * canonical order. A burn (transfer to zero) leaves the token absent.
   */
  private async recomputeOwners(tokenIds: string[]) {
    const s = this.schema;
    await this.db.query(
      `DELETE FROM ${s}.realm_owners WHERE token_id = ANY($1::numeric[])`,
      [tokenIds],
    );
    await this.db.query(
      `INSERT INTO ${s}.realm_owners (token_id, owner, block_number, transaction_hash,
         transaction_index, event_index_in_transaction)
       SELECT token_id, to_address, block_number, transaction_hash,
              transaction_index, event_index_in_transaction
       FROM (
         SELECT DISTINCT ON (token_id) *
         FROM ${s}.realm_transfers
         WHERE token_id = ANY($1::numeric[])
         ORDER BY token_id, block_number DESC, transaction_index DESC,
                  event_index_in_transaction DESC
       ) latest
       WHERE to_address <> '0x0'`,
      [tokenIds],
    );
  }

  private async streamRow(streamId: string): Promise<StreamRow> {
    const { rows } = await this.db.query<StreamRow>(
      `SELECT start_block::text, processed_height::text, processed_hash,
              processed_at_head, fingerprint, network, chain_id
       FROM ${this.schema}.streams WHERE id = $1`,
      [streamId],
    );
    const row = rows[0];
    if (!row) throw new Error(`Unknown stream ${streamId}`);
    return row;
  }

  private async loadStateUnlocked(streamId: string): Promise<StreamState> {
    const row = await this.streamRow(streamId);
    const { rows } = await this.db.query<{
      height: string;
      hash: string;
      block_timestamp: Date | string;
      at_head: boolean;
    }>(
      `SELECT height::text, hash, block_timestamp, at_head
       FROM ${this.schema}.checkpoints c WHERE c.stream_id = $1
       -- Qualified so the numeric column sorts, not the ::text output alias.
       ORDER BY c.height DESC`,
      [streamId],
    );
    return {
      id: streamId,
      startBlock: BigInt(row.start_block),
      processedHeight: BigInt(row.processed_height),
      processedHash: row.processed_hash as Felt | null,
      processedAtHead: row.processed_at_head,
      checkpoints: rows.map((checkpoint) => ({
        height: BigInt(checkpoint.height),
        hash: checkpoint.hash as Felt,
        timestamp: new Date(checkpoint.block_timestamp),
        atHead: checkpoint.at_head,
      })),
    };
  }
}
