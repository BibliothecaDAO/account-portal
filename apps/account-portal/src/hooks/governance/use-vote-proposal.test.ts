import type { Proposal } from "@/gql/graphql";
import { Choice } from "@/types/snapshot";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getChoiceEnum, useVoteProposal } from "./use-vote-proposal";

const mocks = vi.hoisted(() => ({
  selectedChoice: null as number | null,
  sendAsync: vi.fn(() => Promise.resolve({ transaction_hash: "0x1" })),
  populate: vi.fn((method: string, args: unknown[]) => ({ method, args })),
}));

// The hook runs outside a renderer: state is the choice under test.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useState: () => [mocks.selectedChoice, vi.fn()],
  useCallback: (callback: unknown) => callback,
}));

vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xabc" }),
  useContract: () => ({ contract: { populate: mocks.populate } }),
  useSendTransaction: () => ({ sendAsync: mocks.sendAsync }),
}));

vi.mock("../use-ipfs-pin", () => ({
  useIPFSPin: () => ({ pinToIPFS: vi.fn() }),
}));

const proposal = {
  proposal_id: 7,
  space: { id: "0xspace", authenticators: ["0xauth"] },
} as unknown as Proposal;

describe("useVoteProposal", () => {
  beforeEach(() => {
    mocks.sendAsync.mockClear();
    mocks.populate.mockClear();
  });

  it.each([
    ["Against", Choice.Against],
    ["For", Choice.For],
    ["Abstain", Choice.Abstain],
  ])("sends a %s vote to the wallet", async (_name, choice) => {
    mocks.selectedChoice = choice;

    await useVoteProposal(proposal).vote("");

    expect(mocks.sendAsync).toHaveBeenCalledTimes(1);
    expect(mocks.populate).toHaveBeenCalledWith(
      "authenticate_vote",
      expect.arrayContaining([getChoiceEnum(choice)]),
    );
  });

  it("sends nothing when no choice is selected", async () => {
    mocks.selectedChoice = null;

    await expect(useVoteProposal(proposal).vote("")).resolves.toBeNull();

    expect(mocks.sendAsync).not.toHaveBeenCalled();
  });
});
