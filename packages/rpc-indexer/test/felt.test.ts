import { describe, expect, it } from "vitest";

import {
  normalizeFelt,
  parseFelt,
  parseU128,
  parseU256,
  toPaddedHex,
} from "../src/felt";

describe("felt helpers", () => {
  it("normalizes padding and case", () => {
    expect(normalizeFelt("0x000ABC")).toBe("0xabc");
    expect(toPaddedHex(0xabcn)).toBe(`0x${"0".repeat(61)}abc`);
  });

  it("rejects non-hex and out-of-field values", () => {
    expect(() => parseFelt("123", "x")).toThrow(TypeError);
    expect(() => parseFelt(undefined, "x")).toThrow(TypeError);
    expect(() => parseFelt(`0x${"f".repeat(64)}`, "x")).toThrow(RangeError);
  });

  it("combines u256 limbs exactly and bounds u128", () => {
    expect(parseU256("0x1", "0x2", "v")).toBe(1n + (2n << 128n));
    expect(() => parseU128(`0x1${"0".repeat(32)}`, "v")).toThrow(RangeError);
  });
});
