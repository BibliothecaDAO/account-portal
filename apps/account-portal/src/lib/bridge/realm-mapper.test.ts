import { describe, expect, it } from "vitest";

import { mapL1RealmToBridgeRealm } from "./realm-mapper";

describe("mapL1RealmToBridgeRealm", () => {
  it("preserves Alchemy traits and normalizes legacy key attributes", () => {
    expect(
      mapL1RealmToBridgeRealm({
        token: {
          tokenId: "42",
          name: null,
          image: null,
          collection: { id: "0xabc" },
          attributes: [
            { trait_type: "Order", value: 7 },
            { key: "Realm", value: "Fox" },
          ],
        },
        ownership: { tokenCount: "1", acquiredAt: null },
      }),
    ).toEqual({
      token_id: 42,
      name: undefined,
      attributes: [
        { trait_type: "Order", value: 7, display_type: undefined },
        { trait_type: "Realm", value: "Fox", display_type: undefined },
      ],
    });
  });

  it("rejects token IDs that cannot be represented safely", () => {
    expect(() =>
      mapL1RealmToBridgeRealm({
        token: {
          tokenId: "9007199254740992",
          image: null,
          collection: { id: "0xabc" },
          attributes: [],
        },
        ownership: { tokenCount: "1", acquiredAt: null },
      }),
    ).toThrow("Invalid L1 token ID");
  });
});
