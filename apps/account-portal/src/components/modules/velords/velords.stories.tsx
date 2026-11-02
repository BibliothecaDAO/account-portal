import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  computeTvlUsd,
  formatTvlDisplay,
  parseVelordsView,
  UNKNOWN_VALUE,
} from "@/lib/velords-utils";
import type { VelordsView } from "@/lib/velords-utils";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router";
import { Copy, Link2, Plus, Unlock } from "lucide-react";
import { parseEther } from "viem";
import { expect, fn } from "storybook/test";

import { VelordsRewardsView } from "./claim-rewards";
import { VelordsLockActivity } from "./lock-activity";
import { VeLordsRewardsChart } from "./rewards-chart";
import { VelordsSourceBreakdown } from "./source-breakdown";
import { StakeLordsView } from "./stake-lords";
import { VelordsTrendsPanel } from "./trends-panel";
import { VelordsPosition } from "./velords-position";
import { MetricValueSkeleton, VelordsStats } from "./velords-stats";

const e18 = (n: number) => (BigInt(n) * 10n ** 18n).toString();

const GAME_FEES =
  "0x045c587318c9ebcf2fbe21febf288ee2e3597a21cd48676005a5770a50d433c5";
const CRYPTS =
  "0x047230028629128ac5bfbb384d32f925e70e329b624fc5d82e9c60f5746795cd";
const UNKNOWN_SOURCE =
  "0x0789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123";

const sources = [
  {
    sender: GAME_FEES,
    totalWei: e18(182_400),
    txCount: 12,
    sharePercent: "64.2",
  },
  {
    sender: CRYPTS,
    totalWei: e18(71_250),
    txCount: 8,
    sharePercent: "25.1",
  },
  {
    sender: UNKNOWN_SOURCE,
    totalWei: e18(30_400),
    txCount: 3,
    sharePercent: "10.7",
  },
];

const addressUrl = (address: string) =>
  `https://voyager.online/contract/${address}`;

const rewardBurns = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].flatMap((weeksAgo) =>
  [GAME_FEES, CRYPTS].map((sender, i) => ({
    sender,
    amount: e18(40_000 - weeksAgo * 1_500 - i * 22_000),
    transaction_hash: `0x${weeksAgo}${i}`,
    timestamp: new Date(Date.UTC(2026, 9, 26) - weeksAgo * 7 * 86_400_000),
  })),
);

const locks = [
  { week: "2026-08-24", updates: 41, uniqueWallets: 33 },
  { week: "2026-08-31", updates: 37, uniqueWallets: 29 },
  { week: "2026-09-07", updates: 52, uniqueWallets: 44 },
  { week: "2026-09-14", updates: 48, uniqueWallets: 40 },
];

const rewardsWeekly = locks.map(({ week }, i) => {
  const totalWei = parseEther(String(30_000 + i * 4_000)).toString();
  return { week, totalWei, bySender: { [sources[0].sender]: totalWei } };
});

const position = {
  balance: "84,120",
  sharePercent: "0.62%",
  locked: "120,000",
  unlockDate: "3/14/2028",
  estimatedWeeklyRewards: "~312.40 LORDS",
};

function Stats({
  loading = false,
  readFailed = false,
  tvl = "$642,118",
}: {
  loading?: boolean;
  readFailed?: boolean;
  tvl?: string;
}) {
  const v = (value: string) => (loading ? <MetricValueSkeleton /> : value);
  const read = (value: string) => v(readFailed ? UNKNOWN_VALUE : value);
  return (
    <VelordsStats>
      <MetricCard compact label="Voting power" value={read("13,600,000")} />
      <MetricCard compact label="LORDS locked" value={read("21,400,000")} />
      <MetricCard compact label="TVL" value={v(tvl)} />
      <MetricCard compact label="Rewards · 7d (LORDS)" value={v("48,210")} />
      <MetricCard compact label="Rewards · 30d (LORDS)" value={v("201,884")} />
      <MetricCard
        compact
        label="Trailing APY · 4w"
        value={read("18.42%")}
        valueClassName={readFailed ? undefined : "text-trade-up"}
      />
    </VelordsStats>
  );
}

