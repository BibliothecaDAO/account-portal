import { ChainId } from "@realms-world/constants";

export function resolveStarknetIndexerRuntime(chain: "mainnet" | "sepolia") {
  return chain === "sepolia"
    ? {
        chainId: ChainId.SN_SEPOLIA,
        finality: "pending" as const,
        streamUrl: "https://starknet-sepolia.preview.apibara.org",
      }
    : {
        chainId: ChainId.SN_MAIN,
        finality: "pending" as const,
        streamUrl: "https://starknet.preview.apibara.org",
      };
}
