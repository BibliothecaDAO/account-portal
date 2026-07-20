import { describe, expect, it } from "vitest";

import {
  DelegateProfileInputSchema,
  DelegateQuerySchema,
} from "./delegate-input";

describe("DelegateQuerySchema", () => {
  it("rejects SQL wildcard searches and applies bounded defaults", () => {
    expect(DelegateQuerySchema.safeParse({ search: "%" }).success).toBe(false);
    expect(DelegateQuerySchema.parse({})).toEqual({
      limit: 100,
      orderBy: "random",
      search: "",
    });
  });
});

describe("DelegateProfileInputSchema", () => {
  it("bounds user-authored profile fields", () => {
    expect(
      DelegateProfileInputSchema.safeParse({ statement: "x".repeat(2_001) })
        .success,
    ).toBe(false);
    expect(
      DelegateProfileInputSchema.safeParse({
        statement: "Represent builders",
        interests: ["not-an-allowed-interest"],
      }).success,
    ).toBe(false);
  });

  it("accepts and trims a valid profile", () => {
    expect(
      DelegateProfileInputSchema.parse({
        statement: "  Represent builders  ",
        interests: ["governance", "starknet"],
        github: "realms-world",
      }),
    ).toEqual({
      statement: "Represent builders",
      interests: ["governance", "starknet"],
      github: "realms-world",
    });
  });
});
