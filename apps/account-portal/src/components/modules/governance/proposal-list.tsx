import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getProposalsQueryOptions } from "@/lib/snapshot/getProposals";
import { getUserVotesQueryOptions } from "@/lib/snapshot/getUserVotes";
import { isMatchingProposalVote } from "@/lib/snapshot/proposal-id";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";

import { SnapshotSpaceAddresses } from "@realms-world/constants";

import { ProposalListItem } from "./proposal-list-item";

export function ProposalListEmpty() {
  return (
    <p className="text-muted-foreground py-8 text-center text-sm">
      No proposals yet.
    </p>
  );
}

export function ProposalListFailed({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-muted-foreground text-sm">
        Proposals could not be loaded.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function ProposalList({
  limit = 5,
  delegateId,
  loading,
}: {
  limit?: number;
  delegateId?: string;
  /** Placeholder in the shape of the panel holding this list. */
  loading: ReactNode;
}) {
  const proposalsQuery = useQuery(
    getProposalsQueryOptions({
      spaceIds: [SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string],
      limit,
      skip: 0,
      current: 1,
      searchQuery: "",
    }),
  );
  const proposals = proposalsQuery.data?.proposals;

  const { data: userVotesQuery } = useQuery(
    getUserVotesQueryOptions({
      spaceIds: [SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string],
      limit,
      skip: 0,
      voter: delegateId ?? "",
    }),
  );
  const userVotes = userVotesQuery?.votes;

  if (proposalsQuery.isPending) return loading;
  if (proposalsQuery.isError) {
    return <ProposalListFailed onRetry={() => void proposalsQuery.refetch()} />;
  }
  if (!proposals?.length) return <ProposalListEmpty />;

  return (
    <div className="divide-border flex flex-col divide-y">
      {proposals.map((proposal) => {
        const matchingVote = userVotes?.find((vote) => {
          return isMatchingProposalVote(vote?.proposal, proposal?.proposal_id);
        });
        return (
          <ProposalListItem
            key={proposal.id}
            proposal={proposal}
            voteChoice={
              !delegateId || BigInt(delegateId) === 0n
                ? 4
                : matchingVote?.choice
            }
          />
        );
      })}
    </div>
  );
}
