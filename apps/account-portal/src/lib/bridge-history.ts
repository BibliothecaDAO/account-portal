import type { BridgeEventType, BridgeNetwork } from "@realms-world/bridge";
import type {
  BridgeHistoryEventRow,
  BridgeHistorySnapshot,
} from "@realms-world/db";

import {
  BRIDGE_EVENT_TYPES,
  bridgeTokenIdsToNumbers,
  getBridgeNetworkConfig,
  normalizeBridgeRequest,
} from "@realms-world/bridge";

export type BridgeHistoryStatus =
  | "ready"
  | "legacy"
  | "syncing"
  | "stale"
  | "unavailable";

export interface BridgeHistoryTransaction {
  id: string;
  from_chain: string;
  from_address: string;
  to_address: string;
  owner_l1: string;
  owner_l2: string;
  token_ids: number[];
  req_hash: string;
  timestamp: Date;
  tx_hash: string;
  events: {
    id: string;
    hash: string;
    type: BridgeEventType;
    source_chain: string;
    timestamp: Date;
  }[];
}

export interface BridgeHistoryResponse {
  status: BridgeHistoryStatus;
  network: BridgeNetwork;
  transactions: BridgeHistoryTransaction[];
}

const MAX_PROGRESS_AGE_MS = 5 * 60_000;

function isRecent(value: string | null, now: number) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return (
    Number.isFinite(timestamp) &&
    timestamp <= now + 60_000 &&
    now - timestamp <= MAX_PROGRESS_AGE_MS
  );
}

export function getBridgeHistoryStatus(
  snapshot: BridgeHistorySnapshot,
  network: BridgeNetwork,
  now = Date.now(),
): BridgeHistoryStatus {
  const l1 = snapshot.l1_progress;
  const l2 = snapshot.l2_progress;
  if (!l1 || !l2) return "unavailable";
  if (
    l2.network !== network ||
    l2.source_chain !== getBridgeNetworkConfig(network).l2ChainId
  )
    return "unavailable";
  if (!l1.ready_at || l2.production !== "live") return "syncing";
  if (!/^\d+$/.test(l1.block_number) || !/^\d+$/.test(l1.source_block))
    return "unavailable";
  const lag = BigInt(l1.source_block) - BigInt(l1.block_number);
  if (
    lag < 0n ||
    lag > 25n ||
    !isRecent(l1.block_timestamp, now) ||
    !isRecent(l2.block_timestamp, now) ||
    !isRecent(l2.observed_at, now)
  ) {
    return "stale";
  }
  return "ready";
}

function compareEvents(a: BridgeHistoryEventRow, b: BridgeHistoryEventRow) {
  return (
    Date.parse(a.timestamp) - Date.parse(b.timestamp) ||
    a.source_chain.localeCompare(b.source_chain) ||
    (BigInt(a.block_number) < BigInt(b.block_number)
      ? -1
      : BigInt(a.block_number) > BigInt(b.block_number)
        ? 1
        : 0) ||
    a.log_index - b.log_index ||
    a.id.localeCompare(b.id)
  );
}

/** Rebuild the response from current rows so a source rollback removes its evidence. */
export function mergeBridgeHistory(
  rows: readonly BridgeHistoryEventRow[],
  network: BridgeNetwork,
): BridgeHistoryTransaction[] {
  const route = getBridgeNetworkConfig(network);
  const requests = new Map<
    string,
    {
      request: ReturnType<typeof normalizeBridgeRequest>;
      events: BridgeHistoryEventRow[];
    }
  >();
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.network !== network)
      throw new Error("Bridge history contains a different network");
    if (
      row.source_chain !== String(route.l1ChainId) &&
      row.source_chain !== route.l2ChainId
    ) {
      throw new Error("Bridge history contains an unexpected source chain");
    }
    if (
      !BRIDGE_EVENT_TYPES.includes(row.type as BridgeEventType) ||
      !Number.isFinite(Date.parse(row.timestamp)) ||
      !/^\d+$/.test(row.block_number)
    ) {
      throw new Error("Invalid bridge history event");
    }
    const request = normalizeBridgeRequest(network, row.direction, {
      reqHash: row.req_hash,
      ownerL1: row.owner_l1,
      ownerL2: row.owner_l2,
      tokenIds: row.token_ids,
    });
    if (
      request.requestKey !== row.request_key ||
      JSON.stringify(request.payload) !== JSON.stringify(row.payload)
    ) {
      throw new Error("Bridge history request does not match its payload");
    }
    const serialized = JSON.stringify(row);
    const previous = seen.get(row.id);
    if (previous !== undefined) {
      if (previous !== serialized)
        throw new Error("Conflicting bridge event identity");
      continue;
    }
    seen.set(row.id, serialized);
    const existing = requests.get(request.requestKey);
    if (existing) {
      if (
        JSON.stringify(existing.request.payload) !==
        JSON.stringify(request.payload)
      ) {
        throw new Error("Conflicting bridge request payloads");
      }
      existing.events.push(row);
    } else {
      requests.set(request.requestKey, { request, events: [row] });
    }
  }
  return Array.from(requests.values(), ({ request, events }) => {
    events.sort(compareEvents);
    const initiationType =
      request.direction === "deposit"
        ? "deposit_initiated_l1"
        : "deposit_initiated_l2";
    const origin =
      events.find((event) => event.type === initiationType) ?? events[0];
    if (!origin) throw new Error("Bridge request has no events");
    const isDeposit = request.direction === "deposit";
    return {
      id: request.requestKey,
      from_chain: isDeposit ? String(route.l1ChainId) : route.l2ChainId,
      from_address: isDeposit ? request.ownerL1 : request.ownerL2,
      to_address: isDeposit ? request.ownerL2 : request.ownerL1,
      owner_l1: request.ownerL1,
      owner_l2: request.ownerL2,
      token_ids: bridgeTokenIdsToNumbers(request.tokenIds),
      req_hash: request.reqHash,
      timestamp: new Date(origin.timestamp),
      tx_hash: origin.transaction_hash,
      events: events.map((event) => ({
        id: event.id,
        hash: event.transaction_hash,
        type: event.type as BridgeEventType,
        source_chain: event.source_chain,
        timestamp: new Date(event.timestamp),
      })),
    };
  }).sort(
    (a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime() || a.id.localeCompare(b.id),
  );
}

export function getBridgeEventExplorer(
  network: BridgeNetwork,
  sourceChain: string,
  hash: string,
) {
  const route = getBridgeNetworkConfig(network);
  if (sourceChain === String(route.l1ChainId)) {
    return {
      name: "Etherscan",
      url: `https://${network === "sepolia" ? "sepolia." : ""}etherscan.io/tx/${hash}`,
    };
  }
  if (sourceChain === route.l2ChainId) {
    return {
      name: "Starkscan",
      url: `https://${network === "sepolia" ? "sepolia." : ""}starkscan.co/tx/${hash}`,
    };
  }
  throw new Error("Unexpected bridge event source chain");
}
