import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { VelordsSourceBreakdown } from "./source-breakdown";
import { StakeLordsView } from "./stake-lords";

vi.mock("./stake-dialog", () => ({ StakeDialog: () => null }));
vi.mock("./unlock-dialog", () => ({ UnlockDialog: () => null }));

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
