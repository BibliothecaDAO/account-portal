import { describe, expect, it, vi } from "vitest";

import { pinPayload } from "./pin-payload";

describe("pinPayload", () => {
  it("returns a stable provider and CID result", async () => {
    const pinImpl = vi.fn(() =>
      Promise.resolve({ provider: "ipfs", cid: "QmCid" }),
    );

    await expect(pinPayload({ reason: "For" }, pinImpl)).resolves.toEqual({
      provider: "ipfs",
      cid: "QmCid",
    });
  });

  it("rejects an empty upstream result", async () => {
    await expect(
      pinPayload({ reason: "For" }, () => Promise.resolve(undefined)),
    ).rejects.toThrow("Failed to pin payload");
  });
});
