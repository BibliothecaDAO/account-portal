import { z } from "zod";

import {
  ChainId,
  CollectionAddresses,
  REALMS_BRIDGE_ADDRESS,
  StakingAddresses,
} from "@realms-world/constants";

import type { StarknetEventFilter } from "./chains/starknet";
import type { StarknetEventKind } from "./decoders/starknet";
import type { Felt } from "./felt";
import { STARKNET_SELECTORS } from "./decoders/starknet";
import { normalizeFelt } from "./felt";

export const NETWORKS = ["mainnet", "sepolia"] as const;
export type Network = (typeof NETWORKS)[number];

export type StarknetDomain = "ownership" | "claims" | "bridge" | "velords";
export type StarknetQueryMode = "address-list" | "individual";

export interface StarknetFilterConfig extends StarknetEventFilter {
  id: string;
  domain: StarknetDomain;
  kinds: StarknetEventKind[];
  /** Inclusive first block for this filter. */
  startBlock: bigint;
}

export interface StarknetGroupConfig {
  id: string;
  intervalMs: number;
  filters: StarknetFilterConfig[];
}

// Inclusive first blocks, translated from the legacy Apibara starting cursors
// (Apibara streams the block after its cursor, so cursor N becomes N + 1).
// Sepolia ownership used cursor 0; starting at block 0 is a harmless superset
// because the Realms contract was deployed long after genesis.
const START_BLOCKS: Record<Network, Record<StarknetDomain, bigint>> = {
  mainnet: {
    ownership: 664_162n,
    claims: 664_162n,
    bridge: 664_162n,
    velords: 699_905n,
  },
  sepolia: {
    ownership: 0n,
    claims: 76_104n,
    bridge: 76_104n,
    velords: 76_104n,
  },
};

export const STARKNET_CHAIN_IDS: Record<Network, Felt> = {
  mainnet: normalizeFelt(ChainId.SN_MAIN),
  sepolia: normalizeFelt(ChainId.SN_SEPOLIA),
};

function address(value: string | undefined, name: string): Felt {
  if (!value) throw new Error(`Missing ${name} address`);
  return normalizeFelt(value, `${name} address`);
}

export function starknetFilters(network: Network): StarknetFilterConfig[] {
  const chain = network === "mainnet" ? ChainId.SN_MAIN : ChainId.SN_SEPOLIA;
  const starts = START_BLOCKS[network];
  const realms = address(CollectionAddresses.realms[chain], "Realms");
  const bridge = address(REALMS_BRIDGE_ADDRESS[chain], "Realms bridge");
  const velords = address(StakingAddresses.velords[chain], "veLORDS");
  const rewardPool = address(StakingAddresses.rewardpool[chain], "reward pool");

  const filter = (
    id: string,
    domain: StarknetDomain,
    filterAddress: Felt,
    kinds: StarknetEventKind[],
  ): StarknetFilterConfig => ({
    id,
    domain,
    address: filterAddress,
    kinds,
    selectors: kinds.map((kind) => STARKNET_SELECTORS[kind]),
    startBlock: starts[domain],
  });

  return [
    filter("realms-transfer", "ownership", realms, ["Transfer"]),
    filter("realms-claims", "claims", realms, ["RewardClaimed"]),
    filter("realms-bridge", "bridge", bridge, [
      "DepositRequestInitiated",
      "WithdrawRequestCompleted",
    ]),
    filter("velords-locks", "velords", velords, ["ModifyLock"]),
    filter("velords-rewards", "velords", rewardPool, ["RewardReceived"]),
  ];
}

/**
 * One group when address lists are verified (veLORDS rides the same query for
 * free); otherwise a fast group and a slow veLORDS group, which is cheaper
 * than adding two individual queries to every 30-second poll.
 */
export function starknetGroups(
  network: Network,
  mode: StarknetQueryMode,
  intervals: { fastMs: number; slowMs: number } = {
    fastMs: 30_000,
    slowMs: 300_000,
  },
): StarknetGroupConfig[] {
  const filters = starknetFilters(network);
  if (mode === "address-list") {
    return [{ id: "starknet", intervalMs: intervals.fastMs, filters }];
  }
  return [
    {
      id: "starknet-fast",
      intervalMs: intervals.fastMs,
      filters: filters.filter((filter) => filter.domain !== "velords"),
    },
    {
      id: "starknet-velords",
      intervalMs: intervals.slowMs,
      filters: filters.filter((filter) => filter.domain === "velords"),
    },
  ];
}

const rpcEnvSchema = z.object({
  // No default: a missing network must never silently select mainnet.
  RPC_INDEXER_NETWORK: z.enum(NETWORKS),
  STARKNET_RPC_URL: z.string().url(),
  STARKNET_RPC_LABEL: z.string().min(1).default("starknet-rpc"),
  RPC_TIMEOUT_MS: z.coerce.number().int().positive().default(20_000),
  RPC_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
});

export type RpcEnv = z.infer<typeof rpcEnvSchema>;

export function parseRpcEnv(env: NodeJS.ProcessEnv): RpcEnv {
  const result = rpcEnvSchema.safeParse(env);
  if (!result.success) {
    // Report variable names only; values may contain API keys.
    const fields = result.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Invalid RPC indexer configuration: ${fields.join(", ")}`);
  }
  return result.data;
}
