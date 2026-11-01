import { lazy, Suspense, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VelordsLockActivity } from "@/components/modules/velords/lock-activity";
import { VelordsSourceBreakdown } from "@/components/modules/velords/source-breakdown";
import { VelordsPosition } from "@/components/modules/velords/velords-position";
import {
  MetricValueSkeleton,
  VelordsStats,
} from "@/components/modules/velords/velords-stats";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useVelordsData } from "@/hooks/use-velords-data";
import {
  getVelordsLockActivityQueryOptions,
  getVelordsOverviewQueryOptions,
  getVelordsRewardsSeriesQueryOptions,
} from "@/lib/getVeLordsAnalytics";
import { getVelordsBurnsQueryOptions } from "@/lib/getVeLordsBurns";
import { calculateTrailingApyPercent } from "@/lib/velords-analytics";
import { seo } from "@/utils/seo";
import { formatNumber } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Link2 } from "lucide-react";
import { formatUnits } from "viem";

type VelordsPeriod = "3m" | "6m" | "1y";
type VelordsView = "overview" | "sources" | "locks" | "trends";

const VeLordsRewardsChart = lazy(() =>
  import("@/components/modules/velords/rewards-chart").then((mod) => ({
    default: mod.VeLordsRewardsChart,
  })),
);
const StakeLords = lazy(() =>
  import("@/components/modules/velords/stake-lords").then((mod) => ({
    default: mod.StakeLords,
  })),
);
const VelordsRewards = lazy(() =>
  import("@/components/modules/velords/claim-rewards").then((mod) => ({
    default: mod.VelordsRewards,
  })),
);
const VelordsTrendsPanel = lazy(() =>
  import("@/components/modules/velords/trends-panel").then((mod) => ({
    default: mod.VelordsTrendsPanel,
  })),
);

function parsePeriod(period: unknown): VelordsPeriod {
  return period === "6m" || period === "1y" ? period : "3m";
}

function parseView(view: unknown): VelordsView {
  if (view === "sources") return "sources";
  if (view === "locks") return "locks";
  if (view === "trends") return "trends";
  return "overview";
}

function periodToStartDate(period: VelordsPeriod): Date {
  const now = Date.now();
  const periods: Record<VelordsPeriod, number> = {
    "3m": 3 * 30 * 24 * 60 * 60 * 1000,
    "6m": 6 * 30 * 24 * 60 * 60 * 1000,
    "1y": 12 * 30 * 24 * 60 * 60 * 1000,
  };
  return new Date(now - periods[period]);
}

function formatWeiAmount(
  value?: string,
  maximumFractionDigits = 0,
): string | undefined {
  if (!value) return undefined;
  return formatNumber(
    Number(formatUnits(BigInt(value), 18)),
    maximumFractionDigits,
  );
}

