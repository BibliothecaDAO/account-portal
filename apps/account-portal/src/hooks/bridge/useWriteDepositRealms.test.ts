import type { PublicClient } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("env", () => ({
  env: {
    VITE_PUBLIC_CHAIN: "mainnet",
    VITE_PUBLIC_NODE_URL: "https://starknet.test/rpc",
  },
}));

const { quoteDepositMessageFee } = await import("./useWriteDepositRealms");

const STARKNET_MIN_MESSAGE_FEE = 50_000_000_000_000n;

const ethereum = {
  readContract: () => Promise.resolve(STARKNET_MIN_MESSAGE_FEE),
} as unknown as Pick<PublicClient, "readContract">;

const message = {
  l1BridgeAddress: "0xA425Fa1678f7A5DaFe775bEa3F225c4129cdbD25",
  l2BridgeAddress:
    0x13ae4e41ff29ee8311c84b024ac59a0c13f73fa1ba0cea02fbbf7880ec4835an,
  l2BridgeSelector:
    0x3593216f3a8b22f4cf375e5486e3d13bfde9d0f26976d20ac6f653c73f7e507n,
  payload: [1n, 2n, 3n, 4n, 1n, 1n, 0n],
} as const;

function quote() {
  return quoteDepositMessageFee(ethereum, {
    ...message,
    payload: [...message.payload],
  });
}

function answerStarknetRpc(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(body)))),
  );
}

function answerStarknetFee(overallFee: string) {
  answerStarknetRpc({
    jsonrpc: "2.0",
    id: 1,
    result: { overall_fee: overallFee, unit: "WEI" },
  });
}

describe("deposit message fee", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pays Starknet's minimum when the estimate is below it", async () => {
    answerStarknetFee("0x17c4bcbf5c30");

    await expect(quote()).resolves.toBe(STARKNET_MIN_MESSAGE_FEE);
  });

  it("pays Starknet's estimate plus 20% above the minimum", async () => {
    answerStarknetFee("0x5af3107a4000");

    await expect(quote()).resolves.toBe(120_000_000_000_000n);
  });

  it("refuses a deposit that Starknet would revert", async () => {
    answerStarknetRpc({
      jsonrpc: "2.0",
      id: 1,
      error: {
        code: 40,
        message: "Contract error",
        data: {
          revert_error:
            "Insufficient max L1Gas: max amount: 40000, actual used: 42243.",
        },
      },
    });

    await expect(quote()).rejects.toThrow(
      "Starknet would reject this deposit: Insufficient max L1Gas: max amount: 40000, actual used: 42243.",
    );
  });
});
