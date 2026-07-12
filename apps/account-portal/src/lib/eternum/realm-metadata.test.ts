import { describe, expect, it } from "vitest";

import { parseRealmMetadata } from "./realm-metadata";

describe("parseRealmMetadata", () => {
  it("returns null for malformed external metadata", () => {
    expect(parseRealmMetadata("{not-json")).toBeNull();
  });
});
