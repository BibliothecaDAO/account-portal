import { Choice } from "@/types/snapshot";
import { describe, expect, it } from "vitest";

import { isVoteChoiceSelected } from "./vote-choice";

describe("isVoteChoiceSelected", () => {
  it("accepts Against even though its contract value is zero", () => {
    expect(isVoteChoiceSelected(Choice.Against)).toBe(true);
  });
});
