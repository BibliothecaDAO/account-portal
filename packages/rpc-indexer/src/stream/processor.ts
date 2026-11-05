import type {
  EventRead,
  StarknetBlockHeader,
  StarknetBlockId,
  StarknetEvent,
  StarknetEventRange,
  StarknetRangeBound,
} from "../chains/starknet";
import type { StarknetGroupConfig } from "../config";
import type { Felt } from "../felt";
import type {
  BlockBatch,
  Checkpoint,
  PostgresStore,
  StoredEvent,
  StreamState,
} from "../store/store";
import {
  BlockNotFoundError,
  IncompleteRangeError,
  PageLimitError,
} from "../chains/starknet";
import { decodeStarknetEvent } from "../decoders/starknet";

// One polling group. Each poll reads a hash-pinned range starting at a
// stored checkpoint, rereads the recent window to catch reorgs and earlier
// incomplete reads, and proposes one atomic advance. RPC work happens before
// the store transaction; nothing is committed from a partial read.

export interface StarknetReaderLike {
  getBlockHeader(blockId: StarknetBlockId): Promise<StarknetBlockHeader>;
  readEvents(range: StarknetEventRange): Promise<EventRead>;
}

export interface ProcessorOptions {
  addressList: boolean;
  /** Blocks below the cursor reread after a commit made at the head. */
  overlapBlocks: bigint;
  initialRangeBlocks: bigint;
  maxRangeBlocks: bigint;
  chunkSize: number;
  maxPages: number;
}

export type PollResult =
  | {
      status: "advanced";
      from: bigint;
      to: bigint;
      events: number;
      repairedFrom?: bigint;
      caughtUp: boolean;
    }
  | { status: "idle"; head: bigint }
  | { status: "head-behind"; head: bigint }
  | { status: "range-split"; rangeBlocks: bigint }
  | { status: "head-moved" }
  | { status: "checkpoint-orphaned"; height: bigint };

export class RecoveryExhaustedError extends Error {
  constructor(streamId: string) {
    super(
      `Stream ${streamId} has no canonical checkpoint left inside the retained window; refusing to guess a fork point`,
    );
    this.name = "RecoveryExhaustedError";
  }
}

function eventKey(event: StoredEvent | StarknetEvent) {
  return [
    event.blockNumber,
    event.blockHash,
    event.transactionHash,
    event.eventIndexInTransaction,
    event.fromAddress,
    event.keys.join(","),
    event.data.join(","),
  ].join("|");
}

export class StreamProcessor {
  private rangeBlocks: bigint;
  private readonly filterStarts: Map<Felt, Map<Felt, bigint>>;

  constructor(
    private readonly reader: StarknetReaderLike,
    private readonly store: PostgresStore,
    private readonly group: StarknetGroupConfig,
    private readonly options: ProcessorOptions,
  ) {
    this.rangeBlocks = options.initialRangeBlocks;
    this.filterStarts = new Map();
    for (const filter of group.filters) {
      const bySelector =
        this.filterStarts.get(filter.address) ?? new Map<Felt, bigint>();
      for (const selector of filter.selectors) {
        bySelector.set(selector, filter.startBlock);
      }
      this.filterStarts.set(filter.address, bySelector);
    }
  }

  get id() {
    return this.group.id;
  }

  async poll(): Promise<PollResult> {
    const state = await this.store.loadState(this.group.id);
    const head = await this.reader.getBlockHeader("latest");

    if (head.number < state.processedHeight) {
      // A lagging endpoint is never evidence of a reorg.
      await this.store.recordObservation(this.group.id, { head: head.number });
      return { status: "head-behind", head: head.number };
    }
    if (
      head.number === state.processedHeight &&
      head.hash === state.processedHash
    ) {
      await this.store.recordObservation(this.group.id, { head: head.number });
      return { status: "idle", head: head.number };
    }

    const start = this.chooseStart(state);
    const endNumber = minBigInt(
      head.number,
      maxBigInt(state.processedHeight, start.number) + this.rangeBlocks,
    );
    const end =
      endNumber === head.number
        ? head
        : await this.reader.getBlockHeader({ block_number: Number(endNumber) });

    let read: EventRead;
    try {
      read = await this.reader.readEvents({
        from: start,
        to: { number: end.number, hash: end.hash },
        filters: this.group.filters,
        addressList: this.options.addressList,
        chunkSize: this.options.chunkSize,
        maxPages: this.options.maxPages,
      });
    } catch (error) {
      if (error instanceof PageLimitError) {
        if (this.rangeBlocks <= 1n) throw error;
        this.rangeBlocks = maxBigInt(1n, this.rangeBlocks / 2n);
        return { status: "range-split", rangeBlocks: this.rangeBlocks };
      }
      if (error instanceof BlockNotFoundError) {
        return this.handleMissingBound(start);
      }
      throw error;
    }

    const events = read.events.filter((event) => {
      const startBlock = this.filterStarts
        .get(event.fromAddress)
        ?.get(event.keys[0] as Felt);
      return startBlock !== undefined && event.blockNumber >= startBlock;
    });

    const repairedFrom = await this.findRepairPoint(
      state,
      start.number,
      events,
    );
    const writeFrom = repairedFrom ?? state.processedHeight + 1n;
    const toWrite = events.filter((event) => event.blockNumber >= writeFrom);
    const blocks = await this.buildBlocks(toWrite);

    const caughtUp = end.number === head.number;
    const cursor: Checkpoint = {
      height: end.number,
      hash: end.hash,
      timestamp: end.timestamp,
      atHead: caughtUp,
    };
    await this.store.commit({
      streamId: this.group.id,
      expected: { height: state.processedHeight, hash: state.processedHash },
      repairFrom: repairedFrom,
      blocks,
      cursor,
      head: head.number,
    });

    // Grow ranges during catch-up while they use few pages; the page cap
    // shrinks them again.
    if (!caughtUp && read.pages * 4 <= this.options.maxPages) {
      this.rangeBlocks = minBigInt(
        this.options.maxRangeBlocks,
        this.rangeBlocks * 2n,
      );
    }

    return {
      status: "advanced",
      from: start.number,
      to: end.number,
      events: toWrite.length,
      ...(repairedFrom === undefined ? {} : { repairedFrom }),
      caughtUp,
    };
  }

