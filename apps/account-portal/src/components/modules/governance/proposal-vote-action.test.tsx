// @vitest-environment jsdom

import type { ProposalFieldsFragment } from "@/gql/snapshot/graphql";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProposalVoteAction } from "./proposal-vote-action";

const mocks = vi.hoisted(() => ({
  setSelectedChoice: vi.fn(),
  vote: vi.fn(),
}));

vi.mock("env", () => ({
  env: {
    VITE_PUBLIC_CHAIN: "mainnet",
    VITE_TORII_API_URL: "https://torii.example.test",
    VITE_PUBLIC_SLOT: "test",
  },
}));
vi.mock("@/hooks/governance/use-vote-proposal", () => ({
  useVoteProposal: () => ({
    selectedChoice: 1,
    setSelectedChoice: mocks.setSelectedChoice,
    vote: mocks.vote,
  }),
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xabc" }),
}));
vi.mock("@/hooks/use-starknet-wallet", () => ({
  useStarknetWallet: () => ({ openStarknetKitModal: vi.fn() }),
}));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

const proposal = {
  metadata: { title: "Production proposal" },
} as unknown as ProposalFieldsFragment;

describe("ProposalVoteAction", () => {
  beforeEach(() => {
    mocks.setSelectedChoice.mockReset();
    mocks.vote.mockReset();
  });

  afterEach(cleanup);

  it("keeps the dialog open and explains a rejected vote", async () => {
    mocks.vote.mockResolvedValueOnce(null);

    render(<ProposalVoteAction proposal={proposal} />);
    await userEvent.click(screen.getByTitle("Vote FOR"));
    await userEvent.click(screen.getByRole("button", { name: "Submit Vote" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your vote was not submitted. Please try again.",
    );
    expect(
      screen.getByRole("heading", { name: "Confirm Your Vote" }),
    ).toBeVisible();
    expect(mocks.vote).toHaveBeenCalledOnce();
  });

  it("closes only after a successful submission", async () => {
    mocks.vote.mockResolvedValueOnce({ transaction_hash: "0x123" });

    render(<ProposalVoteAction proposal={proposal} />);
    await userEvent.click(screen.getByTitle("Vote FOR"));
    await userEvent.click(screen.getByRole("button", { name: "Submit Vote" }));

    expect(
      screen.queryByRole("heading", { name: "Confirm Your Vote" }),
    ).not.toBeInTheDocument();
  });
});
