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

const read = (lords: bigint) => ({ status: "read", amount: lords * 10n ** 18n }) as const;

const claimsProps = {
  claimable: read(1_284n),
  isConnected: true,
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

  it("is not live at a read 0", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} claimable={read(0n)} />,
    );
    expect(html).toMatch(/realm-stat truncate[^>]*>0</);
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("does not state 0 for a balance not read yet", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} claimable={{ status: "unknown" }} />,
    );
    expect(html).toMatch(/realm-stat truncate[^>]*>—</);
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("says a failed balance read could not be read, and offers no claim", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView {...claimsProps} claimable={{ status: "failed" }} />,
    );
    expect(html).toMatch(/realm-stat truncate[^>]*>—</);
    expect(html).toContain("Your claimable LORDS could not be read.");
    expect(claimButton(html)).toBeUndefined();
  });

  it("offers to connect instead of claiming when no wallet is connected", () => {
    const html = renderToStaticMarkup(
      <RealmsClaimsView
        {...claimsProps}
        isConnected={false}
        claimable={{ status: "unknown" }}
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
      <RealmsClaimsView {...claimsProps} isConnected={false} claimable={{ status: "unknown" }} />,
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
    realmsClaimable: read(1_284n),
    veLordsClaimable: read(0n),
  };

  it("gives a claimable row its amount in LORDS and its own button", () => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} />);
    expect(html).toContain("1,284 LORDS");
    expect(html).toContain(">Claim<");
  });

  it("says nothing is ready when both reads returned 0", () => {
    const html = renderToStaticMarkup(
      <ClaimsPanel {...props} realmsClaimable={read(0n)} />,
    );
    expect(html).toContain("No LORDS to collect right now.");
    expect(html.split("Nothing to claim").length - 1).toBe(2);
    expect(html).not.toContain(">Claim<");
    expect(html).not.toContain("ready to collect");
  });

  it.each([
    ["Realms", { realmsClaimable: { status: "unknown" } }],
    ["veLORDS", { realmsClaimable: read(0n), veLordsClaimable: { status: "unknown" } }],
  ] as const)("does not call a %s balance not read yet empty", (_, reads) => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} {...reads} />);
    expect(html).toContain(">—<");
    expect(html.split("Nothing to claim").length - 1).toBe(1);
    expect(html).not.toContain("No LORDS to collect right now.");
    expect(html).not.toContain(">Claim<");
  });

  it.each([
    ["Realms", { realmsClaimable: { status: "failed" } }],
    ["veLORDS", { realmsClaimable: read(0n), veLordsClaimable: { status: "failed" } }],
  ] as const)("says a failed %s read could not be read, and offers no claim", (_, reads) => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} {...reads} />);
    expect(html).toContain("Could not be read");
    expect(html).toContain("A claimable balance could not be read.");
    expect(html.split("Nothing to claim").length - 1).toBe(1);
    expect(html).not.toContain("No LORDS to collect right now.");
    expect(html).not.toContain(">Claim<");
  });

  it("does not let a label clip", () => {
    const html = renderToStaticMarkup(<ClaimsPanel {...props} />);
    expect(html).not.toContain("truncate");
  });
});