  /**
   * After a commit made at the head, reread from a checkpoint at least the
   * overlap window below the cursor. During catch-up the cursor was already
   * deep below the head when committed, so the cursor itself is the start.
   */
  private chooseStart(state: StreamState): StarknetRangeBound {
    if (state.processedHash === null) {
      return { number: state.startBlock };
    }
    const latest = state.checkpoints[0];
    if (latest?.height !== state.processedHeight) {
      // The cursor checkpoint was dropped as orphaned: fall back below it.
      return this.olderCheckpoint(state, state.processedHeight - 1n);
    }
    if (!state.processedAtHead) {
      return { number: latest.height, hash: latest.hash };
    }
    return this.olderCheckpoint(
      state,
      state.processedHeight - this.options.overlapBlocks,
    );
  }

  private olderCheckpoint(
    state: StreamState,
    atMost: bigint,
  ): StarknetRangeBound {
    const checkpoint = state.checkpoints.find(
      (candidate) => candidate.height <= atMost,
    );
    if (checkpoint) return { number: checkpoint.height, hash: checkpoint.hash };
    // Only the very beginning of a stream may restart from its configured
    // boundary; anywhere else that would rewrite history without proof.
    if (
      state.processedHeight - state.startBlock <=
      this.options.maxRangeBlocks
    ) {
      return { number: state.startBlock };
    }
    throw new RecoveryExhaustedError(this.group.id);
  }

  private async handleMissingBound(
    start: StarknetRangeBound,
  ): Promise<PollResult> {
    if (start.hash) {
      try {
        await this.reader.getBlockHeader({ block_hash: start.hash });
      } catch (error) {
        if (!(error instanceof BlockNotFoundError)) throw error;
        await this.store.dropCheckpoint(this.group.id, start.number);
        return { status: "checkpoint-orphaned", height: start.number };
      }
    }
    return { status: "head-moved" };
  }

  /** Compare the reread window with storage in both directions. */
  private async findRepairPoint(
    state: StreamState,
    startNumber: bigint,
    events: StarknetEvent[],
  ): Promise<bigint | undefined> {
    if (state.processedHash === null || startNumber > state.processedHeight) {
      return undefined;
    }
    const stored = await this.store.loadEvents(
      this.group.id,
      startNumber,
      state.processedHeight,
    );
    const reread = events.filter(
      (event) => event.blockNumber <= state.processedHeight,
    );
    const storedKeys = new Map(
      stored.map((event) => [eventKey(event), event.blockNumber]),
    );
    const rereadKeys = new Map(
      reread.map((event) => [eventKey(event), event.blockNumber]),
    );
    let repairFrom: bigint | undefined;
    const consider = (block: bigint) => {
      repairFrom =
        repairFrom === undefined || block < repairFrom ? block : repairFrom;
    };
    for (const [key, block] of storedKeys)
      if (!rereadKeys.has(key)) consider(block);
    for (const [key, block] of rereadKeys)
      if (!storedKeys.has(key)) consider(block);
    return repairFrom;
  }

  private async buildBlocks(events: StarknetEvent[]): Promise<BlockBatch[]> {
    const blocks = new Map<bigint, BlockBatch>();
    // Decode first: a decoder failure blocks the stream before any header read.
    const decoded = events.map((event) => ({
      event,
      decoded: decodeStarknetEvent(event),
    }));
    for (const envelope of decoded) {
      const { event } = envelope;
      let block = blocks.get(event.blockNumber);
      if (!block) {
        const header = await this.reader.getBlockHeader({
          block_hash: event.blockHash,
        });
        if (header.number !== event.blockNumber) {
          throw new IncompleteRangeError(
            `Block ${event.blockHash} is ${header.number}, events said ${event.blockNumber}`,
          );
        }
        block = { header, events: [] };
        blocks.set(event.blockNumber, block);
      }
      block.events.push(envelope);
    }
    return [...blocks.values()];
  }
}

function minBigInt(a: bigint, b: bigint) {
  return a < b ? a : b;
}

function maxBigInt(a: bigint, b: bigint) {
  return a > b ? a : b;
}