const stakeActions = (
  <>
    <Button>
      <Plus />
      Stake
    </Button>
    <Button variant="outline">
      <Unlock />
      Early Unlock
    </Button>
  </>
);

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md">{children}</div>;
}

function RewardsChart() {
  return <VeLordsRewardsChart data={rewardBurns} selectedPeriod="3m" />;
}

function SourcesAndLocks() {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2">
        <VelordsSourceBreakdown data={sources} addressUrl={addressUrl} />
        <VelordsLockActivity data={locks} />
      </div>
    </div>
  );
}

function ViewTabs({ defaultView = "breakdown" }: { defaultView?: VelordsView }) {
  return (
    <Tabs defaultValue={defaultView} className="gap-4">
      <TabsList>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
      </TabsList>
      <TabsContent value="breakdown">
        <SourcesAndLocks />
      </TabsContent>
      <TabsContent value="trends">
        <VelordsTrendsPanel rewardsWeekly={rewardsWeekly} lockWeekly={locks} />
      </TabsContent>
    </Tabs>
  );
}

/** The address bar once an old link has opened: this is what Copy link copies. */
function AddressBar() {
  const href = useRouterState({ select: (state) => state.location.href });
  return <output className="realm-stat text-sm">{href}</output>;
}

const oldViewLink = createRouter({
  routeTree: (() => {
    const root = createRootRoute();
    return root.addChildren([
      createRoute({
        getParentRoute: () => root,
        path: "/velords",
        validateSearch: (search: Record<string, unknown>) => ({
          view: parseVelordsView(search.view),
        }),
        component: AddressBar,
      }),
    ]);
  })(),
  history: createMemoryHistory({ initialEntries: ["/velords?view=sources"] }),
});

const rewardsProps = {
  claimable: parseEther("312.4"),
  recipient: "0x04a1c0f3b2e8d7c6a5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d49c2e",
  isRecipientValid: true,
  canClaim: true,
  onClaim: fn(),
};

