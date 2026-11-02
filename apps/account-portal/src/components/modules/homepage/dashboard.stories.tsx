import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Gavel } from "lucide-react";
import { fn } from "storybook/test";

import { ClaimsPanel } from "./claims-panel";
import { DashboardStats, DashboardStatsSkeleton } from "./dashboard-stats";
import { DelegateSummaryView } from "../governance/delegate-row";
import { ProposalListEmpty, ProposalListFailed } from "../governance/proposal-list";
import {
  CurrentDelegatePanel,
  CurrentDelegateSkeleton,
  NoDelegateCard,
} from "./governance-panel";
import { ProposalListSkeleton } from "./proposal-list-skeleton";
import { RealmsPreview } from "./realms-preview";

const realm = (id: number, name: string): RealmInventoryToken => ({
  token_id: id,
  metadata_status: "unavailable",
  metadata: JSON.stringify({
    name,
    description: "",
    image: "",
    attributes: [
      { trait_type: "Resource", value: "Wood" },
      { trait_type: "Resource", value: "Stone" },
      { trait_type: "Resource", value: "Coal" },
    ],
  }),
});

const realms = [
  realm(1, "Stolsli"),
  realm(23, "Ilum"),
  realm(144, "Smutmum"),
  realm(512, "Nhalnar"),
  realm(3324, "Azebiz"),
  realm(4001, "Olsosi"),
  realm(6700, "Grahbem"),
];

const stats = {
  realmsL1: 3,
  realmsL2: realms.length,
  lordsL1: "12.4K",
  lordsL2: "48.2K",
  lordsStaked: "124.5K",
};

const read = (lords: number) => ({ status: "read", amount: BigInt(lords) * 10n ** 18n }) as const;

const claims = {
  realmsClaimable: read(1_284),
  veLordsClaimable: read(312),
  onClaimRealms: fn(),
  onClaimVeLords: fn(),
};

const meta = {
  title: "Dashboard/Sections",
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="@container">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Stats: Story = { render: () => <DashboardStats {...stats} /> };
export const StatsLoading: Story = { render: () => <DashboardStatsSkeleton /> };

export const Claims: Story = {
  render: () => (
    <div className="max-w-xl">
      <ClaimsPanel {...claims} />
    </div>
  ),
};
export const ClaimsEmpty: Story = {
  render: () => (
    <div className="max-w-xl">
      <ClaimsPanel {...claims} realmsClaimable={read(0)} veLordsClaimable={read(0)} />
    </div>
  ),
};
export const ClaimsUnknown: Story = {
  name: "Claims · not read yet",
  render: () => (
    <div className="max-w-xl">
      <ClaimsPanel
        {...claims}
        realmsClaimable={{ status: "unknown" }}
        veLordsClaimable={read(0)}
      />
    </div>
  ),
};
export const ClaimsFailed: Story = {
  name: "Claims · read failed",
  render: () => (
    <div className="max-w-xl">
      <ClaimsPanel
        {...claims}
        realmsClaimable={read(0)}
        veLordsClaimable={{ status: "failed" }}
      />
    </div>
  ),
};
export const ClaimsSubmitting: Story = {
  render: () => (
    <div className="max-w-xl">
      <ClaimsPanel {...claims} isClaimingRealms />
    </div>
  ),
};

export const NoDelegate: Story = {
  render: () => (
    <div className="max-w-xl">
      <NoDelegateCard />
    </div>
  ),
};

const currentDelegate = {
  id: "1",
  user: "0x01a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef12",
  delegatedVotes: "1240",
  delegateProfile: {
    statement:
      "Long-time Realms holder focused on sustainable treasury management and growing Eternum.",
  },
};

export const YourDelegate: Story = {
  render: () => (
    <div className="max-w-xl">
      <CurrentDelegatePanel>
        <DelegateSummaryView delegate={currentDelegate} name="loaf.stark" />
      </CurrentDelegatePanel>
    </div>
  ),
};
export const YourDelegateLoading: Story = {
  render: () => (
    <div className="max-w-xl">
      <CurrentDelegateSkeleton />
    </div>
  ),
};

export const Realms: Story = {
  render: () => <RealmsPreview viewState="ready" tokens={realms} status="ready" />,
};
export const RealmsEmpty: Story = {
  render: () => <RealmsPreview viewState="ready" tokens={[]} status="ready" />,
};
export const RealmsLoading: Story = {
  render: () => <RealmsPreview viewState="loading" tokens={[]} />,
};
export const RealmsSyncing: Story = {
  render: () => <RealmsPreview viewState="syncing" tokens={[]} status="syncing" />,
};
export const RealmsError: Story = {
  render: () => <RealmsPreview viewState="error" tokens={[]} onRetry={fn()} />,
};

function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your Realms, LORDS, rewards and governance across Ethereum and Starknet."
        actions={
          <Button variant="outline" size="sm">
            <Gavel />
            Market
          </Button>
        }
      />
      <DashboardStats {...stats} />
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2">
        <ClaimsPanel {...claims} />
        <CurrentDelegatePanel>
          <DelegateSummaryView delegate={currentDelegate} name="loaf.stark" />
        </CurrentDelegatePanel>
      </div>
      <SectionCard title="Recent proposals" contentClassName="pt-0">
        <ProposalListSkeleton />
      </SectionCard>
      <RealmsPreview viewState="ready" tokens={realms} status="ready" />
    </PageContainer>
  );
}

export const ProposalsEmpty: Story = {
  render: () => (
    <SectionCard title="Recent proposals" contentClassName="pt-0">
      <ProposalListEmpty />
    </SectionCard>
  ),
};
export const ProposalsFailed: Story = {
  render: () => (
    <SectionCard title="Recent proposals" contentClassName="pt-0">
      <ProposalListFailed onRetry={fn()} />
    </SectionCard>
  ),
};

export const FullPage: Story = {
  name: "Full page",
  parameters: { layout: "fullscreen" },
  render: () => <DashboardPage />,
};

export const FullPageLoading: Story = {
  name: "Full page · loading",
  parameters: { layout: "fullscreen" },
  render: () => (
    <PageContainer>
      <PageHeader title="Dashboard" />
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2">
        <ClaimsPanel
          {...claims}
          realmsClaimable={{ status: "unknown" }}
          veLordsClaimable={{ status: "unknown" }}
        />
        <CurrentDelegateSkeleton />
      </div>
      <SectionCard title="Recent proposals" contentClassName="pt-0">
        <ProposalListSkeleton />
      </SectionCard>
      <RealmsPreview viewState="loading" tokens={[]} />
    </PageContainer>
  ),
};
