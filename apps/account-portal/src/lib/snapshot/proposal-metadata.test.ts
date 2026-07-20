import { describe, expect, it } from "vitest";

import { normalizeProposalMetadata } from "./proposal-metadata";

describe("normalizeProposalMetadata", () => {
  it("keeps bounded strings from Snapshot metadata", () => {
    expect(
      normalizeProposalMetadata({ title: "Proposal", body: "## Details" }),
    ).toEqual({ title: "Proposal", body: "## Details" });
  });

  it("drops non-string and oversized values before React rendering", () => {
    expect(
      normalizeProposalMetadata({ title: { unsafe: true }, body: 42 }),
    ).toEqual({});
    expect(normalizeProposalMetadata({ title: "x".repeat(1_001) })).toEqual({});
  });
});
