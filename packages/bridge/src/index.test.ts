import { describe, expect, it } from "vitest";

import {
  bridgeTokenIdsToNumbers,
  createBridgeEventId,
  decodeBridgePayload,
  normalizeBridgeRequest,
  normalizeL1Address,
  normalizeL2Address,
} from "./index";

describe("bridge request normalization", () => {
  it("joins L1 payloads and L2 structs without losing uint256 limbs", () => {
    const hash = (1n << 200n) + 7n;
    const token = (1n << 180n) + 42n;
    const l2 = normalizeBridgeRequest("mainnet", "withdrawal", {
      reqHash: hash,
      ownerL1: "0x000AbC",
      ownerL2: "0x000123",
      tokenIds: [token, 8n],
    });
    const l1 = decodeBridgePayload(
      "mainnet",
      "withdrawal",
      l2.payload.map(BigInt),
    );
    expect(l1).toEqual(l2);
    expect(l1.reqHash).toBe(hash.toString());
    expect(l1.tokenIds).toEqual([token.toString(), "8"]);
    expect(l1.ownerL1).toBe("0x0000000000000000000000000000000000000abc");
    expect(l1.ownerL2).toBe("0x123");
  });

  it("separates network and direction for the same request hash", () => {
    const input = {
      reqHash: "7",
      ownerL1: "0xabc",
      ownerL2: "0x123",
      tokenIds: ["1"],
    };
    const keys = [
      normalizeBridgeRequest("mainnet", "deposit", input).requestKey,
      normalizeBridgeRequest("mainnet", "withdrawal", input).requestKey,
      normalizeBridgeRequest("sepolia", "deposit", input).requestKey,
    ];
    expect(new Set(keys).size).toBe(3);
  });

  it("rejects incomplete, oversized and mismatched payloads", () => {
    for (const payload of [
      [],
      [1n, 0n, 2n, 3n, 1n],
      [1n << 128n, 0n, 2n, 3n, 0n],
      [1n, 0n, 2n, 3n, 0n, 4n, 0n],
    ]) {
      expect(() =>
        decodeBridgePayload("mainnet", "deposit", payload),
      ).toThrow();
    }
  });

  it("validates addresses and rejects lossy UI token conversions", () => {
    expect(normalizeL1Address("0xAbC")).toBe(normalizeL1Address("2748"));
    expect(normalizeL2Address("0x000ABC")).toBe("0xabc");
    expect(() => normalizeL1Address(1n << 160n)).toThrow();
    expect(() => normalizeL2Address(1n << 251n)).toThrow();
    expect(() => normalizeL2Address("")).toThrow();
    expect(bridgeTokenIdsToNumbers(["1", "8000"])).toEqual([1, 8000]);
    expect(() => bridgeTokenIdsToNumbers(["9007199254740992"])).toThrow();
  });
});

it("event identity distinguishes replacement blocks and multiple logs", () => {
  const id = createBridgeEventId("1", "0xaa", "0xbb", 0);
  expect(id).toBe(createBridgeEventId("1", "0xAA", "0xBB", 0));
  expect(id).not.toBe(createBridgeEventId("1", "0xcc", "0xbb", 0));
  expect(id).not.toBe(createBridgeEventId("1", "0xaa", "0xbb", 1));
});
