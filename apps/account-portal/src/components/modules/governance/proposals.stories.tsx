import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Choice } from "@/types/snapshot";
import { fn } from "storybook/test";

import type { ProposalRowData } from "./proposal-list-item";
import { ProposalArticle, ProposalVotePanel } from "./proposal-detail";
import { getProposalShortId, ProposalRow } from "./proposal-list-item";
import { ProposalListEmpty, ProposalListFailed } from "./proposal-list";
import { ProposalListSkeleton } from "./proposal-list-skeleton";
import { ProposalResults } from "./proposal-results";
import { getProposalStatus, ProposalStatusBadge } from "./proposal-status";
import { ProposalUserVoteBadge } from "./proposal-user-vote-badge";
import { ProposalVoteButtons, ProposalVoteDialog } from "./proposal-vote-action";
import { SnapshotLink } from "./snapshot-link";

const DAY = 24 * 60 * 60;
const now = Math.floor(Date.now() / 1000);

const proposal = (
  id: number,
  title: string,
  endOffsetDays: number,
  scores: [number, number, number],
): ProposalRowData => ({
  id: `sn:0x07bd…:${id}`,
  proposal_id: id,
  max_end: now + endOffsetDays * DAY,
  vote_count: Math.round((scores[0] + scores[1] + scores[2]) / 40),
  scores_1: scores[0],
  scores_2: scores[1],
  scores_3: scores[2],
  scores_total: scores[0] + scores[1] + scores[2],
  metadata: { title },
  author: {
    id: "0x04a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef1234",
  },
});

const proposals = {
  active: proposal(
    42,
    "RIP-42: Fund the Eternum season 2 prize pool",
    3,
    [1820, 410, 60],
  ),
  passed: proposal(
    41,
    "RIP-41: Adopt veLORDS reward schedule",
    -6,
    [2400, 300, 120],
  ),
  failed: proposal(
    40,
    "RIP-40: Reduce bridge fee to zero",
    -20,
    [700, 1400, 80],
  ),
  quorum: proposal(
    39,
    "RIP-39: Rename the Lords of the Loot council",
    -40,
    [300, 120, 40],
  ),
};

const voteButtons = <ProposalVoteButtons onChoose={fn()} />;

const body = `## Summary

Allocate **250,000 LORDS** from the treasury to the Eternum season 2 prize pool.

## Motivation

- Reward the top realms and guilds
- Attract new players for the season launch

| Rank | Share |
| ---- | ----- |
| 1st  | 40%   |
| 2nd  | 25%   |
| 3rd  | 15%   |
`;

const meta = {
  title: "Pages/Governance/Proposals",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Rows() {
  return (
    <div className="divide-border flex flex-col divide-y">
      <ProposalRow
        proposal={proposals.active}
        authorName="loaf.stark"
        voteAction={voteButtons}
      />
      <ProposalRow
        proposal={proposals.passed}
        authorName="loaf.stark"
        voteChoice={1}
      />
      <ProposalRow proposal={proposals.failed} voteChoice={3} />
      <ProposalRow proposal={proposals.quorum} voteChoice={0} />
    </div>
  );
}

export const List: Story = {
  render: () => (
    <PageContainer>
      <PageHeader
        title="Proposals"
        description="Realms DAO proposals on Snapshot. Vote on open proposals or review past outcomes."
        actions={
          <>
            <SnapshotLink />
            <Button variant="outline" size="sm">
              Delegates
            </Button>
          </>
        }
      />
      <SectionCard title="All proposals" contentClassName="py-0">
        <Rows />
      </SectionCard>
    </PageContainer>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <PageContainer>
      <SectionCard title="All proposals" contentClassName="py-0">
        <ProposalListSkeleton rows={5} />
      </SectionCard>
    </PageContainer>
  ),
};

export const ListEmpty: Story = {
  render: () => (
    <PageContainer>
      <SectionCard title="All proposals" contentClassName="py-0">
        <ProposalListEmpty />
      </SectionCard>
    </PageContainer>
  ),
};

export const ListFailed: Story = {
  render: () => (
    <PageContainer>
      <SectionCard title="All proposals" contentClassName="py-0">
        <ProposalListFailed onRetry={fn()} />
      </SectionCard>
    </PageContainer>
  ),
};

const voteDialogArgs = {
  open: true,
  onOpenChange: fn(),
  proposalTitle: "RIP-42: Fund the Eternum season 2 prize pool",
  selectedChoice: Choice.Against,
  onChoiceChange: fn(),
  reason: "",
  onReasonChange: fn(),
  onSubmit: fn(),
};

export const VoteDialog: Story = {
  render: () => (
    <PageContainer>
      {voteButtons}
      <ProposalVoteDialog {...voteDialogArgs} />
    </PageContainer>
  ),
};

export const VoteDialogSubmitting: Story = {
  render: () => (
    <PageContainer>
      {voteButtons}
      <ProposalVoteDialog {...voteDialogArgs} isSubmitting />
    </PageContainer>
  ),
};

const detailArgs = (p: ProposalRowData) => ({
  title: p.metadata?.title ?? "",
  shortId: getProposalShortId(p.proposal_id),
  author: "loaf.stark",
  createdAt: new Date((p.max_end - 7 * DAY) * 1000),
  status: getProposalStatus(p),
  body,
});

export const DetailActive: Story = {
  render: () => (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3">
        <ProposalArticle className="@3xl:col-span-2" {...detailArgs(proposals.active)} />
        <SectionCard title="Vote" className="h-fit">
          <ProposalVotePanel
            votingPower="12"
            voteAction={voteButtons}
            results={<ProposalResults proposal={proposals.active} />}
          />
        </SectionCard>
      </div>
    </PageContainer>
  ),
};

export const DetailClosed: Story = {
  render: () => (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3">
        <ProposalArticle className="@3xl:col-span-2" {...detailArgs(proposals.passed)} />
        <SectionCard title="Vote" className="h-fit">
          <ProposalVotePanel
            userVote={<ProposalUserVoteBadge choice={1} />}
            results={<ProposalResults proposal={proposals.passed} />}
          />
        </SectionCard>
      </div>
    </PageContainer>
  ),
};

export const Statuses: Story = {
  render: () => (
    <PageContainer width="narrow">
      <SectionCard title="Status badges">
        <div className="flex flex-wrap gap-2">
          {Object.values(proposals).map((p) => (
            <ProposalStatusBadge key={p.id} status={getProposalStatus(p)} />
          ))}
          <ProposalUserVoteBadge choice={1} />
          <ProposalUserVoteBadge choice={2} />
          <ProposalUserVoteBadge choice={3} />
        </div>
      </SectionCard>
    </PageContainer>
  ),
};
