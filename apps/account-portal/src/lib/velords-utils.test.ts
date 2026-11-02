/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from "vitest";
import { parseEther } from "viem";

import {
  buildVelordsSummary,
  calculateSharePercent,
  calculateStakedSharePercent,
  computeTvlUsd,
  formatStakedShare,
  formatTokenAmountDisplay,
  formatTvlDisplay,
  knownOrUnknown,
  parseOptionalStakeAmount,
} from "./velords-utils";

describe("parseOptionalStakeAmount", () => {
  it("returns undefined for empty or zero stake values", () => {
    expect(parseOptionalStakeAmount("")).toBeUndefined();
    expect(parseOptionalStakeAmount("   ")).toBeUndefined();
    expect(parseOptionalStakeAmount("0")).toBeUndefined();
    expect(parseOptionalStakeAmount("0.0")).toBeUndefined();
  });

  it("parses positive stake values", () => {
    expect(parseOptionalStakeAmount("1.25")).toBe(parseEther("1.25"));
  });
});

describe("computeTvlUsd", () => {
  it("returns 0 when locked LORDS is zero", () => {
    expect(computeTvlUsd(0n, 0.5)).toBe(0);
  });

  it("returns expected USD TVL for valid inputs", () => {
    expect(computeTvlUsd(parseEther("100"), 0.25)).toBe(25);
  });

  it("returns undefined when price is unavailable", () => {
    expect(computeTvlUsd(parseEther("100"), undefined)).toBeUndefined();
  });
});

describe("calculateSharePercent", () => {
  it("returns 0.00 when total supply is zero", () => {
    expect(calculateSharePercent(1n, 0n)).toBe("0.00");
  });

  it("calculates a share percentage using bigint-safe math", () => {
    expect(calculateSharePercent(parseEther("25"), parseEther("100"))).toBe(
      "25.00",
    );
    expect(calculateSharePercent(1n, 3n)).toBe("33.33");
  });
});

describe("formatTokenAmountDisplay", () => {
  it("formats large values with separators without numeric casting", () => {
    expect(
      formatTokenAmountDisplay(
        BigInt("123456789012345678901234567890000000000"),
        { maximumFractionDigits: 0 },
      ),
    ).toBe("123,456,789,012,345,678,901");
  });
});

describe("calculateStakedSharePercent", () => {
  it("is 0 with nothing staked or nothing at all", () => {
    expect(calculateStakedSharePercent(0, 0)).toBe(0);
    expect(calculateStakedSharePercent(0, 1_350_000)).toBe(0);
  });

  it("is 100 with everything staked", () => {
    expect(calculateStakedSharePercent(1_350_000, 0)).toBe(100);
  });

  it("measures staked against staked plus available", () => {
    expect(calculateStakedSharePercent(202_000, 1_148_000)).toBeCloseTo(14.96, 2);
  });
});

describe("formatStakedShare", () => {
  it("rounds to a whole percent", () => {
    expect(formatStakedShare(0)).toBe("0%");
    expect(formatStakedShare(14.96)).toBe("15%");
    expect(formatStakedShare(100)).toBe("100%");
  });

  it("keeps a sliver distinct from none and from all", () => {
    expect(formatStakedShare(0.2)).toBe("<1%");
    expect(formatStakedShare(99.7)).toBe(">99%");
  });
});

describe("knownOrUnknown", () => {
  it("is undefined only while loading", () => {
    expect(knownOrUnknown(undefined, true)).toBeUndefined();
    expect(knownOrUnknown(undefined, false)).toBe("—");
    expect(knownOrUnknown("48,210", false)).toBe("48,210");
  });
});

describe("formatTvlDisplay", () => {
  it("shows a known value in dollars", () => {
    expect(formatTvlDisplay(642_118.4, false)).toBe("$642,118");
  });

  it("shows unknown when the price never came, not $0", () => {
    expect(formatTvlDisplay(undefined, false)).toBe("—");
    expect(formatTvlDisplay(Number.NaN, false)).toBe("—");
  });

  it("still shows a real zero", () => {
    expect(formatTvlDisplay(computeTvlUsd(0n, 0.5), false)).toBe("$0");
  });

  it("waits while loading", () => {
    expect(formatTvlDisplay(undefined, true)).toBeUndefined();
  });
});

describe("buildVelordsSummary", () => {
  const date = "2026-11-02";

  it("states known figures with their units", () => {
    expect(
      buildVelordsSummary({
        period: "3m",
        tvl: "$642,118",
        lordsLocked: "21,400,000",
        rewards30d: "201,884",
        apyPercent: "18.42",
        date,
      }),
    ).toBe(
      "veLords Dashboard (3m) | TVL: $642,118 | Locked: 21,400,000 LORDS | 30d Rewards: 201,884 LORDS | APY: 18.42% | Updated: 2026-11-02",
    );
  });

  it("states no false number for what it does not know", () => {
    const summary = buildVelordsSummary({ period: "3m", date });
    expect(summary).toBe(
      "veLords Dashboard (3m) | TVL: — | Locked: — | 30d Rewards: — | APY: — | Updated: 2026-11-02",
    );
    expect(summary).not.toContain("$0");
  });
});
