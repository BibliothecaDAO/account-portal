import { describe, expect, it } from "vitest";

import {
  normalizeOptionalStarknetAddress,
  StarknetAddressSchema,
} from "./chain-address";

describe("StarknetAddressSchema", () => {
  it("rejects input that could escape an interpolated SQL literal", () => {
    const result = StarknetAddressSchema.safeParse("0x1' OR 1=1 --");

    expect(result.success).toBe(false);
  });

  it("normalizes equivalent addresses to one database-safe form", () => {
    expect(StarknetAddressSchema.parse("0x0000AbC")).toBe("0xabc");
  });
});

describe("normalizeOptionalStarknetAddress", () => {
  it("normalizes a valid search parameter", () => {
    expect(normalizeOptionalStarknetAddress(" 0x000AbC ")).toBe("0xabc");
  });

  it("drops invalid, empty, and non-string search parameters", () => {
    expect(
      normalizeOptionalStarknetAddress("0xnot-an-address"),
    ).toBeUndefined();
    expect(normalizeOptionalStarknetAddress("   ")).toBeUndefined();
    expect(normalizeOptionalStarknetAddress(["0x1"])).toBeUndefined();
  });
});
