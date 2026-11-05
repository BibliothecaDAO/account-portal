import { describe, expect, it } from "vitest";

import type { JsonRpcClient } from "../src/rpc/json-rpc";
import {
  BlockNotFoundError,
  InvalidRpcDataError,
  PageLimitError,
  StarknetReader,
} from "../src/chains/starknet";
import { STARKNET_SELECTORS } from "../src/decoders/starknet";
import { RpcResponseError } from "../src/rpc/json-rpc";

const REALMS = "0x7ae";
const BRIDGE = "0xb41";
const OTHER = "0x0e1";
const HEAD = { number: 120n, hash: "0x120" as const };

interface Filter {
  address: string | string[];
  keys: string[][];
  continuation_token?: string;
  chunk_size: number;
  from_block: unknown;
  to_block: unknown;
}

function rawEvent(
  block: number,
  tx: number,
  index: number,
  address = REALMS,
  selector: string = STARKNET_SELECTORS.Transfer,
) {
  return {
    from_address: address,
    keys: [selector, "0x1", "0x2", "0x5", "0x0"],
    data: [],
    block_hash: `0x${block.toString(16)}`,
    block_number: block,
    transaction_hash: `0x${(block * 100 + tx).toString(16)}`,
    transaction_index: tx,
    event_index: index,
  };
}

/** Serve a fixed event list in chunk-sized pages keyed by numeric tokens. */
function stubRpc(
  events: ReturnType<typeof rawEvent>[],
  options: {
    token?: (next: number) => string;
    seen?: Filter[];
    error?: RpcResponseError;
  } = {},
) {
  const offsets = new Map<string, number>();
  return {
    call: (method: string, params: { filter: Filter }) => {
      if (options.error) return Promise.reject(options.error);
      if (method !== "starknet_getEvents") throw new Error(method);
      const { filter } = params;
      options.seen?.push(filter);
      const addresses = [filter.address].flat();
      const selected = events.filter(
        (event) =>
          addresses.includes(event.from_address) &&
          filter.keys[0]?.includes(event.keys[0] as string),
      );
      const start =
        filter.continuation_token === undefined
          ? 0
          : (offsets.get(filter.continuation_token) ?? NaN);
      const page = selected.slice(start, start + filter.chunk_size);
      const next = start + filter.chunk_size;
      if (next >= selected.length) return Promise.resolve({ events: page });
      const token = options.token?.(next) ?? `t${next}`;
      offsets.set(token, next);
      return Promise.resolve({ events: page, continuation_token: token });
    },
  } as unknown as JsonRpcClient;
}

const range = {
  from: { number: 100n, hash: "0x100" as const },
  to: HEAD,
  filters: [
    {
      address: REALMS as `0x${string}`,
      selectors: [STARKNET_SELECTORS.Transfer],
    },
  ],
  addressList: false,
};

