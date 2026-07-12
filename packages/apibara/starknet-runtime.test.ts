import { describe, expect, it } from "vitest";

import { ChainId } from "@realms-world/constants";

import { resolveStarknetIndexerRuntime } from "./starknet-runtime";

describe("resolveStarknetIndexerRuntime", () => {
  it("maps each supported environment to one chain and stream", () => {
    expect(resolveStarknetIndexerRuntime("mainnet")).toEqual({
      chainId: ChainId.SN_MAIN,
      finality: "pending",
      streamUrl: "https://starknet.preview.apibara.org",
    });
    expect(resolveStarknetIndexerRuntime("sepolia")).toEqual({
      chainId: ChainId.SN_SEPOLIA,
      finality: "pending",
      streamUrl: "https://starknet-sepolia.preview.apibara.org",
    });
  });
});
