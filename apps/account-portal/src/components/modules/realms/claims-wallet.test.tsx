import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClaimRewards } from "./claims";

const mocks = vi.hoisted(() => ({
  address: undefined as string | undefined,
  read: { data: undefined as unknown, isError: false, isLoading: false },
}));

vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));
vi.mock("@/components/layout/starknet-wallet-button", () => ({
  StarknetWalletButton: () => null,
}));
vi.mock("@/lib/getRealmsLordsClaims", () => ({
  getRealmsLordsClaimsQueryOptions: vi.fn(),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: mocks.address }),
  useExplorer: () => ({ transaction: (hash: string) => hash }),
  useReadContract: () => mocks.read,
  useContract: () => ({ contract: undefined }),
  useSendTransaction: () => ({ sendAsync: vi.fn(), isPending: false }),
}));

const render = () => renderToStaticMarkup(<ClaimRewards />);
const claimable = (html: string) => /realm-stat truncate[^>]*>([^<]*)</.exec(html)?.[1];
const claimButton = (html: string) =>
  /<button[^>]*>(?:(?!<\/button>).)*Claim LORDS<\/button>/.exec(html)?.[0];

describe("ClaimRewards", () => {
  beforeEach(() => {
    mocks.address = "0xabc";
    mocks.read = { data: undefined, isError: false, isLoading: false };
  });

  it("does not state 0 before anyone has connected", () => {
    mocks.address = undefined;
    expect(claimable(render())).toBe("—");
  });

  it("states 0 when the balance read returned 0", () => {
    mocks.read = { data: 0n, isError: false, isLoading: false };
    const html = render();
    expect(claimable(html)).toBe("0");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("does not state 0 while the balance has not been read", () => {
    const html = render();
    expect(claimable(html)).toBe("—");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("shows a balance still loading as reading, never as 0 or unknown", () => {
    mocks.read = { data: undefined, isError: false, isLoading: true };
    const html = render();
    expect(claimable(html)).toBe("…");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("says a failed balance read could not be read, and offers no claim", () => {
    mocks.read = { data: undefined, isError: true, isLoading: false };
    const html = render();
    expect(claimable(html)).toBe("—");
    expect(html).toContain("Your claimable LORDS could not be read. Reload the page to try again.");
    expect(claimButton(html)).toBeUndefined();
  });

  it.each([
    ["0", 0n],
    ["1,284", 1_284n * 10n ** 18n],
  ])("says a refetch that fails after reading %s could not be read, and offers no claim", (figure, data) => {
    mocks.read = { data, isError: false, isLoading: false };
    expect(claimable(render())).toBe(figure);

    mocks.read = { data, isError: true, isLoading: false };
    const html = render();
    expect(claimable(html)).toBe("—");
    expect(html).toContain("Your claimable LORDS could not be read. Reload the page to try again.");
    expect(claimButton(html)).toBeUndefined();

    mocks.read = { data, isError: false, isLoading: false };
    expect(claimable(render())).toBe(figure);
  });

  it("offers the claim for a balance it read", () => {
    mocks.read = { data: 1_284n * 10n ** 18n, isError: false, isLoading: false };
    const html = render();
    expect(claimable(html)).toBe("1,284");
    expect(claimButton(html)).not.toContain('disabled=""');
  });
});
