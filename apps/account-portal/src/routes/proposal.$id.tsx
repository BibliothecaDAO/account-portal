import { NotFoundView } from "@/components/layout/not-found";
import { PageContainer } from "@/components/layout/page-container";
import {
  ProposalArticle,
  ProposalVotePanel,
} from "@/components/modules/governance/proposal-detail";
import { getProposalShortId } from "@/components/modules/governance/proposal-list-item";
import { ProposalResults } from "@/components/modules/governance/proposal-results";
import {
  getProposalStatus,
  isProposalActive,
} from "@/components/modules/governance/proposal-status";
import { ProposalUserVoteBadge } from "@/components/modules/governance/proposal-user-vote-badge";
import { ProposalVoteAction } from "@/components/modules/governance/proposal-vote-action";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import { useVotingPower } from "@/hooks/governance/use-voting-power";
import { useStarkDisplayName } from "@/hooks/use-stark-name";
import { getProposalQueryOptions } from "@/lib/snapshot/getProposals";
import { getUserVotesQueryOptions } from "@/lib/snapshot/getUserVotes";
import { isMatchingProposalVote } from "@/lib/snapshot/proposal-id";
import {
  formatAddress,
  shortenAddress,
  SUPPORTED_L2_CHAIN_ID,
} from "@/utils/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { env } from "env";
import { ArrowLeft } from "lucide-react";
import { num } from "starknet";

import { SnapshotSpaceAddresses } from "@realms-world/constants";

export const Route = createFileRoute("/proposal/$id")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { id } = params;
    return context.queryClient.ensureQueryData(getProposalQueryOptions({ id }));
  },
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data: votingPower } = useVotingPower();

  const { data: proposalQuery } = useSuspenseQuery(
    getProposalQueryOptions({
      id,
    }),
  );
  const { data } = useCurrentDelegate();
  const delegateAddress =
    data && BigInt(data) !== 0n ? formatAddress(num.toHex(BigInt(data))) : "";

  const { data: userVotesQuery } = useQuery(
    getUserVotesQueryOptions({
      spaceIds: [SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string],
      limit: 100,
      skip: 0,
      voter: delegateAddress,
    }),
  );

  // Find the vote that matches this proposal ID
  const userVoteRef = userVotesQuery?.votes?.find((vote) =>
    isMatchingProposalVote(vote?.proposal, id),
  );

  const proposal = proposalQuery.proposal;
  const authorAddress = (proposal?.author.id ?? "0x0") as `0x${string}`;
  const name = useStarkDisplayName(authorAddress);

  if (!proposal) {
    return (
      <PageContainer width="narrow">
        <NotFoundView
          title="Proposal not found"
          description="This proposal does not exist or has been removed."
        />
      </PageContainer>
    );
  }

  let body = proposal.metadata?.body as string;
  const createdTime = proposal.created
    ? new Date(proposal.created * 1000)
    : null;

  if (body && typeof body === "string") {
    body = body.replace(/ipfs:\/\/\S+/g, (match) =>
      match.replace("ipfs://", env.VITE_PUBLIC_IPFS_GATEWAY ?? ""),
    );
  }
  const isActive = isProposalActive(proposal);

  const votePanel = (
    <ProposalVotePanel
      votingPower={votingPower ? Number(votingPower).toString() : undefined}
      voteAction={
        isActive ? <ProposalVoteAction proposal={proposal} /> : undefined
      }
      userVote={
        userVoteRef ? (
          <ProposalUserVoteBadge choice={userVoteRef.choice} />
        ) : undefined
      }
      results={<ProposalResults proposal={proposal} />}
    />
  );

  return (
    <PageContainer>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/proposal/list">
          <ArrowLeft />
          All proposals
        </Link>
      </Button>
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-3">
        <ProposalArticle
          className="@3xl:col-span-2"
          title={proposal.metadata?.title as string}
          shortId={getProposalShortId(proposal.proposal_id)}
          author={
            proposal.author.id
              ? name || shortenAddress(proposal.author.id)
              : undefined
          }
          createdAt={createdTime}
          status={getProposalStatus(proposal)}
          body={body}
        />
        <aside className="@3xl:sticky @3xl:top-20">
          <SectionCard title="Vote">{votePanel}</SectionCard>
        </aside>
      </div>
    </PageContainer>
  );
}
