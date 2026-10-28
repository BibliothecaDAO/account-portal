import type { Felt } from "../felt";
import type { JsonRpcClient } from "../rpc/json-rpc";
import { normalizeFelt } from "../felt";
import { RpcResponseError } from "../rpc/json-rpc";

// Starknet JSON-RPC v0.10 reader. It returns either a complete, verified
// event range or throws; it never truncates. Positions are the v0.10
// `transaction_index` and transaction-local `event_index`, which differ from
// Apibara's block-wide `eventIndex`.

export const STARKNET_BLOCK_NOT_FOUND = 24;

export type StarknetBlockId =
  | "latest"
  | "l1_accepted"
  | { block_number: number }
  | { block_hash: Felt };

export interface StarknetBlockHeader {
  number: bigint;
  hash: Felt;
  parentHash: Felt;
  timestamp: Date;
  status: string;
}

export interface StarknetEvent {
  blockNumber: bigint;
  blockHash: Felt;
  transactionHash: Felt;
  transactionIndex: number;
  eventIndexInTransaction: number;
  fromAddress: Felt;
  keys: Felt[];
  data: Felt[];
}

export interface StarknetEventFilter {
  address: Felt;
  /** Accepted values for keys[0]. */
  selectors: Felt[];
}

export interface StarknetRangeBound {
  number: bigint;
  /** Pin the bound by hash so a reorged block fails the query. */
  hash?: Felt;
}

export interface StarknetEventRange {
  from: StarknetRangeBound;
  to: StarknetRangeBound & { hash: Felt };
  filters: StarknetEventFilter[];
  /**
   * Send all addresses in one query (RPC v0.10.1+). Only enable after the
   * probe has shown parity with individual queries on this endpoint.
   */
  addressList: boolean;
  chunkSize?: number;
  maxPages?: number;
}

export class BlockNotFoundError extends Error {
  constructor(readonly method: string) {
    super(`${method}: block not found`);
    this.name = "BlockNotFoundError";
  }
}

export class IncompleteRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncompleteRangeError";
  }
}

export class InvalidRpcDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRpcDataError";
  }
}

interface RawBlock {
  status?: unknown;
  block_hash?: unknown;
  parent_hash?: unknown;
  block_number?: unknown;
  timestamp?: unknown;
}

interface RawEvent {
  from_address?: unknown;
  keys?: unknown;
  data?: unknown;
  block_hash?: unknown;
  block_number?: unknown;
  transaction_hash?: unknown;
  transaction_index?: unknown;
  event_index?: unknown;
}

interface RawEventsPage {
  events?: unknown;
  continuation_token?: unknown;
}

function invalid(message: string): never {
  throw new InvalidRpcDataError(message);
}

function requireNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    invalid(`${field} is missing or not a non-negative integer`);
  }
  return value;
}

function requireFeltArray(value: unknown, field: string): Felt[] {
  if (!Array.isArray(value)) invalid(`${field} is not an array`);
  return value.map((item, index) => normalizeFelt(item, `${field}[${index}]`));
}

function toBlockId(bound: StarknetRangeBound): StarknetBlockId {
  if (bound.hash) return { block_hash: bound.hash };
  return { block_number: Number(bound.number) };
}

export function compareStarknetEvents(a: StarknetEvent, b: StarknetEvent) {
  if (a.blockNumber !== b.blockNumber) {
    return a.blockNumber < b.blockNumber ? -1 : 1;
  }
  return (
    a.transactionIndex - b.transactionIndex ||
    a.eventIndexInTransaction - b.eventIndexInTransaction
  );
}

export class StarknetReader {
  constructor(private readonly rpc: JsonRpcClient) {}

  async chainId(): Promise<Felt> {
    return normalizeFelt(
      await this.rpc.call<string>("starknet_chainId", []),
      "chain id",
    );
  }

  async specVersion(): Promise<string> {
    const version = await this.rpc.call<unknown>("starknet_specVersion", []);
    if (typeof version !== "string") invalid("spec version is not a string");
    return version;
  }

  async getBlockHeader(blockId: StarknetBlockId): Promise<StarknetBlockHeader> {
    const raw = await this.callBlockAware<RawBlock>(
      "starknet_getBlockWithTxHashes",
      { block_id: blockId },
    );
    // Pre-confirmed blocks have no hash and must never anchor a read.
    if (raw.block_hash === undefined) {
      invalid("block has no hash; only accepted blocks can anchor reads");
    }
    const timestamp = requireNonNegativeInteger(raw.timestamp, "timestamp");
    return {
      number: BigInt(requireNonNegativeInteger(raw.block_number, "number")),
      hash: normalizeFelt(raw.block_hash, "block_hash"),
      parentHash: normalizeFelt(raw.parent_hash, "parent_hash"),
      timestamp: new Date(timestamp * 1000),
      status: typeof raw.status === "string" ? raw.status : "UNKNOWN",
    };
  }

