import { ProposalsDocument } from "@/gql/snapshot/graphql";
import { describe, expect, it } from "vitest";

describe("Snapshot proposal document", () => {
  it("contains only fields supported by the current Snapshot schema", () => {
    const document = ProposalsDocument.toString();

    expect(document).toContain("proposal_id");
    expect(document).toContain("authenticators");
    expect(document).not.toContain("execution_ready");
  });
});
