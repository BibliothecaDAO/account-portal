import { hash } from "starknet";
import { describe, expect, it } from "vitest";

import type { StarknetEvent } from "../src/chains/starknet";
import type { Felt } from "../src/felt";
import {
  toLegacyClaimRow,
  toLegacyLockRow,
  toLegacyOwnership,
  toLegacyRewardReceivedRow,
} from "../src/decoders/legacy";
import {
  DecodeError,
  decodeStarknetEvent,
  STARKNET_SELECTORS,
} from "../src/decoders/starknet";

function event(keys: string[], data: string[] = []): StarknetEvent {
  return {
    blockNumber: 700_000n,
    blockHash: "0xb10c",
    transactionHash: "0xabc",
    transactionIndex: 3,
    eventIndexInTransaction: 1,
    fromAddress: "0x1",
    keys: keys as Felt[],
    data: data as Felt[],
  };
}

const context = {
  transactionHash: 0xabcn,
  timestamp: new Date("2026-10-28T00:00:00Z"),
};
const padded = (hex: string) => `0x${hex.padStart(64, "0")}`;

describe("Starknet decoders", () => {
  it("has selectors equal to starknet_keccak of each event name", () => {
    for (const [name, selector] of Object.entries(STARKNET_SELECTORS)) {
      expect(selector).toBe(
        `0x${BigInt(hash.getSelectorFromName(name)).toString(16)}`,
      );
    }
  });

  it("decodes Realm transfers, mints and burns", () => {
    const transfer = decodeStarknetEvent(
      event([STARKNET_SELECTORS.Transfer, "0x0", "0x0AbC", "0x2a", "0x0"]),
    );
    expect(transfer).toEqual({
      kind: "Transfer",
      from: 0n,
      to: 0xabcn,
      tokenId: 42n,
    });
    expect(toLegacyOwnership(transfer as never)).toEqual({
      tokenId: "42",
      owner: "0xabc",
      burned: false,
    });

    const burn = decodeStarknetEvent(
      event([STARKNET_SELECTORS.Transfer, "0xabc", "0x0", "0x2a", "0x0"]),
    );
    expect(toLegacyOwnership(burn as never)).toEqual({
      tokenId: "42",
      owner: null,
      burned: true,
    });
  });

  it("decodes claims with exact u256 amounts and padded legacy values", () => {
    const amount = 10n ** 30n + 7n;
    const low = `0x${(amount & ((1n << 128n) - 1n)).toString(16)}`;
    const high = `0x${(amount >> 128n).toString(16)}`;
    const decoded = decodeStarknetEvent(
      event([STARKNET_SELECTORS.RewardClaimed, "0x123"], [low, high]),
    );
    expect(decoded).toEqual({
      kind: "RewardClaimed",
      recipient: 0x123n,
      amount,
    });
    expect(toLegacyClaimRow(decoded as never, context)).toEqual({
      _id: padded("abc"),
      hash: padded("abc"),
      recipient: padded("123"),
      amount: amount.toString(),
      timestamp: context.timestamp,
    });
  });

  it("decodes veLORDS locks and rewards", () => {
    const lock = decodeStarknetEvent(
      event(
        [STARKNET_SELECTORS.ModifyLock, "0xca11", "0x0e"],
        ["0x64", "0x6553f100"],
      ),
    );
    expect(lock).toEqual({
      kind: "ModifyLock",
      caller: 0xca11n,
      owner: 0xen,
      amount: 100n,
      endTime: 1_700_000_000n,
    });
    expect(toLegacyLockRow(lock as never, context)).toMatchObject({
      owner: padded("e"),
      amount: "100",
      end_time: 1_700_000_000,
    });

    const reward = decodeStarknetEvent(
      event([STARKNET_SELECTORS.RewardReceived, "0x5e"], ["0x1", "0x0"]),
    );
    expect(toLegacyRewardReceivedRow(reward as never, context)).toMatchObject({
      sender: padded("5e"),
      amount: "1",
      transaction_hash: padded("abc"),
    });
  });

  it("decodes bridge requests with several token IDs", () => {
    const decoded = decodeStarknetEvent(
      event(
        [
          STARKNET_SELECTORS.DepositRequestInitiated,
          "0x11",
          "0x0",
          "0x6553f100",
        ],
        ["0x11", "0x0", "0xe0a", "0x12", "0x2", "0x1", "0x0", "0x2", "0x0"],
      ),
    );
    expect(decoded).toEqual({
      kind: "DepositRequestInitiated",
      hash: 0x11n,
      blockTimestamp: 1_700_000_000n,
      request: {
        hash: 0x11n,
        ownerL1: 0xe0an,
        ownerL2: 0x12n,
        tokenIds: [1n, 2n],
      },
    });
  });

  it("fails loudly on layout changes and unknown selectors", () => {
    expect(() =>
      decodeStarknetEvent(
        event([STARKNET_SELECTORS.RewardClaimed, "0x1"], ["0x1"]),
      ),
    ).toThrow(DecodeError);
    expect(() =>
      decodeStarknetEvent(
        event(
          [STARKNET_SELECTORS.WithdrawRequestCompleted, "0x11", "0x0", "0x1"],
          ["0x11", "0x0", "0xe0a", "0x12", "0x2", "0x1", "0x0"],
        ),
      ),
    ).toThrow("ids length");
    expect(() => decodeStarknetEvent(event(["0x1234"]))).toThrow("no decoder");
  });
});
