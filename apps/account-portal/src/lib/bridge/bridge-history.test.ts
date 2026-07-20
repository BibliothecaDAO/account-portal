import { describe, expect, it } from "vitest";

import {
  BridgeAccountsSchema,
  ethereumTransactionUrl,
  resolveBridgeOwnerAddresses,
} from "./bridge-history";

describe("BridgeAccountsSchema", () => {
  it("requires at least one connected wallet", () => {
    expect(
      BridgeAccountsSchema.safeParse({
        l1Account: null,
        l2Account: undefined,
      }).success,
    ).toBe(false);
  });

  it("rejects malformed chain addresses", () => {
    expect(
      BridgeAccountsSchema.safeParse({
        l1Account: "0x1' OR 1=1 --",
      }).success,
    ).toBe(false);
    expect(
      BridgeAccountsSchema.safeParse({
        l2Account: "not-a-starknet-address",
      }).success,
    ).toBe(false);
  });

  it("normalizes valid account addresses", () => {
    const result = BridgeAccountsSchema.parse({
      l1Account: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD",
      l2Account: "0xABC123",
    });

    expect(result).toEqual({
      l1Account: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      l2Account: "0xabc123",
    });
  });
});

describe("resolveBridgeOwnerAddresses", () => {
  it("returns chain-specific owners for an L2-to-L1 request", () => {
    expect(
      resolveBridgeOwnerAddresses({
        fromChain: "SN_MAIN",
        l2Chain: "SN_MAIN",
        fromAddress: "0xdef",
        toAddress: "0x0000000000000000000000000000000000000abc",
      }),
    ).toEqual({
      l1Address: "0x0000000000000000000000000000000000000abc",
      l2Address: "0xdef",
    });
  });

  it("returns chain-specific owners for an L1-to-L2 request", () => {
    expect(
      resolveBridgeOwnerAddresses({
        fromChain: "1",
        l2Chain: "SN_MAIN",
        fromAddress: "0x0000000000000000000000000000000000000abc",
        toAddress: "0xdef",
      }),
    ).toEqual({
      l1Address: "0x0000000000000000000000000000000000000abc",
      l2Address: "0xdef",
    });
  });
});

describe("ethereumTransactionUrl", () => {
  it("uses the explorer for the active Ethereum network", () => {
    expect(ethereumTransactionUrl("mainnet", "0xabc")).toBe(
      "https://etherscan.io/tx/0xabc",
    );
    expect(ethereumTransactionUrl("sepolia", "0xabc")).toBe(
      "https://sepolia.etherscan.io/tx/0xabc",
    );
  });
});
