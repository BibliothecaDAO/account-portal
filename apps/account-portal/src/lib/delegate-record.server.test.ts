import type * as Starknet from "starknet";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { findDelegateRecord } from "./delegate-record.server";

const mocks = vi.hoisted(() => ({
  findDelegate: vi.fn(),
  findProfile: vi.fn(),
  callContract: vi.fn(),
}));

vi.mock("@realms-world/db/client", () => ({
  db: {
    query: {
      delegates: { findFirst: mocks.findDelegate },
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
