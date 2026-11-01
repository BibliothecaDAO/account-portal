import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Copy, Link2 } from "lucide-react";

import { VelordsLockActivity } from "./lock-activity";
import { VelordsSourceBreakdown } from "./source-breakdown";
import { VelordsPosition } from "./velords-position";
import { MetricValueSkeleton, VelordsStats } from "./velords-stats";

const e18 = (n: number) => (BigInt(n) * 10n ** 18n).toString();

const sources = [
  {
    sender: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
    totalWei: e18(182_400),
    txCount: 12,
    sharePercent: "64.2",
  },
  {
    sender: "0x0456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
    totalWei: e18(71_250),
    txCount: 8,
    sharePercent: "25.1",
  },
  {
    sender: "0x0789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    totalWei: e18(30_400),
    txCount: 3,
    sharePercent: "10.7",
  },
];

const locks = [
  { week: "2026-08-24", updates: 41, uniqueWallets: 33 },
  { week: "2026-08-31", updates: 37, uniqueWallets: 29 },
  { week: "2026-09-07", updates: 52, uniqueWallets: 44 },
  { week: "2026-09-14", updates: 48, uniqueWallets: 40 },
];

const position = {
  balance: "84,120",
  sharePercent: "0.62%",
  locked: "120,000",
  unlockDate: "3/14/2028",
  estimatedWeeklyRewards: "~312.40 LORDS",
};

function Stats({ loading = false }: { loading?: boolean }) {
  const v = (value: string) => (loading ? <MetricValueSkeleton /> : value);
  return (
    <VelordsStats>
      <MetricCard
        label="Voting power"
        value={v("13.6M")}
        hint={loading ? undefined : "You: 84,120 (0.62%)"}
      />
      <MetricCard label="LORDS locked" value={v("21.4M")} />
      <MetricCard label="TVL" value={v("$642,118")} />
      <MetricCard label="Rewards · 7d" value={v("48,210.50")} />
      <MetricCard label="Rewards · 30d" value={v("201,884.10")} />
      <MetricCard
        label="Trailing APY · 4w"
        value="18.42%"
        valueClassName="text-trade-up"
      />
    </VelordsStats>
  );
}

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

export const Sources: Story = {
  render: () => <VelordsSourceBreakdown data={sources} />,
};
export const SourcesLoading: Story = {
  render: () => <VelordsSourceBreakdown data={[]} isLoading />,
};
export const SourcesEmpty: Story = {
  render: () => <VelordsSourceBreakdown data={[]} />,
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
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 @5xl:col-span-3">
          <VelordsSourceBreakdown data={sources} />
          <VelordsLockActivity data={locks} />
        </div>
        <div className="min-w-0 @5xl:col-span-2">
          <VelordsPosition {...position} />
        </div>
      </div>
    </PageContainer>
  ),
};