  /**
   * Read every matching event in [from, to]. Each address set is paginated to
   * completion; any failed, repeated or over-limit page fails the whole range.
   */
  async getEvents(range: StarknetEventRange): Promise<StarknetEvent[]> {
    if (range.from.number > range.to.number) {
      throw new RangeError("Event range start is after its end");
    }
    if (range.filters.length === 0) return [];

    const selectorsByAddress = new Map<Felt, Set<Felt>>();
    for (const filter of range.filters) {
      const address = normalizeFelt(filter.address, "filter address");
      const selectors = selectorsByAddress.get(address) ?? new Set<Felt>();
      for (const selector of filter.selectors) {
        selectors.add(normalizeFelt(selector, "filter selector"));
      }
      selectorsByAddress.set(address, selectors);
    }

    const queries: { address: Felt | Felt[]; selectors: Felt[] }[] =
      range.addressList
        ? [
            {
              address: [...selectorsByAddress.keys()],
              selectors: [
                ...new Set(
                  [...selectorsByAddress.values()].flatMap((set) => [...set]),
                ),
              ],
            },
          ]
        : [...selectorsByAddress].map(([address, selectors]) => ({
            address,
            selectors: [...selectors],
          }));

    const events: StarknetEvent[] = [];
    for (const query of queries) {
      events.push(...(await this.paginate(range, query)));
    }

    const blockHashes = new Map<bigint, Felt>();
    const positions = new Set<string>();
    const matching = events.filter((event) => {
      const known = blockHashes.get(event.blockNumber);
      if (known && known !== event.blockHash) {
        throw new IncompleteRangeError(
          `Conflicting hashes for block ${event.blockNumber}`,
        );
      }
      blockHashes.set(event.blockNumber, event.blockHash);

      const position = `${event.blockNumber}:${event.transactionIndex}:${event.eventIndexInTransaction}`;
      if (positions.has(position)) {
        throw new IncompleteRangeError(`Duplicate event position ${position}`);
      }
      positions.add(position);

      const selectors = selectorsByAddress.get(event.fromAddress);
      if (!selectors) {
        invalid(`Event from unrequested address ${event.fromAddress}`);
      }
      // An address-list query is a cross product of addresses and selectors,
      // so drop pairs that no filter asked for.
      const selector = event.keys[0];
      return selector !== undefined && selectors.has(selector);
    });

    const end = range.to;
    const endHash = blockHashes.get(end.number);
    if (endHash && endHash !== end.hash) {
      throw new IncompleteRangeError("Range end hash changed during the read");
    }
    return matching.sort(compareStarknetEvents);
  }

  private async paginate(
    range: StarknetEventRange,
    query: { address: Felt | Felt[]; selectors: Felt[] },
  ): Promise<StarknetEvent[]> {
    const chunkSize = range.chunkSize ?? 1_000;
    const maxPages = range.maxPages ?? 20;
    const seenTokens = new Set<string>();
    const events: StarknetEvent[] = [];
    let token: string | undefined;

    for (let page = 0; ; page++) {
      if (page >= maxPages) {
        throw new IncompleteRangeError(
          `Range ${range.from.number}-${range.to.number} exceeds ${maxPages} pages; split it`,
        );
      }
      const result = await this.callBlockAware<RawEventsPage>(
        "starknet_getEvents",
        {
          filter: {
            from_block: toBlockId(range.from),
            to_block: toBlockId(range.to),
            address: query.address,
            keys: [query.selectors],
            chunk_size: chunkSize,
            ...(token === undefined ? {} : { continuation_token: token }),
          },
        },
      );
      if (!Array.isArray(result.events)) invalid("events page has no array");
      if (result.events.length > chunkSize) {
        invalid("events page is larger than the requested chunk size");
      }
      for (const raw of result.events as RawEvent[]) {
        events.push(this.parseEvent(raw, range));
      }

      const next = result.continuation_token;
      if (next === undefined || next === null) return events;
      if (typeof next !== "string" || next.length === 0) {
        invalid("continuation token is not a non-empty string");
      }
      if (seenTokens.has(next)) {
        throw new IncompleteRangeError("Repeated continuation token");
      }
      seenTokens.add(next);
      token = next;
    }
  }

  private parseEvent(raw: RawEvent, range: StarknetEventRange): StarknetEvent {
    if (raw.block_hash === undefined || raw.block_number === undefined) {
      invalid("event has no accepted block reference");
    }
    const blockNumber = BigInt(
      requireNonNegativeInteger(raw.block_number, "event block_number"),
    );
    if (blockNumber < range.from.number || blockNumber > range.to.number) {
      invalid(`event block ${blockNumber} is outside the requested range`);
    }
    return {
      blockNumber,
      blockHash: normalizeFelt(raw.block_hash, "event block_hash"),
      transactionHash: normalizeFelt(
        raw.transaction_hash,
        "event transaction_hash",
      ),
      transactionIndex: requireNonNegativeInteger(
        raw.transaction_index,
        "event transaction_index",
      ),
      eventIndexInTransaction: requireNonNegativeInteger(
        raw.event_index,
        "event event_index",
      ),
      fromAddress: normalizeFelt(raw.from_address, "event from_address"),
      keys: requireFeltArray(raw.keys, "event keys"),
      data: requireFeltArray(raw.data, "event data"),
    };
  }

  private async callBlockAware<T>(method: string, params: unknown) {
    try {
      return await this.rpc.call<T>(method, params);
    } catch (error) {
      if (
        error instanceof RpcResponseError &&
        error.code === STARKNET_BLOCK_NOT_FOUND
      ) {
        throw new BlockNotFoundError(method);
      }
      throw error;
    }
  }
}
