import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DelegateRowView, DelegateSummaryView } from "./delegate-row";

vi.mock("@starknet-start/react", () => ({
  useContract: () => ({ contract: undefined }),
  useSendTransaction: () => ({}),
  useStarkName: () => ({}),
}));

const user = `0x0${"3a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef12"}`;
const delegate = {
  id: "1",
  user,
  delegatedVotes: "1240",
  delegateProfile: {
    interests: ["Gaming", "Treasury", "Eternum", "Bridges", "Art"],
    statement: "Votes on every proposal.",
  },
};

describe("DelegateRowView", () => {
  it("sets a name in Exo 2, never in the uppercase title face", () => {
    const html = renderToStaticMarkup(
      <DelegateRowView delegate={delegate} name="loaf.stark" />,
    );

    expect(html).toContain("font-sans font-semibold");
    expect(html).not.toContain("realm-card-title");
  });

  it("sets an address as lowercase mono, so its zero reads as a zero", () => {
    const html = renderToStaticMarkup(<DelegateRowView delegate={delegate} />);

    expect(html).toContain("realm-stat text-sm lowercase");
    expect(html).not.toContain("realm-card-title");
  });

  it("treats the short address the name hook falls back to as an address", () => {
    const html = renderToStaticMarkup(
      <DelegateRowView delegate={delegate} name="0x3a1b...ef12" />,
    );

    expect(html).toContain("realm-stat text-sm lowercase");
  });

  it("keeps the full address, every interest and the statement in the row's detail", () => {
    const html = renderToStaticMarkup(<DelegateRowView delegate={delegate} />);
    const detail = html.slice(html.indexOf("delegate-row-detail"));

    expect(detail).toContain(user);
    expect(detail).toContain("Votes on every proposal.");
    for (const interest of delegate.delegateProfile.interests) {
      expect(detail).toContain(interest);
    }
  });

  it("shows +N as plain text, with no small button to hit", () => {
    const html = renderToStaticMarkup(<DelegateRowView delegate={delegate} />);

    expect(html).toContain("+3");
    expect(html).not.toMatch(/<button[^>]*>\+3/);
  });

  it("offers the action, or says this is your delegate", () => {
    const other = renderToStaticMarkup(
      <DelegateRowView delegate={delegate} name="loaf.stark" />,
    );
    const current = renderToStaticMarkup(
      <DelegateRowView delegate={delegate} name="loaf.stark" isCurrentDelegate />,
    );

    expect(other).toContain('aria-label="Delegate to loaf.stark"');
    expect(other).not.toContain("Your delegate");
    expect(current).toContain("Your delegate");
    expect(current).not.toContain("Delegate to loaf.stark");
  });
});

describe("DelegateSummaryView", () => {
  it("shows who, how many votes and the statement", () => {
    const html = renderToStaticMarkup(
      <DelegateSummaryView delegate={delegate} name="loaf.stark" />,
    );

    expect(html).toContain("loaf.stark");
    expect(html).toContain("1,240");
    expect(html).toContain("Votes on every proposal.");
  });
});
