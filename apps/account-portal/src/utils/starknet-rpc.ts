import { env } from "env";

/**
 * Starknet JSON-RPC endpoint for reads and server-side verification. Cartridge's public
 * `x/starknet` endpoints now answer 401 (mainnet) and 410 (sepolia), so reads go to Alchemy.
 */
export function getStarknetRpcUrl(network: "mainnet" | "sepolia") {
  return `https://starknet-${network}.g.alchemy.com/starknet/version/rpc/v0_9/${env.VITE_ALCHEMY_API_KEY}`;
}

/** RPC endpoint for the chain this deployment targets (from `VITE_PUBLIC_CHAIN`). */
export const starknetRpcUrl = getStarknetRpcUrl(
  env.VITE_PUBLIC_CHAIN === "sepolia" ? "sepolia" : "mainnet",
);
