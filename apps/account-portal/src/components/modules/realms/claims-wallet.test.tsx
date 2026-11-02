import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ClaimRewards } from "./claims";

const mocks = vi.hoisted(() => ({ address: undefined as string | undefined }));

vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));
vi.mock("@/components/layout/starknet-wallet-button", () => ({
  StarknetWalletButton: () => null,
}));
vi.mock("@/lib/getRealmsLordsClaims", () => ({
  getRealmsLordsClaimsQueryOptions: vi.fn(),
}));
vi.mock("@/hooks/use-l2-realms-claims", () => ({
  useL2RealmsClaims: () => ({ balance: null, isSubmitting: false }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: mocks.address }),
  useExplorer: () => ({ transaction: (hash: string) => hash }),
}));

const claimable = () => {
  const html = renderToStaticMarkup(<ClaimRewards />);
  return /realm-stat truncate[^>]*>([^<]*)</.exec(html)?.[1];
};

describe("ClaimRewards", () => {
  it("does not state 0 before anyone has connected", () => {
    mocks.address = undefined;
    expect(claimable()).toBe("—");
  });

  it("states a real 0 for a connected wallet", () => {
    mocks.address = "0xabc";
    expect(claimable()).toBe("0");
  });
});