export const Route = createFileRoute("/velords/")({
  validateSearch: (search: Record<string, unknown>) => ({
    period: parsePeriod(search.period),
    view: parseView(search.view),
    source:
      typeof search.source === "string" && search.source.trim().length > 0
        ? search.source
        : undefined,
  }),
  head: () => ({
    meta: [
      ...seo({
        title: "RW | veLords Dashboard",
        description:
          "Track veLords rewards, lock activity, and your staking position.",
        image: "/icon.svg",
      }),
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { toast } = useToast();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const selectedPeriod = search.period;
  const selectedView = search.view;
  const startTimestamp = useMemo(
    () => periodToStartDate(selectedPeriod),
    [selectedPeriod],
  );

  const veLordsBurnsQuery = useQuery(
    getVelordsBurnsQueryOptions({
      startTimestamp,
      sender: search.source,
    }),
  );
  const overviewQuery = useQuery(
    getVelordsOverviewQueryOptions({
      period: selectedPeriod,
      source: search.source,
    }),
  );
  const rewardsSeriesQuery = useQuery(
    getVelordsRewardsSeriesQueryOptions({
      period: selectedPeriod,
      source: search.source,
    }),
  );
  const lockActivityQuery = useQuery(
    getVelordsLockActivityQueryOptions({
      period: selectedPeriod,
    }),
  );
  const { address } = useAccount();
  const velordsData = useVelordsData();

  const {
    totalSupply,
    totalSupplyRaw,
    lordsLocked,
    tvl,
    isTVLLoading,
    userBalance,
    userSharePercent,
    userLocked,
  } = velordsData;

  const trailingApy = useMemo(() => {
    const weekly = rewardsSeriesQuery.data?.weekly ?? [];
    const trailingWeeks = weekly.slice(-4).map((row) => row.totalWei);
    return calculateTrailingApyPercent(trailingWeeks, totalSupplyRaw);
  }, [rewardsSeriesQuery.data?.weekly, totalSupplyRaw]);

  const estimatedWeeklyRewards = useMemo(() => {
    const latestWeek = rewardsSeriesQuery.data?.weekly.at(-1);
    if (!latestWeek || !userSharePercent) return undefined;
    const latestWeekRewards = Number(
      formatUnits(BigInt(latestWeek.totalWei), 18),
    );
    return (latestWeekRewards * Number(userSharePercent)) / 100;
  }, [rewardsSeriesQuery.data?.weekly, userSharePercent]);

  const rewards7d = formatWeiAmount(overviewQuery.data?.rewards7dWei, 2);
  const rewards30d = formatWeiAmount(overviewQuery.data?.rewards30dWei, 2);

  const handleTimePeriodChange = (period: VelordsPeriod) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        period,
      }),
    });
  };

  const handleViewChange = (view: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        view: parseView(view),
      }),
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ description: "veLords dashboard link copied." });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Unable to copy link.",
      });
    }
  };

  const handleCopySummary = async () => {
    const summary = [
      `veLords Dashboard (${selectedPeriod})`,
      `TVL: ${
        typeof tvl === "number" && Number.isFinite(tvl)
          ? `$${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          : "$0"
      }`,
      `Locked: ${lordsLocked ?? "0"} LORDS`,
      `30d Rewards: ${rewards30d ?? "0"} LORDS`,
      `APY: ${formatNumber(trailingApy, 2)}%`,
      `Updated: ${new Date().toISOString().slice(0, 10)}`,
    ].join(" | ");

    try {
      await navigator.clipboard.writeText(summary);
      toast({ description: "veLords summary copied." });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Unable to copy summary.",
      });
    }
  };

  const tvlDisplay =
    typeof tvl === "number" && Number.isFinite(tvl)
      ? `$${tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : isTVLLoading
        ? undefined
        : "$0";

  return (
    <PageContainer>
      <PageHeader
        title="veLORDS"
        description="Stake LORDS for voting power and a share of weekly protocol rewards."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Link2 />
              Copy link
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopySummary}>
              <Copy />
              Copy summary
            </Button>
          </>
        }
      />

      <VelordsStats>
        <MetricCard
          compact
          label="Voting power"
          value={totalSupply ?? <MetricValueSkeleton />}
          hint={
            userBalance !== undefined && userSharePercent !== undefined
              ? `You: ${userBalance} (${userSharePercent}%)`
              : undefined
          }
        />
        <MetricCard
          compact
          label="LORDS locked"
          value={lordsLocked ?? <MetricValueSkeleton />}
        />
        <MetricCard compact label="TVL" value={tvlDisplay ?? <MetricValueSkeleton />} />
        <MetricCard
          compact
          label="Rewards · 7d"
          value={rewards7d ?? <MetricValueSkeleton />}
        />
        <MetricCard
          compact
          label="Rewards · 30d"
          value={rewards30d ?? <MetricValueSkeleton />}
        />
        <MetricCard
          compact
          label="Trailing APY · 4w"
          value={`${formatNumber(trailingApy, 2)}%`}
          valueClassName="text-trade-up"
        />
      </VelordsStats>

      <div className="grid grid-cols-1 gap-6 @5xl:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-6 @5xl:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <VeLordsRewardsChart
              selectedPeriod={selectedPeriod}
              totalSupplyRaw={totalSupplyRaw}
              data={veLordsBurnsQuery.data ?? []}
              onTimePeriodChange={handleTimePeriodChange}
              isLoading={veLordsBurnsQuery.isLoading}
              errorMessage={
                veLordsBurnsQuery.error instanceof Error
                  ? veLordsBurnsQuery.error.message
                  : undefined
              }
            />
          </Suspense>

          <Tabs
            value={selectedView}
            onValueChange={handleViewChange}
            className="gap-4"
          >
            <TabsList className="max-w-full overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="locks">Locks</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <VelordsSourceBreakdown
                  data={rewardsSeriesQuery.data?.sources ?? []}
                  isLoading={rewardsSeriesQuery.isLoading}
                />
                <VelordsLockActivity
                  data={lockActivityQuery.data?.weekly ?? []}
                  isLoading={lockActivityQuery.isLoading}
                />
              </div>
            </TabsContent>
            <TabsContent value="sources">
              <VelordsSourceBreakdown
                data={rewardsSeriesQuery.data?.sources ?? []}
                isLoading={rewardsSeriesQuery.isLoading}
              />
            </TabsContent>
            <TabsContent value="locks">
              <VelordsLockActivity
                data={lockActivityQuery.data?.weekly ?? []}
                isLoading={lockActivityQuery.isLoading}
              />
            </TabsContent>
            <TabsContent value="trends">
              <Suspense
                fallback={<Skeleton className="h-160 w-full rounded-xl" />}
              >
                <VelordsTrendsPanel
                  rewardsWeekly={rewardsSeriesQuery.data?.weekly ?? []}
                  lockWeekly={lockActivityQuery.data?.weekly ?? []}
                  isRewardsLoading={rewardsSeriesQuery.isLoading}
                  isLocksLoading={lockActivityQuery.isLoading}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex min-w-0 flex-col gap-6 @5xl:col-span-2">
          <VelordsPosition
            balance={userBalance}
            sharePercent={userSharePercent ? `${userSharePercent}%` : undefined}
            locked={userLocked?.amount}
            unlockDate={
              userLocked?.unlockTime
                ? new Date(userLocked.unlockTime * 1000).toLocaleDateString()
                : undefined
            }
            estimatedWeeklyRewards={
              estimatedWeeklyRewards !== undefined
                ? `~${formatNumber(estimatedWeeklyRewards, 2)} LORDS`
                : undefined
            }
          />
          <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
            <StakeLords />
          </Suspense>
          {address && (
            <Suspense
              fallback={<Skeleton className="h-56 w-full rounded-xl" />}
            >
              <VelordsRewards />
            </Suspense>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
