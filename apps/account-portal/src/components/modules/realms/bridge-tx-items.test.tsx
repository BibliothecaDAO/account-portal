import type { BridgeHistoryResponse } from "@/lib/bridge-history";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BridgeTransactionItems from "./bridge-tx-items";

const state = vi.hoisted(() => ({
  data: null as BridgeHistoryResponse | null,
  isRefetchError: false,
  dataUpdatedAt: Date.now(),
}));
vi.mock("@tanstack/react-query", () => ({ useSuspenseQuery: () => state }));
vi.mock("@/lib/getBridgeTransactions", () => ({
  getBridgeTransactionsQueryOptions: () => ({}),
}));
vi.mock("@/hooks/bridge/useWriteFinalizeWithdrawRealms", () => ({
  useWriteFinalizeWithdrawRealms: () => ({
    writeAsync: vi.fn(),
    isPending: false,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("wagmi", () => ({ useAccount: () => ({ address: "0xabc" }) }));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xdef" }),
}));
vi.mock("./bridge-tx-chains", () => ({
  TransactionChains: () => "Starknet → Ethereum",
}));

describe("bridge withdrawal availability", () => {
  beforeEach(() => {
    state.isRefetchError = false;
    state.data = {
      status: "ready",
      network: "mainnet",
      transactions: [
        {
          id: "request",
          from_chain: "0x534e5f4d41494e",
          from_address: "0xdef",
          to_address: "0xabc",
          owner_l1: "0xabc",
          owner_l2: "0xdef",
          req_hash: "100",
          token_ids: [4],
          timestamp: new Date("2026-09-30T00:00:00Z"),
          tx_hash: "0x123",
          events: [
            {
              id: "l1",
              hash: "0x123",
              type: "withdraw_available_l1",
              source_chain: "1",
              timestamp: new Date("2026-09-30T00:00:00Z"),
            },
          ],
        },
      ],
    };
  });

  it.each(["syncing", "stale", "unavailable"] as const)(
    "disables completion and shows an explanation when %s",
    (status) => {
      if (state.data) state.data.status = status;
      const html = renderToStaticMarkup(<BridgeTransactionItems />);
      expect(html).toContain('role="status"');
      expect(html).toMatch(
        /<button[^>]*disabled=""[^>]*>Complete Withdraw<\/button>/,
      );
    },
  );

  it("disables completion when refreshing previously ready data fails", () => {
    state.isRefetchError = true;
    const html = renderToStaticMarkup(<BridgeTransactionItems />);
    expect(html).toContain("could not be refreshed");
    expect(html).toMatch(
      /<button[^>]*disabled=""[^>]*>Complete Withdraw<\/button>/,
    );
  });

  it("offers completion for current canonical availability", () => {
    const html = renderToStaticMarkup(<BridgeTransactionItems />);
    expect(html).toContain("Complete Withdraw");
    expect(html).not.toMatch(
      /<button[^>]*disabled=""[^>]*>Complete Withdraw<\/button>/,
    );
    expect(html).not.toContain('role="status"');
  });
});
