import { describe, expect, it } from "vitest";

import { parseRpcEnv, starknetFilters, starknetGroups } from "../src/config";

describe("network configuration", () => {
  it("translates legacy Apibara cursors into inclusive first blocks", () => {
    const starts = Object.fromEntries(
      starknetFilters("mainnet").map((filter) => [
        filter.id,
        filter.startBlock,
      ]),
    );
    expect(starts).toEqual({
      "realms-transfer": 664_162n,
      "realms-claims": 664_162n,
      "realms-bridge": 664_162n,
      "velords-locks": 699_905n,
      "velords-rewards": 699_905n,
    });
    const sepolia = starknetFilters("sepolia");
    expect(
      sepolia.find((filter) => filter.id === "realms-transfer")?.startBlock,
    ).toBe(0n);
    expect(
      sepolia.find((filter) => filter.id === "velords-locks")?.startBlock,
    ).toBe(76_104n);
  });

  it("uses one group in address-list mode and splits veLORDS otherwise", () => {
    expect(
      starknetGroups("mainnet", "address-list").map((group) => group.id),
    ).toEqual(["starknet"]);
    const split = starknetGroups("mainnet", "individual");
    expect(split.map((group) => [group.id, group.intervalMs])).toEqual([
      ["starknet-fast", 30_000],
      ["starknet-velords", 300_000],
    ]);
    expect(split[1]?.filters.map((filter) => filter.id)).toEqual([
      "velords-locks",
      "velords-rewards",
    ]);
  });

  it("requires an explicit network and hides values in errors", () => {
    expect(() =>
      parseRpcEnv({ STARKNET_RPC_URL: "https://x.example/KEY" }),
    ).toThrow("RPC_INDEXER_NETWORK");
    expect(() =>
      parseRpcEnv({ STARKNET_RPC_URL: "https://x.example/KEY" }),
    ).not.toThrow("KEY");
    expect(
      parseRpcEnv({
        RPC_INDEXER_NETWORK: "sepolia",
        STARKNET_RPC_URL: "https://x.example",
      }),
    ).toMatchObject({
      RPC_INDEXER_NETWORK: "sepolia",
      RPC_TIMEOUT_MS: 20_000,
    });
  });
});
