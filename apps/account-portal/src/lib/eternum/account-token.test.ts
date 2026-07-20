import { describe, expect, it } from "vitest";

import { parseToriiTokenId } from "./account-token";

describe("parseToriiTokenId", () => {
  it("parses a Torii contract-and-token identifier", () => {
    expect(parseToriiTokenId("0xcontract:0x0000002a")).toBe(42);
  });

  it.each([
    "",
    "0xcontract",
    "0xcontract:not-hex",
    "0xcontract:0x20000000000000",
  ])("rejects malformed or unsafe token id %s", (tokenId) => {
    expect(() => parseToriiTokenId(tokenId)).toThrow("Invalid Torii token ID");
  });
});
