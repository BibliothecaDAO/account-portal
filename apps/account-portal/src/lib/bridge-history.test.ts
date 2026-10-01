import type {
  BridgeHistoryEventRow,
  BridgeHistorySnapshot,
} from "@realms-world/db";
import { describe, expect, it } from "vitest";

import {
  getBridgeNetworkConfig,
  normalizeBridgeRequest,
} from "@realms-world/bridge";

import {
  getBridgeEventExplorer,
  getBridgeHistoryStatus,
  mergeBridgeHistory,
} from "./bridge-history";

const request = normalizeBridgeRequest("mainnet", "withdrawal", {
  reqHash: "123456789012345678901234567890",
  ownerL1: "0xabc",
  ownerL2: "0x123456789abc",
  tokenIds: ["4", "8"],
});
const event = (
  overrides: Partial<BridgeHistoryEventRow> = {},
): BridgeHistoryEventRow => ({
  id: "l1-event",
  request_key: request.requestKey,
  network: "mainnet",
  direction: "withdrawal",
  req_hash: request.reqHash,
  owner_l1: request.ownerL1,
  owner_l2: request.ownerL2,
  token_ids: request.tokenIds,
  payload: request.payload,
  source_chain: "1",
  event_name: "LogMessageToL1",
  type: "withdraw_available_l1",
  block_number: "22000000",
  block_hash: "0xaa",
  transaction_hash: "0xbb",
  log_index: 0,
  timestamp: "2026-09-30T00:00:00Z",
  ...overrides,
});

describe("combined bridge history", () => {
  const initiation = event({
    id: "l2-event",
    source_chain: getBridgeNetworkConfig("mainnet").l2ChainId,
    type: "deposit_initiated_l2",
    event_name: "DepositRequestInitiated",
    timestamp: "2026-09-29T23:00:00Z",
  });

  it("produces the same request for either arrival order and explicit withdrawal owners", () => {
    const history = mergeBridgeHistory([event(), initiation], "mainnet");
    expect(history).toEqual(
      mergeBridgeHistory([initiation, event()], "mainnet"),
    );
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      owner_l1: request.ownerL1,
      owner_l2: request.ownerL2,
      from_address: request.ownerL2,
      to_address: request.ownerL1,
      req_hash: request.reqHash,
      token_ids: [4, 8],
      timestamp: new Date(initiation.timestamp),
    });
  });

  it("reflects a rollback without removing the other source or preserving completion", () => {
    const completion = event({
      id: "completed",
      type: "withdraw_completed_l1",
    });
    expect(
      mergeBridgeHistory([initiation, event(), completion], "mainnet")[0]
        ?.events,
    ).toHaveLength(3);
    const after = mergeBridgeHistory([initiation], "mainnet")[0];
    expect(after?.events.map((e) => e.type)).toEqual(["deposit_initiated_l2"]);
    expect(after?.owner_l1).toBe(request.ownerL1);
  });

  it("deduplicates exact replay while rejecting inconsistent or cross-network evidence", () => {
    expect(
      mergeBridgeHistory([event(), event()], "mainnet")[0]?.events,
    ).toHaveLength(1);
    expect(() =>
      mergeBridgeHistory([event({ network: "sepolia" })], "mainnet"),
    ).toThrow();
    expect(() =>
      mergeBridgeHistory(
        [event(), event({ transaction_hash: "0xcc" })],
        "mainnet",
      ),
    ).toThrow();
    expect(() =>
      mergeBridgeHistory([event({ owner_l1: "0xdef" })], "mainnet"),
    ).toThrow();
  });

  it("uses physical source chain rather than event status suffix for explorer links", () => {
    expect(getBridgeEventExplorer("mainnet", "1", "0xabc").url).toBe(
      "https://etherscan.io/tx/0xabc",
    );
    expect(getBridgeEventExplorer("sepolia", "11155111", "0xabc").url).toBe(
      "https://sepolia.etherscan.io/tx/0xabc",
    );
  });
});

describe("bridge history readiness", () => {
  const now = Date.parse("2026-09-30T00:00:00Z");
  const snapshot = (): BridgeHistorySnapshot => ({
    events: [],
    l1_progress: {
      block_number: "100",
      block_timestamp: new Date(now).toISOString(),
      source_block: "100",
      ready_at: new Date(now).toISOString(),
    },
    l2_progress: {
      network: "mainnet",
      source_chain: getBridgeNetworkConfig("mainnet").l2ChainId,
      block_number: "10",
      block_hash: "0xaa",
      block_timestamp: new Date(now).toISOString(),
      observed_at: new Date(now).toISOString(),
      production: "live",
    },
  });
  it("can be ready with zero matching bridge events", () => {
    expect(getBridgeHistoryStatus(snapshot(), "mainnet", now)).toBe("ready");
  });
  it("fails closed for missing, lagging, stopped and still-syncing sources", () => {
    expect(
      getBridgeHistoryStatus(
        { ...snapshot(), l1_progress: null },
        "mainnet",
        now,
      ),
    ).toBe("unavailable");
    expect(
      getBridgeHistoryStatus(snapshot(), "mainnet", now + 6 * 60_000),
    ).toBe("stale");
    const otherChain = snapshot();
    if (otherChain.l2_progress)
      otherChain.l2_progress.source_chain =
        getBridgeNetworkConfig("sepolia").l2ChainId;
    expect(getBridgeHistoryStatus(otherChain, "mainnet", now)).toBe(
      "unavailable",
    );
    expect(getBridgeHistoryStatus(snapshot(), "sepolia", now)).toBe(
      "unavailable",
    );
    const syncing = snapshot();
    if (syncing.l1_progress) syncing.l1_progress.ready_at = null;
    expect(getBridgeHistoryStatus(syncing, "mainnet", now)).toBe("syncing");
    const lagging = snapshot();
    if (lagging.l1_progress) lagging.l1_progress.source_block = "200";
    expect(getBridgeHistoryStatus(lagging, "mainnet", now)).toBe("stale");
  });
});
