import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

import type {
  StarknetBlockHeader,
  StarknetBlockId,
  StarknetEvent,
  StarknetEventRange,
} from "../src/chains/starknet";
import type { Felt } from "../src/felt";
import type { Queryable } from "../src/store/migrations";
import type { StarknetReaderLike } from "../src/stream/processor";
import {
  BlockNotFoundError,
  IncompleteRangeError,
} from "../src/chains/starknet";
import {
  groupFingerprint,
  STARKNET_CHAIN_IDS,
  starknetGroups,
} from "../src/config";
import { DecodeError, STARKNET_SELECTORS } from "../src/decoders/starknet";
import { toHex } from "../src/felt";
import { migrate } from "../src/store/migrations";
import {
  CursorConflictError,
  FingerprintMismatchError,
  PostgresStore,
} from "../src/store/store";
import { StreamProcessor } from "../src/stream/processor";

const SCHEMA = "rpc_indexer_mainnet_v1";
const GROUP = (() => {
  const [group] = starknetGroups("mainnet", "address-list");
  if (!group) throw new Error("missing group");
  return group;
})();
const REALMS = GROUP.filters.find((f) => f.id === "realms-transfer")
  ?.address as Felt;
const FIRST = 664_162n;

interface SimEvent {
  fromAddress: Felt;
  keys: Felt[];
  data: Felt[];
  tx: number;
  index: number;
}

interface SimBlock {
  number: bigint;
  hash: Felt;
  timestamp: Date;
  events: SimEvent[];
}

/** An in-memory canonical chain that can be forked. */
class SimChain implements StarknetReaderLike {
  blocks: SimBlock[] = [];
  private forkSalt = 0;
  failPageLimitOnce = false;

  constructor(first: bigint, count: number) {
    for (let i = 0; i < count; i++) this.push(first + BigInt(i));
  }

  push(number: bigint, events: SimEvent[] = []) {
    this.blocks.push({
      number,
      hash: toHex((number << 16n) + BigInt(this.forkSalt)),
      timestamp: new Date(Number(number) * 1000),
      events,
    });
  }

  extend(count: number) {
    const last = this.head().number;
    for (let i = 1; i <= count; i++) this.push(last + BigInt(i));
  }

  at(number: bigint) {
    const block = this.blocks.find((candidate) => candidate.number === number);
    if (!block) throw new Error(`no block ${number}`);
    return block;
  }

  head() {
    return this.blocks.at(-1) as SimBlock;
  }

  /** Replace every block from `from` with new hashes and the given events. */
  fork(from: bigint, events = new Map<bigint, SimEvent[]>()) {
    const height = this.head().number;
    this.blocks = this.blocks.filter((block) => block.number < from);
    this.forkSalt++;
    for (let number = from; number <= height; number++) {
      this.push(number, events.get(number) ?? []);
    }
  }

  private resolve(id: StarknetBlockId): SimBlock {
    if (id === "latest") return this.head();
    if (id === "l1_accepted") throw new Error("unused");
    const block =
      "block_hash" in id
        ? this.blocks.find((candidate) => candidate.hash === id.block_hash)
        : this.blocks.find(
            (candidate) => candidate.number === BigInt(id.block_number),
          );
    if (!block) throw new BlockNotFoundError("sim");
    return block;
  }

  getBlockHeader(id: StarknetBlockId): Promise<StarknetBlockHeader> {
    try {
      const block = this.resolve(id);
      return Promise.resolve({
        number: block.number,
        hash: block.hash,
        parentHash: "0x0",
        timestamp: block.timestamp,
        status: "ACCEPTED_ON_L2",
      });
    } catch (error) {
      return Promise.reject(error as Error);
    }
  }

