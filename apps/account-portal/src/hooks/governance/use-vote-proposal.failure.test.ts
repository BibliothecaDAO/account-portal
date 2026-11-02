import { describe, expect, it, vi } from "vitest";

import { useVoteProposal } from "./use-vote-proposal";

const sendAsync = vi.hoisted(() =>
  vi.fn(() => Promise.reject(new Error("User rejected"))),
);

// The hook runs outside a renderer: state is the choice under test.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useState: () => [1, vi.fn()],
  useCallback: (callback: unknown) => callback,
}));

vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xabc" }),
  useContract: () => ({ contract: { populate: vi.fn() } }),
  useSendTransaction: () => ({ sendAsync }),
}));

vi.mock("../use-ipfs-pin", () => ({
  useIPFSPin: () => ({ pinToIPFS: vi.fn() }),
}));

const proposal = {
  proposal_id: 7,
  space: { id: "0xspace", authenticators: ["0xauth"] },
} as unknown as Parameters<typeof useVoteProposal>[0];

describe("useVoteProposal failures", () => {
  it("lets a wallet failure reach the caller, so the dialog can say so", async () => {
    await expect(useVoteProposal(proposal).vote("")).rejects.toThrow(
      "User rejected",
    );
  });
});
