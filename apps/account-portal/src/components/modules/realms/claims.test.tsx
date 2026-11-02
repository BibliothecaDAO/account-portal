import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ClaimsPanel } from "../homepage/claims-panel";
import { RealmsClaimsView } from "./claims";

vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));
vi.mock("@/lib/getRealmsLordsClaims", () => ({
  getRealmsLordsClaimsQueryOptions: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

const claimsProps = {
  claimable: "1,284",
  isConnected: true,
  canClaim: true,
  pastClaims: [],
  transactionUrl: (hash: string) => `https://explorer.test/${hash}`,
};
const claimButton = (html: string) =>
  /<button[^>]*>(?:(?!<\/button>).)*Claim LORDS<\/button>/.exec(html)?.[0];

describe("RealmsClaimsView", () => {
  it("moves the transaction link under the date below 512 px, in the same two columns at any amount", () => {
    const hash = "0x04a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f";
    const html = renderToStaticMarkup(
      <RealmsClaimsView
        {...claimsProps}
        pastClaims={[
          {
            hash,
            timestamp: "2025-03-02",
            amount: `${1_234_567n}${"0".repeat(18)}`,
            recipient: "0x0123",
          },
        ]}
      />,
    );

    expect(html).toContain('hidden @2xl:table-cell">Recipient');
    expect(html).toContain('hidden @lg:table-cell">Transaction');
    expect(html.split(`href="https://explorer.test/${hash}"`).length - 1).toBe(2);
    expect(html).toMatch(/2025-03-02<span class="block @lg:hidden"><a href="https:\/\/explorer/);
    expect(html).toMatch(/hidden @lg:table-cell[^>]*"><a href="https:\/\/explorer/);
  });

  it("is live while there is something to claim", () => {
    const html = renderToStaticMarkup(<RealmsClaimsView {...claimsProps} />);
    expect(claimButton(html)).not.toContain('disabled=""');
  });

  it("is not live at 0", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} claimable={0} canClaim={false} />,
    );
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("offers to connect instead of claiming when no wallet is connected", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView
        {...claimsProps}
        isConnected={false}
        canClaim={false}
        connectAction={<button>Connect wallet to claim</button>}
      />,
    );
    expect(html).toContain("Connect wallet to claim");
    expect(claimButton(html)).toBeUndefined();
  });

  it.each([
    ["loading", "Loading past claims…"],
    ["error", "Past claims could not be loaded."],
  ] as const)("does not call a %s history empty", (state, message) => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} pastClaimsState={state} />,
    );
    expect(html).toContain(message);
    expect(html).not.toContain("No past claims found.");
  });

  it("lets the history message wrap, so it fits a phone", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} isConnected={false} canClaim={false} />,
    );
    expect(html).toMatch(/whitespace-normal[^>]*>Connect your Starknet wallet/);
  });

  it("says a finished, empty history is empty", () => {
    expect(
      renderToStaticMarkup(<RealmsClaimsView {...claimsProps} />),
    ).toContain("No past claims found.");
  });
});

describe("ClaimsPanel", () => {
  const props = {
    realmsClaimable: "1,284",
    veLordsClaimable: "312",
    canClaimRealms: true,
    canClaimVeLords: false,
  };

  it("gives a claimable row its amount in LORDS and its own button", () => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} />);
    expect(html).toContain("1,284 LORDS");
    expect(html).toContain(">Claim<");
  });

  it("says nothing is ready when nothing is", () => {
    const html = renderToStaticMarkup(
      <ClaimsPanel {...props} canClaimRealms={false} />,
    );
    expect(html).toContain("No LORDS to collect right now.");
    expect(html).toContain("Nothing to claim");
    expect(html).not.toContain(">Claim<");
    expect(html).not.toContain("ready to collect");
  });

  it("does not let a label clip", () => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} />);
    expect(html).not.toContain("truncate");
  });
});
