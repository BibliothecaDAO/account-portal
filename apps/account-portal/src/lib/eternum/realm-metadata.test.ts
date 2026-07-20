import { describe, expect, it } from "vitest";

import { parseRealmMetadata } from "./realm-metadata";

describe("parseRealmMetadata", () => {
  it("returns null for malformed external metadata", () => {
    expect(parseRealmMetadata("{not-json")).toBeNull();
  });

  it.each([
    JSON.stringify({ name: { nested: "object" } }),
    JSON.stringify({ image: 42 }),
    JSON.stringify({ attributes: [{ trait_type: {}, value: "Wood" }] }),
    JSON.stringify({ attributes: "not-an-array" }),
  ])("returns null for metadata with an unsafe shape", (metadata) => {
    expect(parseRealmMetadata(metadata)).toBeNull();
  });

  it("returns validated metadata and strips unknown fields", () => {
    expect(
      parseRealmMetadata(
        JSON.stringify({
          name: "Realm #1",
          image: "ipfs://realm-image",
          attributes: [{ trait_type: "Resource", value: "Wood" }],
          ignored: "field",
        }),
      ),
    ).toEqual({
      name: "Realm #1",
      image: "ipfs://realm-image",
      attributes: [{ trait_type: "Resource", value: "Wood" }],
    });
  });
});
