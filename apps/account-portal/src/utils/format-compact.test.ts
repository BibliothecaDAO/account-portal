import { describe, expect, it } from "vitest";

import { formatCompact } from "./utils";

describe("formatCompact", () => {
  it("compacts from 10,000, so a grid of figures reads one way", () => {
    expect(formatCompact("48,210")).toBe("48.2K");
    expect(formatCompact("201,884")).toBe("201.9K");
    expect(formatCompact("$642,118")).toBe("$642.1K");
    expect(formatCompact("13,600,000")).toBe("13.6M");
  });

  it("leaves smaller values and non-numbers alone", () => {
    expect(formatCompact("9,999")).toBe("9,999");
    expect(formatCompact("—")).toBe("—");
    expect(formatCompact("$0")).toBe("$0");
  });
});
