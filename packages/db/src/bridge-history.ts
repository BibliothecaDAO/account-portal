import type { BridgeDirection, BridgeNetwork } from "@realms-world/bridge";
import { sql } from "drizzle-orm";

import { normalizeL1Address, normalizeL2Address } from "@realms-world/bridge";

export interface BridgeHistoryEventRow {
  id: string;
  request_key: string;
  network: BridgeNetwork;
  direction: BridgeDirection;
  req_hash: string;
  owner_l1: string;
  owner_l2: string;
  token_ids: string[];
  payload: string[];
  source_chain: string;
  event_name: string;
  type: string;
  block_number: string;
  block_hash: string;
  transaction_hash: string;
  log_index: number;
  timestamp: string;
}
export interface BridgeHistorySnapshot {
  events: BridgeHistoryEventRow[];
  l1_progress: {
    block_number: string;
    block_timestamp: string | null;
    source_block: string;
    ready_at: string | null;
  } | null;
  l2_progress: {
    network: BridgeNetwork;
    source_chain: string;
    block_number: string;
    block_hash: string;
    block_timestamp: string;
    observed_at: string;
    production: "live" | "backfill" | "unknown";
  } | null;
}

/** One statement/one MVCC snapshot, including rollback-sensitive progress.
 * HyperIndex owns its tables: intentionally use quoted read-only SQL identifiers,
 * never register external mappings in the Drizzle migration schema.
 * Match wallets to request keys first, then return all evidence for those keys
 * so an owner conflict cannot be hidden by the wallet predicate.
 * Its progress timestamp is chain time, NOT a worker heartbeat. Consumers must
 * fail closed on old chain time, source lag or absent readiness.
 */
export function buildBridgeHistorySnapshotQuery(input: {
  network: BridgeNetwork;
  l1Schema: string;
  l1Account?: string;
  l2Account?: string;
}) {
  const { network, l1Schema } = input;
  if (
    !["mainnet", "sepolia"].includes(network) ||
    l1Schema.length > 63 ||
    !new RegExp(`^hyperindex_l1_${network}(?:_[a-z0-9]+)?$`).test(l1Schema)
  ) {
    throw new Error(
      "Bridge history schema is not allowlisted for this network",
    );
  }
  const ownerL1 =
    input.l1Account === undefined ? null : normalizeL1Address(input.l1Account);
  const ownerL2 =
    input.l2Account === undefined ? null : normalizeL2Address(input.l2Account);
  const events = sql`${sql.identifier(l1Schema)}.${sql.identifier("L1BridgeEvent")}`;
  const chains = sql`${sql.identifier(l1Schema)}.${sql.identifier("envio_chains")}`;
  return sql`
    WITH matching_requests AS (
      SELECT request_key FROM ${events}
      WHERE network = ${network} AND (owner_l1 = ${ownerL1} OR owner_l2 = ${ownerL2})
      UNION
      SELECT request_key FROM public.l2_bridge_events
      WHERE network = ${network} AND (owner_l1 = ${ownerL1} OR owner_l2 = ${ownerL2})
    ), bridge_events AS (
      SELECT id, request_key, network, direction, req_hash, owner_l1, owner_l2,
        token_ids, payload, source_chain, event_name, type,
        block_number::text, block_hash, transaction_hash, log_index,
        timestamp
      FROM ${events}
      WHERE network = ${network} AND request_key IN (SELECT request_key FROM matching_requests)
      UNION ALL
      SELECT _id AS id, request_key, network, direction, req_hash, owner_l1, owner_l2,
        token_ids, payload, source_chain, event_name, type,
        block_number::text, block_hash, transaction_hash, log_index, timestamp
      FROM public.l2_bridge_events
      WHERE network = ${network} AND request_key IN (SELECT request_key FROM matching_requests)
    )
    SELECT
      COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY timestamp, id) FROM bridge_events e), '[]'::jsonb) AS events,
      (SELECT jsonb_build_object('block_number', progress_block::text,
        'block_timestamp', progress_block_time, 'source_block', source_block::text,
        'ready_at', ready_at) FROM ${chains} WHERE id = ${network === "mainnet" ? 1 : 11155111}) AS l1_progress,
      (SELECT (to_jsonb(p) - '_id') || jsonb_build_object('block_number', p.block_number::text) FROM public.l2_bridge_progress p WHERE network = ${network}) AS l2_progress
  `;
}