describe("StarknetReader.getEvents", () => {
  it("follows continuation tokens and returns events in canonical order", async () => {
    const seen: Filter[] = [];
    const reader = new StarknetReader(
      stubRpc([rawEvent(110, 1, 0), rawEvent(105, 2, 0), rawEvent(105, 0, 1)], {
        seen,
      }),
    );
    const events = await reader.getEvents({ ...range, chunkSize: 1 });
    expect(events.map((e) => [e.blockNumber, e.transactionIndex])).toEqual([
      [105n, 0],
      [105n, 2],
      [110n, 1],
    ]);
    expect(seen).toHaveLength(3);
    expect(seen[0]?.from_block).toEqual({ block_hash: "0x100" });
    expect(seen[0]?.to_block).toEqual({ block_hash: "0x120" });
  });

  it("keeps distinct identities for event index zero in different transactions", async () => {
    const reader = new StarknetReader(
      stubRpc([rawEvent(105, 0, 0), rawEvent(105, 1, 0)]),
    );
    const events = await reader.getEvents(range);
    expect(events).toHaveLength(2);
  });

  it("refuses a range that needs more pages than allowed", async () => {
    const reader = new StarknetReader(
      stubRpc([rawEvent(101, 0, 0), rawEvent(102, 0, 0), rawEvent(103, 0, 0)]),
    );
    await expect(
      reader.getEvents({ ...range, chunkSize: 1, maxPages: 2 }),
    ).rejects.toBeInstanceOf(PageLimitError);
  });

  it("rejects repeated continuation tokens", async () => {
    const reader = new StarknetReader(
      stubRpc([rawEvent(101, 0, 0), rawEvent(102, 0, 0), rawEvent(103, 0, 0)], {
        token: () => "same",
      }),
    );
    await expect(reader.getEvents({ ...range, chunkSize: 1 })).rejects.toThrow(
      "Repeated continuation token",
    );
  });

  it("rejects missing positions, out-of-range blocks and conflicting hashes", async () => {
    const missing = { ...rawEvent(105, 0, 0), event_index: undefined };
    await expect(
      new StarknetReader(stubRpc([missing as never])).getEvents(range),
    ).rejects.toBeInstanceOf(InvalidRpcDataError);

    await expect(
      new StarknetReader(stubRpc([rawEvent(121, 0, 0)])).getEvents(range),
    ).rejects.toThrow("outside the requested range");

    const conflicting = { ...rawEvent(105, 1, 0), block_hash: "0xdead" };
    await expect(
      new StarknetReader(stubRpc([rawEvent(105, 0, 0), conflicting])).getEvents(
        range,
      ),
    ).rejects.toThrow("Conflicting hashes");
  });

  it("rejects duplicated positions", async () => {
    const reader = new StarknetReader(
      stubRpc([rawEvent(105, 0, 0), rawEvent(105, 0, 0)]),
    );
    await expect(reader.getEvents(range)).rejects.toThrow(
      "Duplicate event position",
    );
  });

  it("detects a range end whose hash changed", async () => {
    const reader = new StarknetReader(
      stubRpc([{ ...rawEvent(120, 0, 0), block_hash: "0x999" }]),
    );
    await expect(reader.getEvents(range)).rejects.toThrow(
      "Range end hash changed",
    );
  });

  it("maps BLOCK_NOT_FOUND to a typed error", async () => {
    const reader = new StarknetReader(
      stubRpc([], {
        error: new RpcResponseError(
          "starknet_getEvents",
          24,
          "Block not found",
          null,
        ),
      }),
    );
    await expect(reader.getEvents(range)).rejects.toBeInstanceOf(
      BlockNotFoundError,
    );
  });

  it("uses one address-list query and drops cross-product pairs", async () => {
    const seen: Filter[] = [];
    const reader = new StarknetReader(
      stubRpc(
        [
          rawEvent(105, 0, 0, REALMS, STARKNET_SELECTORS.Transfer),
          // Bridge emitting a Transfer is in the server cross product, not a filter.
          rawEvent(106, 0, 0, BRIDGE, STARKNET_SELECTORS.Transfer),
          rawEvent(
            107,
            0,
            0,
            BRIDGE,
            STARKNET_SELECTORS.DepositRequestInitiated,
          ),
        ],
        { seen },
      ),
    );
    const events = await reader.getEvents({
      ...range,
      addressList: true,
      filters: [
        { address: REALMS, selectors: [STARKNET_SELECTORS.Transfer] },
        {
          address: BRIDGE,
          selectors: [STARKNET_SELECTORS.DepositRequestInitiated],
        },
      ],
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.address).toEqual([REALMS, BRIDGE]);
    expect(events.map((e) => e.blockNumber)).toEqual([105n, 107n]);
  });

  it("rejects events from addresses that were not requested", async () => {
    const rpc = {
      call: () => Promise.resolve({ events: [rawEvent(105, 0, 0, OTHER)] }),
    } as unknown as JsonRpcClient;
    await expect(new StarknetReader(rpc).getEvents(range)).rejects.toThrow(
      "unrequested address",
    );
  });
});

describe("StarknetReader.getBlockHeader", () => {
  it("refuses blocks without a hash", async () => {
    const rpc = {
      call: () =>
        Promise.resolve({
          block_number: 5,
          timestamp: 1,
          status: "PRE_CONFIRMED",
        }),
    } as unknown as JsonRpcClient;
    await expect(
      new StarknetReader(rpc).getBlockHeader("latest"),
    ).rejects.toThrow("only accepted blocks");
  });

  it("parses accepted headers", async () => {
    const rpc = {
      call: () =>
        Promise.resolve({
          block_number: 5,
          block_hash: "0x05",
          parent_hash: "0x4",
          timestamp: 1_700_000_000,
          status: "ACCEPTED_ON_L2",
        }),
    } as unknown as JsonRpcClient;
    const header = await new StarknetReader(rpc).getBlockHeader({
      block_number: 5,
    });
    expect(header).toEqual({
      number: 5n,
      hash: "0x5",
      parentHash: "0x4",
      timestamp: new Date(1_700_000_000_000),
      status: "ACCEPTED_ON_L2",
    });
  });
});

describe("StarknetReader.readEvents", () => {
  it("counts pages even when pages hold fewer events than the chunk size", async () => {
    let calls = 0;
    const rpc = {
      call: () =>
        Promise.resolve(
          ++calls < 3
            ? { events: [], continuation_token: `t${calls}` }
            : { events: [rawEvent(105, 0, 0)] },
        ),
    } as unknown as JsonRpcClient;
    const read = await new StarknetReader(rpc).readEvents(range);
    expect(read).toMatchObject({ pages: 3 });
    expect(read.events).toHaveLength(1);
  });
});
