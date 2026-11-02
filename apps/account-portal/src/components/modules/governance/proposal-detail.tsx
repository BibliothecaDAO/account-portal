import { cn } from "@/utils/utils";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

import type { ProposalStatus } from "./proposal-status";
import { ProposalStatusBadge } from "./proposal-status";

/** Proposal title block plus markdown body. Props only; no wallet hooks. */
export function ProposalArticle({
  title,
  shortId,
  author,
  createdAt,
  status,
  body,
  className,
}: {
  className?: string;
  title: string;
  shortId?: string;
  author?: string;
  createdAt?: Date | null;
  status?: ProposalStatus;
  body?: string;
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {status ? <ProposalStatusBadge status={status} /> : null}
          {shortId ? (
            <span className="realm-chip text-muted-foreground">{shortId}</span>
          ) : null}
        </div>
        <h1 className="realm-page-title min-w-0 break-words">{title}</h1>
        <div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-2 text-sm">
          {author ? (
            <span className="min-w-0 truncate">Proposed by {author}</span>
          ) : null}
          {author && createdAt ? <span aria-hidden>·</span> : null}
          {createdAt ? <span>{formatDistanceToNow(createdAt)} ago</span> : null}
        </div>
      </CardHeader>
      {body ? (
        <CardContent className="space-y-6">
          <Separator />
          <div className="text-card-foreground min-w-0 break-words [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto">
            <MarkdownRenderer content={body} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

/** Voting sidebar body: voting power, vote action, the user's vote and results. */
export function ProposalVotePanel({
  votingPower,
  voteAction,
  userVote,
  results,
}: {
  votingPower?: ReactNode;
  voteAction?: ReactNode;
  userVote?: ReactNode;
  results: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      {votingPower ? (
        <div className="flex items-baseline justify-between gap-3">
          <p className="realm-label">Your voting power</p>
          <p className="realm-stat text-sm font-semibold">
            {votingPower}{" "}
            <span className="text-muted-foreground font-sans font-normal">
              Realms
            </span>
          </p>
        </div>
      ) : null}
      {voteAction ? (
        <div className="space-y-2">
          <p className="realm-group-title">Cast your vote</p>
          {voteAction}
        </div>
      ) : null}
      {userVote ? (
        <div className="space-y-2">
          <p className="realm-group-title">You voted</p>
          {userVote}
        </div>
      ) : null}
      <div className="space-y-3">
        <p className="realm-group-title">Results</p>
        {results}
      </div>
    </div>
  );
}
