import { describe, expect, it } from "vitest";

import {
  formatSnapshotProposalReference,
  isMatchingProposalVote,
  parseProposalIdForContract,
} from "./proposal-id";

describe("parseProposalIdForContract", () => {
  it.each([
    ["42", 42n],
    [" 42 ", 42n],
    ["0x2a", 42n],
    [(2n ** 256n - 1n).toString(), 2n ** 256n - 1n],
  ])("parses a valid uint256 proposal ID (%s)", (value, expected) => {
    expect(parseProposalIdForContract(value)).toBe(expected);
  });

  it.each(["", "-1", "1.5", "proposal-1", (2n ** 256n).toString()])(
    "rejects an invalid uint256 proposal ID (%s)",
    (value) => {
      expect(parseProposalIdForContract(value)).toBeNull();
    },
  );
});

describe("Snapshot proposal references", () => {
  it("matches equivalent numeric proposal references", () => {
    expect(isMatchingProposalVote("space/42", "#42")).toBe(true);
  });

  it("rejects malformed proposal references", () => {
    expect(isMatchingProposalVote("space/not-a-number", "42")).toBe(false);
  });

  it("formats a canonical space/proposal reference", () => {
    expect(formatSnapshotProposalReference("space", "#42")).toBe("space/42");
  });
});
