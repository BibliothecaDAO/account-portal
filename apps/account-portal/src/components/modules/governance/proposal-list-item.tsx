import type { Proposal } from "@/gql/snapshot/graphql";
import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { useStarkDisplayName } from "@/hooks/use-stark-name";
import { formatNumber, shortenAddress } from "@/utils/utils";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

import {
  getProposalStatus,
  isProposalActive,
  ProposalStatusBadge,
} from "./proposal-status";
import { ProposalVoteAction } from "./proposal-vote-action";

export type ProposalRowData = Pick<
  Proposal,
  | "id"
  | "proposal_id"
  | "max_end"
  | "vote_count"
  | "scores_total"
  | "scores_1"
  | "scores_2"
  | "scores_3"
> & { metadata?: { title?: string | null } | null; author: { id: string } };

export function getProposalShortId(proposalId: string | number) {
  const id = proposalId.toString();
  if (id.startsWith("0x")) return `#${id.slice(2, 7)}`;
  if ([46, 59].includes(id.length)) return `#${id.slice(-5)}`;
  return `#${id}`;
}

/** Delegate vote line: 4 = no delegate, 1 = for, 3 = against, otherwise did not vote. */
function DelegateVote({ voteChoice }: { voteChoice?: number }) {
  if (voteChoice == 4) return null;
  if (voteChoice === 1) {
    return (
      <span className="text-success flex items-center gap-1.5">
        Delegate: <CheckCircle2 className="size-4" /> For
      </span>
    );
  }
  if (voteChoice === 3) {
    return (
      <span className="text-destructive flex items-center gap-1.5">
        Delegate: <XCircle className="size-4" /> Against
      </span>
    );
  }
  return <span>Delegate did not vote</span>;
}

/** Presentational proposal row. `voteAction` is rendered while voting is open. */
export function ProposalRow({
  proposal,
  authorName,
  voteChoice,
  voteAction,
}: {
  proposal: ProposalRowData;
  authorName?: string;
  voteChoice?: number;
  voteAction?: ReactNode;
}) {
  const isActive = isProposalActive(proposal);
  const scoresTotal = Number(proposal.scores_total);
  const scoresFor = Number(proposal.scores_1);
  const progressValue = scoresTotal > 0 ? (scoresFor / scoresTotal) * 100 : 0;
  const status = getProposalStatus(proposal);

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <Link
        to="/proposal/$id"
        params={{ id: proposal.proposal_id.toString() }}
        className="group min-w-0 flex-1 space-y-1.5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ProposalStatusBadge status={status} />
          <span className="realm-chip text-muted-foreground">
            {getProposalShortId(proposal.proposal_id)}
          </span>
        </div>
        <h3 className="group-hover:text-primary line-clamp-2 font-sans text-lg leading-6 font-semibold break-words normal-case transition-colors">
          {proposal.metadata?.title ?? `Proposal #${proposal.id}`}
        </h3>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="min-w-0 truncate">
            by {authorName || shortenAddress(proposal.author.id)}
          </span>
          <span>{formatNumber(proposal.vote_count, 0)} voters</span>
          <span>{formatNumber(scoresTotal, 0)} votes</span>
          <span>
            {formatDistanceToNow(proposal.max_end * 1000)}{" "}
            {isActive ? "left" : "ago"}
          </span>
        </div>
      </Link>

      {isActive ? (
        <div className="shrink-0">{voteAction}</div>
      ) : (
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Progress
              value={progressValue}
              aria-label={`${Math.round(progressValue)}% voted for`}
              className="bg-destructive/60 w-full sm:w-32"
              indicatorColor="bg-success"
            />
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {Math.round(progressValue)}% for
            </span>
          </div>
          <div className="text-muted-foreground flex min-h-5 items-center text-sm">
            <DelegateVote voteChoice={voteChoice} />
          </div>
        </div>
      )}
    </div>
  );
}

export const ProposalListItem = ({
  proposal,
  voteChoice,
}: {
  proposal: Proposal;
  voteChoice: number;
}) => {
  const name = useStarkDisplayName(proposal.author.id as `0x${string}`);
  return (
    <ProposalRow
      proposal={proposal}
      authorName={name}
      voteChoice={voteChoice}
      voteAction={<ProposalVoteAction proposal={proposal} />}
    />
  );
};
