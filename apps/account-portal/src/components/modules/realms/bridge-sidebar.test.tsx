import type * as DepositHooks from "@/hooks/bridge/useWriteDepositRealms";
import type { BridgeRealm } from "@/types/ark";
import type { Row } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import BridgeSidebar from "./bridge-sidebar";

vi.mock("env", () => ({ env: { VITE_PUBLIC_CHAIN: "mainnet" } }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: true, isLoading: false, error: null }),
}));
vi.mock("@/hooks/bridge/useWriteDepositRealms", async (importOriginal) => ({
  ...(await importOriginal<typeof DepositHooks>()),
  useWriteDepositRealms: () => ({ writeAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/bridge/useBridgeL2Realms", () => ({
  useBridgeL2Realms: () => ({ initiateWithdraw: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/token/L1/useERC721Approval", () => ({
  default: () => ({
    isApprovedForAll: true,
    approveForAll: vi.fn(),
    approveForAllLoading: false,
    isPending: false,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("wagmi", () => ({ useAccount: () => ({ address: "0xabc" }) }));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xdef" }),
}));
vi.mock("@/components/layout/ethereum-connect", () => ({
  EthereumConnect: () => null,
}));
vi.mock("@/components/layout/starknet-wallet-button", () => ({
  StarknetWalletButton: () => null,
}));
vi.mock("./bridge-tx-items", () => ({ default: () => null }));

function selectRealms(count: number) {
  return Array.from(
    { length: count },
    (_, index) =>
      ({ getValue: () => String(index + 1) }) as unknown as Row<BridgeRealm>,
  );
}

function renderBridgeButton(selectedAsset: string, count: number) {
  const html = renderToStaticMarkup(
    <BridgeSidebar
      disabled={false}
      selectedRows={selectRealms(count)}
      selectedAsset={selectedAsset}
      setRowSelection={vi.fn()}
    />,
  );
  return /<button[^>]*data-slot="button"[^>]*>[^<]*<\/button>/.exec(html)?.[0];
}

describe("bridge deposit size", () => {
  it("bridges 7 Realms from Ethereum in one deposit", () => {
    const button = renderBridgeButton("Ethereum", 7);
    expect(button).not.toContain('disabled=""');
    expect(button).toContain(">Bridge</button>");
  });

  it("refuses 8 Realms from Ethereum in one deposit", () => {
    const button = renderBridgeButton("Ethereum", 8);
    expect(button).toContain('disabled=""');
    expect(button).toContain(">Bridge up to 7 Realms at a time</button>");
  });

  it("withdraws 8 Realms from Starknet in one transaction", () => {
    const button = renderBridgeButton("Starknet", 8);
    expect(button).not.toContain('disabled=""');
    expect(button).toContain(">Bridge</button>");
  });
});
