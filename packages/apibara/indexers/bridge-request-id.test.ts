import { describe, expect, it } from "vitest";

import {
  bridgeAccountsFromMessagingPayload,
  buildBridgeRequestId,
  buildBridgeRequestIdFromMessagingPayload,
  toDatabaseTokenIds,
} from "./bridge-request-id";

describe("bridge request identifiers", () => {
  it("produces the same id from L1 messaging payloads and L2 request data", () => {
    const requestHash = (7n << 128n) + 5n;
    const tokenId = (3n << 128n) + 11n;
    const messagingPayload = [5n, 7n, 101n, 202n, 1n, 11n, 3n];

    expect(buildBridgeRequestIdFromMessagingPayload(messagingPayload)).toBe(
      buildBridgeRequestId({
        hash: requestHash,
        ownerL1Address: 101n,
        ownerL2Address: 202n,
        tokenIds: [tokenId],
      }),
    );
  });
});

describe("bridgeAccountsFromMessagingPayload", () => {
  const payload = [1n, 0n, 0xabcn, 0xdefn, 0n];

  it("maps and normalizes an L1-to-L2 message", () => {
    expect(
      bridgeAccountsFromMessagingPayload("LogMessageToL2", payload),
    ).toEqual({
      fromAddress: "0x0000000000000000000000000000000000000abc",
      toAddress: "0xdef",
    });
  });

  it("reverses the owners for an L2-to-L1 message", () => {
    expect(
      bridgeAccountsFromMessagingPayload("LogMessageToL1", payload),
    ).toEqual({
      fromAddress: "0xdef",
      toAddress: "0x0000000000000000000000000000000000000abc",
    });
  });
});

describe("toDatabaseTokenIds", () => {
  it("rejects token ids outside the PostgreSQL integer range", () => {
    expect(() => toDatabaseTokenIds([2_147_483_648n])).toThrow(
      "outside the database integer range",
    );
  });
});
