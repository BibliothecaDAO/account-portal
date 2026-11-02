import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { ClaimRead } from "@/lib/claim-read";

import { VelordsRewardsView } from "./claim-rewards";
import { VelordsSourceBreakdown } from "./source-breakdown";
import { StakeLordsView } from "./stake-lords";

vi.mock("./stake-dialog", () => ({ StakeDialog: () => null }));
vi.mock("./unlock-dialog", () => ({ UnlockDialog: () => null }));
vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));

const arcDash = (html: string) =>
  /stroke-dasharray="([\d.]+) 100"/.exec(html)?.[1];

describe("StakeLordsView", () => {
  it("fills the arc to the true share of staked against total", () => {
    const html = renderToStaticMarkup(
      <StakeLordsView stakedLords={202_000} availableLords={1_148_000} />,
    );

    expect(Number(arcDash(html))).toBeCloseTo(14.96, 2);
    expect(html).toContain(">15%<");
    expect(html).toContain("202,000");
    expect(html).toContain("1,350,000");
  });

  it("draws no fill at 0 and all of it at 100", () => {
    expect(
      arcDash(
        renderToStaticMarkup(
          <StakeLordsView stakedLords={0} availableLords={500} />,
        ),
      ),
    ).toBeUndefined();
    expect(
      arcDash(
        renderToStaticMarkup(
          <StakeLordsView stakedLords={500} availableLords={0} />,
        ),
      ),
    ).toBe("100");
  });

  it("states nothing about the share until both amounts are read", () => {
    const html = renderToStaticMarkup(<StakeLordsView availableLords={500} />);

    expect(arcDash(html)).toBeUndefined();
    expect(html).not.toContain("0%");
    expect(html).toContain("—");
  });

  it("scales from a viewBox instead of fixed radii, so it cannot outgrow its panel", () => {
    const html = renderToStaticMarkup(
      <StakeLordsView stakedLords={1} availableLords={1} />,
    );

    expect(html).toContain('viewBox="0 0 200 108"');
    expect(html).toContain("max-w-56");
    expect(html).not.toContain("recharts");
  });
});

describe("VelordsSourceBreakdown", () => {
  const sender =
    "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";
  const html = renderToStaticMarkup(
    <VelordsSourceBreakdown
      addressUrl={(address) => `https://explorer.test/${address}`}
      data={[
        {
          sender,
          totalWei: (182_400n * 10n ** 18n).toString(),
          txCount: 12,
          sharePercent: "64.2",
        },
      ]}
    />,
  );

  it("keeps a full address out of the row, which is what made it scroll", () => {
    expect(html).not.toContain(`>${sender}<`);
    expect(html).toContain("whitespace-nowrap");
  });

  it("keeps the full address reachable", () => {
    expect(html).toContain(`href="https://explorer.test/${sender}"`);
    expect(html).toContain(`title="${sender}"`);
  });

  it("shows every column", () => {
    for (const heading of ["Source", "LORDS", "Share", "Txs"]) {
      expect(html).toContain(`>${heading}<`);
    }
    expect(html).toContain(">182.4K<");
    expect(html).toContain(">64.2%<");
    expect(html).toContain(">12<");
  });
});

describe("VelordsRewardsView", () => {
  const render = (claimable: ClaimRead, canClaim = false) =>
    renderToStaticMarkup(
      <VelordsRewardsView
        claimable={claimable}
        recipient="0xabc"
        isRecipientValid
        canClaim={canClaim}
      />,
    );
  const amount = (html: string) => /realm-stat[^>]*>([^<]*)</.exec(html)?.[1];
  const claimButton = (html: string) =>
    /<button[^>]*>(?:(?!<\/button>).)*Claim LORDS<\/button>/.exec(html)?.[0];

  it("states 0 when the read returned 0, and offers no live claim", () => {
    const html = render({ status: "read", amount: 0n });
    expect(amount(html)).toBe("0");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("does not state a figure for a balance not read yet", () => {
    const html = render({ status: "unknown" });
    expect(amount(html)).toBe("—");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("shows a balance still reading as reading, never as 0 or unknown", () => {
    const html = render({ status: "reading" });
    expect(amount(html)).toBe("…");
    expect(html).not.toContain("Nothing to claim");
    expect(claimButton(html)).toContain('disabled=""');
  });

  it("says a failed read could not be read, and offers no claim", () => {
    const html = render({ status: "failed" }, true);
    expect(amount(html)).toBe("—");
    expect(html).toContain("Your claimable LORDS could not be read. Reload the page to try again.");
    expect(claimButton(html)).toBeUndefined();
  });

  it("offers the claim for a balance it read", () => {
    const html = render({ status: "read", amount: 312_400_000_000_000_000_000n }, true);
    expect(amount(html)).toBe("312.4");
    expect(claimButton(html)).not.toContain('disabled=""');
  });
});
