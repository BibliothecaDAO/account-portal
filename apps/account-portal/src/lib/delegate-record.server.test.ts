import type * as Starknet from "starknet";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { findDelegateList, findDelegateRecord } from "./delegate-record.server";

const mocks = vi.hoisted(() => ({
  findDelegate: vi.fn(),
  findProfile: vi.fn(),
  findDelegates: vi.fn(),
  callContract: vi.fn(),
  selectResults: [] as unknown[][],
}));

/** Stands in for a drizzle select chain, resolving to the next queued result. */
function selectChain() {
  const chain: Record<string, unknown> = {};
  for (const method of ["from", "leftJoin", "where", "orderBy", "limit"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve: (rows: unknown[]) => void) =>
    resolve(mocks.selectResults.shift() ?? []);
  return chain;
}

vi.mock("@realms-world/db/client", () => ({
  db: {
    select: () => selectChain(),
    query: {
      delegates: { findFirst: mocks.findDelegate, findMany: mocks.findDelegates },
      delegateProfiles: { findFirst: mocks.findProfile },
    },
  },
}));
vi.mock("starknet", async (importOriginal) => ({
  ...(await importOriginal<typeof Starknet>()),
  RpcProvider: vi.fn(() => ({ callContract: mocks.callContract })),
}));

const short = "0x269cb810bc22316f8e6a53d164398e83f8255f7e980621f6083e5f7bad74fa0";
const padded = "0x0269cb810bc22316f8e6a53d164398e83f8255f7e980621f6083e5f7bad74fa0";

describe("findDelegateRecord", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the indexed row when there is one", async () => {
    const row = { id: "1", user: padded, delegatedVotes: "9" };
    mocks.findDelegate.mockResolvedValue(row);

    await expect(findDelegateRecord(short)).resolves.toBe(row);
    expect(mocks.callContract).not.toHaveBeenCalled();
  });

  it("builds an unindexed delegate from the chain and the saved profile", async () => {
    const profile = { statement: "building realms games" };
    mocks.findDelegate.mockResolvedValue(undefined);
    mocks.findProfile.mockResolvedValue(profile);
    mocks.callContract.mockResolvedValue(["0x2", "0x0"]);

    await expect(findDelegateRecord(short)).resolves.toEqual({
      id: padded,
      user: padded,
      delegatedVotes: "2",
      tokenHoldersRepresentedAmount: null,
      delegateProfile: profile,
    });
  });

  it("fails rather than reporting zero votes when the chain read fails", async () => {
    mocks.findDelegate.mockResolvedValue(undefined);
    mocks.findProfile.mockResolvedValue(null);
    mocks.callContract.mockRejectedValue(new Error("rpc down"));

    await expect(findDelegateRecord(short)).rejects.toThrow("rpc down");
  });
});

describe("with DELEGATES_INDEXER_READS on", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectResults = [];
    vi.stubEnv("DELEGATES_INDEXER_READS", "true");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the record from the new table, not the frozen one", async () => {
    const profile = { statement: "hi" };
    mocks.selectResults = [
      [{ address: padded, votes: "7", holders: 2, delegateProfile: profile }],
    ];

    await expect(findDelegateRecord(short)).resolves.toEqual({
      id: padded,
      user: padded,
      delegatedVotes: "7",
      tokenHoldersRepresentedAmount: 2,
      delegateProfile: profile,
    });
    expect(mocks.findDelegate).not.toHaveBeenCalled();
    expect(mocks.callContract).not.toHaveBeenCalled();
  });

  it("falls back to the chain for a delegate with no row", async () => {
    mocks.findProfile.mockResolvedValue(null);
    mocks.callContract.mockResolvedValue(["0x2", "0x0"]);

    await expect(findDelegateRecord(short)).resolves.toMatchObject({
      delegatedVotes: "2",
    });
  });

  it("lists a profile with no row at a known 0 votes", async () => {
    const profile = { delegateId: short, statement: "new here" };
    mocks.selectResults = [
      [{ address: "0xrow", votes: "7", holders: 2, delegateProfile: null }],
      [profile],
    ];

    const { items } = await findDelegateList({ limit: 10, orderBy: "desc" });
    expect(items).toEqual([
      {
        id: "0xrow",
        user: "0xrow",
        delegatedVotes: "7",
        tokenHoldersRepresentedAmount: 2,
        delegateProfile: null,
      },
      {
        id: padded,
        user: padded,
        delegatedVotes: "0",
        tokenHoldersRepresentedAmount: 0,
        delegateProfile: profile,
      },
    ]);
    expect(mocks.findDelegates).not.toHaveBeenCalled();
  });
});

describe("with DELEGATES_INDEXER_READS off", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectResults = [];
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, "", "false", "1", "TRUE"])(
    "stays on the frozen table when the flag is %s",
    async (value) => {
      if (value !== undefined) vi.stubEnv("DELEGATES_INDEXER_READS", value);
      const row = { id: "1", user: padded, delegatedVotes: "9" };
      mocks.findDelegate.mockResolvedValue(row);

      await expect(findDelegateRecord(short)).resolves.toBe(row);
    },
  );

  it("lists a profile with no row with unknown votes, and skips a bad address", async () => {
    const profile = { delegateId: short, statement: "new here" };
    mocks.findDelegates.mockResolvedValue([
      {
        id: "gov/0xrow",
        user: "0xrow",
        delegatedVotes: "9.00000000000000000000",
        tokenHoldersRepresentedAmount: 3,
        delegateProfile: null,
      },
    ]);
    mocks.selectResults = [
      [profile, { delegateId: "0xnot-an-address", statement: "x" }],
    ];

    const { items } = await findDelegateList({ limit: 10, orderBy: "desc" });
    expect(items.map((item) => [item.id, item.delegatedVotes])).toEqual([
      ["gov/0xrow", "9.00000000000000000000"],
      [padded, null],
    ]);
    expect(items[1]?.tokenHoldersRepresentedAmount).toBeNull();
  });
});