  getEvents(range: StarknetEventRange): Promise<StarknetEvent[]> {
    try {
      const from = range.from.hash
        ? this.resolve({ block_hash: range.from.hash })
        : undefined;
      this.resolve({ block_hash: range.to.hash });
      const start = from?.number ?? range.from.number;
      const wanted = new Map<Felt, Set<Felt>>();
      for (const filter of range.filters) {
        const selectors = wanted.get(filter.address) ?? new Set<Felt>();
        for (const selector of filter.selectors) selectors.add(selector);
        wanted.set(filter.address, selectors);
      }
      const events: StarknetEvent[] = [];
      for (const block of this.blocks) {
        if (block.number < start || block.number > range.to.number) continue;
        for (const event of block.events) {
          if (!wanted.get(event.fromAddress)?.has(event.keys[0] as Felt))
            continue;
          events.push({
            blockNumber: block.number,
            blockHash: block.hash,
            transactionHash: toHex((block.number << 8n) + BigInt(event.tx)),
            transactionIndex: event.tx,
            eventIndexInTransaction: event.index,
            fromAddress: event.fromAddress,
            keys: event.keys,
            data: event.data,
          });
        }
      }
      if (this.failPageLimitOnce && events.length > 1) {
        this.failPageLimitOnce = false;
        throw new IncompleteRangeError("Range exceeds 1 pages; split it");
      }
      return Promise.resolve(events);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  }
}

function transfer(
  to: bigint,
  tokenId: bigint,
  tx = 0,
  index = 0,
  from = 0n,
): SimEvent {
  return {
    fromAddress: REALMS,
    keys: [
      STARKNET_SELECTORS.Transfer,
      toHex(from),
      toHex(to),
      toHex(tokenId),
      "0x0",
    ],
    data: [],
    tx,
    index,
  };
}

function claim(recipient: bigint, amount: bigint, tx = 0, index = 0): SimEvent {
  return {
    fromAddress: REALMS,
    keys: [STARKNET_SELECTORS.RewardClaimed, toHex(recipient)],
    data: [toHex(amount), "0x0"],
    tx,
    index,
  };
}

let db: PGlite;
let store: PostgresStore;
let chain: SimChain;

const options = {
  addressList: true,
  overlapBlocks: 8n,
  initialRangeBlocks: 50n,
  maxRangeBlocks: 200n,
  chunkSize: 1_000,
  maxPages: 20,
};

function processor() {
  return new StreamProcessor(chain, store, GROUP, options);
}

async function ensure() {
  return store.ensureStream({
    id: GROUP.id,
    network: "mainnet",
    chainId: STARKNET_CHAIN_IDS.mainnet,
    fingerprint: groupFingerprint(GROUP),
    startBlock: FIRST,
  });
}

async function runUntilIdle(worker: StreamProcessor, limit = 50) {
  const results = [];
  for (let i = 0; i < limit; i++) {
    const result = await worker.poll();
    results.push(result);
    if (
      result.status === "idle" ||
      (result.status === "advanced" && result.caughtUp)
    ) {
      return results;
    }
  }
  throw new Error("did not catch up");
}

async function owners() {
  const { rows } = await db.query<{ token_id: string; owner: string }>(
    `SELECT token_id::text, owner FROM ${SCHEMA}.realm_owners ORDER BY token_id`,
  );
  return Object.fromEntries(rows.map((row) => [row.token_id, row.owner]));
}

async function count(table: string) {
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM ${SCHEMA}.${table}`,
  );
  return rows[0]?.n;
}

beforeEach(async () => {
  db = new PGlite();
  await migrate(db as unknown as Queryable, SCHEMA);
  store = new PostgresStore(db as unknown as Queryable, SCHEMA, "mainnet");
  chain = new SimChain(FIRST - 10n, 300);
  chain.at(FIRST - 5n).events.push(transfer(0xdeadn, 99n)); // before the start block
  chain
    .at(FIRST + 3n)
    .events.push(transfer(0xa1n, 1n), transfer(0xa2n, 2n, 0, 1));
  chain
    .at(FIRST + 120n)
    .events.push(transfer(0xb1n, 1n, 2, 0, 0xa1n), claim(0xa2n, 10n ** 21n, 3));
  await ensure();
});

describe("Starknet worker", () => {
  it("backfills to the head in bounded ranges and builds projections", async () => {
    const results = await runUntilIdle(processor());
    expect(
      results.filter((r) => r.status === "advanced").length,
    ).toBeGreaterThan(1);
    expect(await owners()).toEqual({ "1": "0xb1", "2": "0xa2" });
    expect(await count("realms_lords_claims")).toBe(1);
    const { rows } = await db.query<{ amount: string; recipient: string }>(
      `SELECT amount::text, recipient FROM ${SCHEMA}.realms_lords_claims`,
    );
    expect(rows[0]).toEqual({
      amount: (10n ** 21n).toString(),
      recipient: "0xa2",
    });
    const state = await store.loadState(GROUP.id);
    expect(state.processedHeight).toBe(chain.head().number);
    expect(state.processedAtHead).toBe(true);
  });

  it("advances progress across eventless blocks and stays idle at the head", async () => {
    const worker = processor();
    await runUntilIdle(worker);
    chain.extend(20);
    const result = await worker.poll();
    expect(result).toMatchObject({
      status: "advanced",
      events: 0,
      caughtUp: true,
    });
    expect((await store.loadState(GROUP.id)).processedHeight).toBe(
      chain.head().number,
    );
    expect(await worker.poll()).toMatchObject({ status: "idle" });
  });

  it("repairs a reorg inside the overlap window and recomputes owners", async () => {
    const worker = processor();
    chain
      .at(chain.head().number - 2n)
      .events.push(transfer(0xc1n, 2n, 0, 0, 0xa2n));
    await runUntilIdle(worker);
    expect((await owners())["2"]).toBe("0xc1");

    // The transfer's block is replaced by a fork without it, and a different
    // transfer lands one block later.
    const height = chain.head().number;
    chain.fork(
      height - 3n,
      new Map([[height - 1n, [transfer(0xd1n, 2n, 1, 0, 0xa2n)]]]),
    );
    chain.extend(2);
    const result = await worker.poll();
    expect(result).toMatchObject({
      status: "advanced",
      repairedFrom: height - 2n,
    });
    expect((await owners())["2"]).toBe("0xd1");
    expect(await count("realm_transfers")).toBe(4);
  });

  it("restores the previous owner when a burn is reorged out", async () => {
    const worker = processor();
    chain
      .at(chain.head().number - 1n)
      .events.push(transfer(0n, 1n, 0, 0, 0xb1n));
    await runUntilIdle(worker);
    expect((await owners())["1"]).toBeUndefined();

    chain.fork(chain.head().number - 2n);
    chain.extend(1);
    await worker.poll();
    expect((await owners())["1"]).toBe("0xb1");
  });

  it("drops an orphaned start checkpoint and recovers from an older one", async () => {
    const worker = processor();
    await runUntilIdle(worker);
    chain.extend(10);
    await worker.poll(); // a second at-head checkpoint, 10 blocks later
    chain.extend(10);
    await worker.poll();

    // Fork deeper than the overlap so the chosen start hash disappears.
    const height = chain.head().number;
    chain.fork(height - 15n, new Map([[height - 12n, [claim(0xe1n, 5n)]]]));
    const results = await runUntilIdle(worker);
    expect(results[0]).toMatchObject({ status: "checkpoint-orphaned" });
    expect(results.at(-1)).toMatchObject({
      status: "advanced",
      repairedFrom: height - 12n,
    });
    expect(await count("realms_lords_claims")).toBe(2);
  });

  it("halves the range when the page cap is hit and still completes", async () => {
    chain.failPageLimitOnce = true;
    const results = await runUntilIdle(processor());
    expect(results[0]).toMatchObject({
      status: "range-split",
      rangeBlocks: 25n,
    });
    expect(await owners()).toEqual({ "1": "0xb1", "2": "0xa2" });
  });

  it("blocks the stream on a decoder failure without advancing", async () => {
    chain.at(FIRST + 3n).events.push({ ...claim(0xa1n, 1n, 5), data: ["0x1"] });
    await expect(processor().poll()).rejects.toBeInstanceOf(DecodeError);
    expect((await store.loadState(GROUP.id)).processedHash).toBeNull();
  });

  it("rejects a stale writer and a changed fingerprint", async () => {
    await expect(
      store.commit({
        streamId: GROUP.id,
        expected: { height: 5n, hash: "0x5" },
        blocks: [],
        cursor: {
          height: 10n,
          hash: "0xa",
          timestamp: new Date(),
          atHead: true,
        },
        head: 10n,
      }),
    ).rejects.toBeInstanceOf(CursorConflictError);

    await expect(
      store.ensureStream({
        id: GROUP.id,
        network: "mainnet",
        chainId: STARKNET_CHAIN_IDS.mainnet,
        fingerprint: "different",
        startBlock: FIRST,
      }),
    ).rejects.toBeInstanceOf(FingerprintMismatchError);
  });

  it("applies migrations idempotently", async () => {
    expect(await migrate(db as unknown as Queryable, SCHEMA)).toEqual([]);
  });
});