const meta = {
  title: "Pages/veLORDS/Sections",
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

export const Metrics: Story = { render: () => <Stats /> };
export const MetricsLoading: Story = { render: () => <Stats loading /> };
export const MetricsReadFailed: Story = {
  render: () => <Stats readFailed tvl={UNKNOWN_VALUE} />,
};

export const TabsBreakdown: Story = {
  name: "Tabs · Breakdown",
  render: () => <ViewTabs />,
  play: async ({ canvas }) => {
    const tabs = await canvas.findAllByRole("tab");
    await expect(tabs.map((tab) => tab.textContent)).toEqual(["Breakdown", "Trends"]);
    await expect(canvas.getByRole("tab", { name: "Breakdown" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};
export const TabsOldLink: Story = {
  name: "Tabs · old ?view=sources link",
  render: () => <RouterProvider router={oldViewLink} />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("/velords?view=breakdown")).toBeInTheDocument();
  },
};
export const TabsTrends: Story = {
  name: "Tabs · Trends",
  render: () => <ViewTabs defaultView="trends" />,
};

export const Position: Story = {
  render: () => (
    <div className="max-w-md">
      <VelordsPosition {...position} />
    </div>
  ),
};
export const PositionEmpty: Story = {
  render: () => (
    <div className="max-w-md">
      <VelordsPosition />
    </div>
  ),
};

export const TvlKnown: Story = {
  name: "TVL · known",
  render: () => (
    <Stats tvl={formatTvlDisplay(computeTvlUsd(parseEther("21400000"), "0.03"), false)} />
  ),
};
export const TvlUnknown: Story = {
  name: "TVL · unknown",
  render: () => (
    <Stats tvl={formatTvlDisplay(computeTvlUsd(parseEther("21400000"), undefined), false)} />
  ),
};
export const TvlZero: Story = {
  name: "TVL · real zero",
  render: () => <Stats tvl={formatTvlDisplay(computeTvlUsd(0n, "0.03"), false)} />,
};

export const StakingNoneStaked: Story = {
  name: "Staking · 0%",
  render: () => (
    <Panel>
      <StakeLordsView stakedLords={0} availableLords={1_350_000} actions={stakeActions} />
    </Panel>
  ),
};
export const StakingPartStaked: Story = {
  name: "Staking · 15%",
  render: () => (
    <Panel>
      <StakeLordsView
        stakedLords={202_000}
        availableLords={1_148_581.45}
        actions={stakeActions}
      />
    </Panel>
  ),
};
export const StakingAllStaked: Story = {
  name: "Staking · 100%",
  render: () => (
    <Panel>
      <StakeLordsView stakedLords={1_350_000} availableLords={0} actions={stakeActions} />
    </Panel>
  ),
};
export const StakingLongNumbers: Story = {
  name: "Staking · long numbers",
  render: () => (
    <Panel>
      <StakeLordsView
        stakedLords={98_765_432_109.87}
        availableLords={1_234_567_890_123.45}
        actions={stakeActions}
      />
    </Panel>
  ),
};
export const StakingLoading: Story = {
  name: "Staking · loading",
  render: () => (
    <Panel>
      <StakeLordsView actions={stakeActions} />
    </Panel>
  ),
};
export const StakingWide: Story = {
  name: "Staking · full width",
  render: () => (
    <StakeLordsView
      stakedLords={202_000}
      availableLords={1_148_581.45}
      actions={stakeActions}
    />
  ),
};
export const StakingDisconnected: Story = {
  name: "Staking · disconnected",
  render: () => (
    <Panel>
      <StakeLordsView connectAction={<Button>Connect Wallet to Stake</Button>} />
    </Panel>
  ),
};

export const RewardsPanel: Story = {
  name: "Rewards · claimable",
  render: () => (
    <Panel>
      <VelordsRewardsView {...rewardsProps} />
    </Panel>
  ),
};
export const RewardsPanelEmpty: Story = {
  name: "Rewards · nothing to claim",
  render: () => (
    <Panel>
      <VelordsRewardsView {...rewardsProps} claimable={0n} canClaim={false} />
    </Panel>
  ),
};
export const RewardsPanelSubmitting: Story = {
  name: "Rewards · submitting",
  render: () => (
    <Panel>
      <VelordsRewardsView {...rewardsProps} isSubmitting />
    </Panel>
  ),
};

export const Chart: Story = { render: () => <RewardsChart /> };

export const Sources: Story = {
  render: () => <VelordsSourceBreakdown data={sources} addressUrl={addressUrl} />,
};
export const SourcesLongLabels: Story = {
  name: "Sources · long labels and numbers",
  render: () => (
    <Panel>
      <VelordsSourceBreakdown
        addressUrl={addressUrl}
        data={[
          {
            sender: GAME_FEES,
            totalWei: e18(98_765_432_109),
            txCount: 12_345,
            sharePercent: "99.9",
          },
          {
            sender: UNKNOWN_SOURCE,
            totalWei: e18(1_234_567),
            txCount: 8,
            sharePercent: "0.1",
          },
        ]}
      />
    </Panel>
  ),
};
export const SourcesLoading: Story = {
  render: () => (
    <VelordsSourceBreakdown data={[]} isLoading addressUrl={addressUrl} />
  ),
};
export const SourcesEmpty: Story = {
  render: () => <VelordsSourceBreakdown data={[]} addressUrl={addressUrl} />,
};

export const Locks: Story = {
  render: () => <VelordsLockActivity data={locks} />,
};
export const LocksEmpty: Story = {
  render: () => <VelordsLockActivity data={[]} />,
};

export const FullPage: Story = {
  name: "Full page",
  parameters: { layout: "fullscreen" },
  render: () => (
    <PageContainer>
      <PageHeader
        title="veLORDS"
        description="Stake LORDS for voting power and a share of weekly protocol rewards."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Link2 />
              Copy link
            </Button>
            <Button variant="outline" size="sm">
              <Copy />
              Copy summary
            </Button>
          </>
        }
      />
      <Stats />
      <div className="grid grid-cols-1 gap-6 @5xl:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-6 @5xl:col-span-3">
          <RewardsChart />
          <ViewTabs />
        </div>
        <div className="order-first flex min-w-0 flex-col gap-6 @5xl:order-none @5xl:col-span-2">
          <VelordsPosition {...position} />
          <StakeLordsView
            stakedLords={202_000}
            availableLords={1_148_581.45}
            actions={stakeActions}
          />
          <VelordsRewardsView {...rewardsProps} />
        </div>
      </div>
    </PageContainer>
  ),
};
