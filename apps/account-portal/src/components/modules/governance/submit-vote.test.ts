import { describe, expect, it, vi } from "vitest";

import { submitVote } from "./submit-vote";

describe("submitVote", () => {
  it("reports a vote the wallet accepted as sent, passing the reason through", async () => {
    const vote = vi.fn(() => Promise.resolve({ transaction_hash: "0x1" }));

    await expect(submitVote(vote, "My reason")).resolves.toBe(true);
    expect(vote).toHaveBeenCalledWith("My reason");
  });

  it("reports a rejection as not sent", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);

    await expect(
      submitVote(() => Promise.reject(new Error("rejected")), ""),
    ).resolves.toBe(false);
  });

  it("never reports a vote that returned nothing as sent", async () => {
    await expect(submitVote(() => Promise.resolve(null), "")).resolves.toBe(false);
  });
});
