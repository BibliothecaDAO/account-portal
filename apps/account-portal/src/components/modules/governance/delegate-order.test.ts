import { describe, expect, it } from "vitest";

import { placeCurrentDelegateFirst, toDelegateAddress } from "./delegate-order";

const a = { user: "0xa" };
const b = { user: "0xb" };
const c = { user: "0xc" };

describe("placeCurrentDelegateFirst", () => {
  it("prefers the chain-read record over a listed row with unknown votes", () => {
    interface Row {
      user: string;
      delegatedVotes: string | null;
    }
    const listed: Row = { user: "0xc", delegatedVotes: null };
    const record: Row = { user: "0xc", delegatedVotes: "4" };
    expect(placeCurrentDelegateFirst([listed], "0xc", record)).toEqual([record]);
    expect(placeCurrentDelegateFirst([listed], "0xc")).toEqual([listed]);
  });

  it("moves the current delegate to the top and keeps the rest in order", () => {
    expect(placeCurrentDelegateFirst([a, b, c], "0xc")).toEqual([c, a, b]);
  });

  it("adds the current delegate when the fetched page left them out", () => {
    expect(placeCurrentDelegateFirst([a, b], "0xc", c)).toEqual([c, a, b]);
  });

  it("does not list them twice", () => {
    expect(placeCurrentDelegateFirst([a, c], "0xc", { user: "0xc" })).toEqual([
      c,
      a,
    ]);
  });

  it("leaves the order alone with no current delegate, or none on the page", () => {
    expect(placeCurrentDelegateFirst([a, b], undefined)).toEqual([a, b]);
    expect(placeCurrentDelegateFirst([a, b], "0xc")).toEqual([a, b]);
  });
});

describe("toDelegateAddress", () => {
  it("treats zero and nothing as no delegate", () => {
    expect(toDelegateAddress(0n)).toBeUndefined();
    expect(toDelegateAddress(undefined)).toBeUndefined();
  });

  it("pads an address to the form delegate records use", () => {
    expect(toDelegateAddress(0xabcn)).toBe(`0x${"abc".padStart(64, "0")}`);
  });
});
