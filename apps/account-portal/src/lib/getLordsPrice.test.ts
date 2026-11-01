import { describe, expect, it } from "vitest";

import { readLordsPriceUsd } from "./getLordsPrice";

describe("readLordsPriceUsd", () => {
  it("reads the price from either response shape", () => {
    expect(readLordsPriceUsd({ pair: { priceUsd: "0.0046" } })).toBe("0.0046");
    expect(readLordsPriceUsd({ pairs: [{ priceUsd: "0.0046" }] })).toBe("0.0046");
  });

  it("throws rather than inventing a price when there is none", () => {
    expect(() => readLordsPriceUsd({ pair: null })).toThrow("priceUsd");
    expect(() => readLordsPriceUsd({ pair: {} })).toThrow("priceUsd");
  });
});
