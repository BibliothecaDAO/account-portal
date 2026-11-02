import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { BridgePanelView } from "./bridge-sidebar";

vi.mock("@/components/layout/ethereum-connect", () => ({
  EthereumConnect: () => null,
}));
vi.mock("@/components/layout/starknet-wallet-button", () => ({
  StarknetWalletButton: () => null,
}));
vi.mock("@/hooks/bridge/useBridgeL2Realms", () => ({}));
vi.mock("@/hooks/bridge/useWriteDepositRealms", () => ({}));
vi.mock("@/hooks/token/L1/useERC721Approval", () => ({ default: vi.fn() }));
vi.mock("./bridge-tx-items", () => ({ default: () => null }));

const heading = (selectedIds: string[]) => {
  const html = renderToStaticMarkup(
    <BridgePanelView
      from="Ethereum"
      selectedIds={selectedIds}
      action={null}
      history={null}
    />,
  );
  return /<h2[^>]*>(.*?)<\/h2>/.exec(html)?.[1];
};

describe("BridgePanelView heading", () => {
  it("sets the count in the reading face, because the title face's 1 reads as ı", () => {
    expect(heading(["23"])).toBe(
      'Bridge <span class="font-sans font-semibold">1</span> Realm to Starknet',
    );
  });

  it("uses the plural for more than one Realm", () => {
    expect(heading(["23", "144"])).toContain(
      '<span class="font-sans font-semibold">2</span> Realms to Starknet',
    );
  });

  it("asks for a selection when there is none", () => {
    expect(heading([])).toBe("Select Realms to bridge");
  });
});
