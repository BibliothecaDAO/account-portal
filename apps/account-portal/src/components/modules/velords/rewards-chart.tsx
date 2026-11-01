import type { ChartConfig } from "@/components/ui/chart";
import { useMemo, useState } from "react";
import LordsIcon from "@/components/icons/lords.svg?react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionCard } from "@/components/ui/section-card";
import { getVelordsSourceLabel } from "@/lib/velords-sources";
import { Bar, BarChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { formatUnits } from "viem";

const sourceColors = {
  "0x045c587318c9ebcf2fbe21febf288ee2e3597a21cd48676005a5770a50d433c5":
    "var(--chart-1)",
  "0x047230028629128ac5bfbb384d32f925e70e329b624fc5d82e9c60f5746795cd":
    "var(--chart-2)",
} as const;

const fallbackSourceColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function compactNumber(value: number) {
  return Number.isFinite(value) ? compactFormatter.format(value) : "0";
}

const chartConfig = {
  total_amount: {
    label: "Lords",
    color: "var(--chart-1)",
    icon: LordsIcon,
  },
  apy: {
    label: "APY %",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function VeLordsRewardsChart({
  data,
  totalSupplyRaw,
  selectedPeriod,
  onTimePeriodChange,
  isLoading = false,
  errorMessage,
}: {
  data?: {
    sender: string;
    amount: string;
    transaction_hash: string;
    timestamp: Date;
  }[];
  totalSupplyRaw?: bigint;
  selectedPeriod?: "3m" | "6m" | "1y";
  onTimePeriodChange?: (period: "3m" | "6m" | "1y") => void;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState<
    "3m" | "6m" | "1y"
  >("3m");
  const currentSelectedPeriod = selectedPeriod ?? localSelectedPeriod;

  const handlePeriodChange = (value: string) => {
    const period = value as "3m" | "6m" | "1y";
    setLocalSelectedPeriod(period);
    onTimePeriodChange?.(period);
  };

  const parsedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const totalSupply = totalSupplyRaw
      ? Number(formatUnits(totalSupplyRaw, 18))
      : undefined;

    // Find the date range
    const timestamps = data
      .map((item) =>
        typeof item.timestamp === "number"
          ? item.timestamp
          : new Date(item.timestamp).getTime() / 1000,
      )
      .filter((timestamp): timestamp is number => Number.isFinite(timestamp));
    if (timestamps.length === 0) return [];
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    interface WeeklyRewardRow {
      week: string;
      amounts: Record<string, number>;
      total_amount: number;
      apy: number;
    }

    // Generate all weeks in the range
    const allWeeks: Partial<Record<string, WeeklyRewardRow>> = {};

    // Pre-populate all weeks with zero values
    for (
      let timestamp = minTimestamp;
      timestamp <= maxTimestamp;
      timestamp += 604800
    ) {
      const weekStart = Math.floor(timestamp / 604800) * 604800;
      const week = new Date(weekStart * 1000).toISOString().split("T")[0];
      allWeeks[week] = {
        week,
        amounts: {},
        total_amount: 0,
        apy: 0,
      };
    }

    // Fill in the actual data
    data.forEach((item) => {
      const timestamp =
        typeof item.timestamp === "number"
          ? item.timestamp
          : new Date(item.timestamp).getTime() / 1000;
      if (!Number.isFinite(timestamp)) return;

      const weekStart = Math.floor(timestamp / 604800) * 604800;
      const week = new Date(weekStart * 1000).toISOString().split("T")[0];
      allWeeks[week] ??= {
        week,
        amounts: {},
        total_amount: 0,
        apy: 0,
      };

      const formattedAmount = Number(formatUnits(BigInt(item.amount), 18));
      const senderLabel = getVelordsSourceLabel(item.sender);

      const weekData = allWeeks[week];
      weekData.amounts[senderLabel] =
        (weekData.amounts[senderLabel] || 0) + formattedAmount;
      weekData.total_amount += formattedAmount;
      weekData.apy =
        totalSupply && totalSupply > 0
          ? ((weekData.total_amount * 52) / totalSupply) * 100
          : 0;
    });

    return Object.values(allWeeks)
      .filter((row): row is WeeklyRewardRow => row !== undefined)
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [data, totalSupplyRaw]);

  const allSenderLabels = useMemo(
    () =>
      Array.from(
        new Set(data?.map((item) => getVelordsSourceLabel(item.sender)) ?? []),
      ),
    [data],
  );

  // Build dynamic chart config using labels
  const dynamicChartConfig: Record<
    string,
    { label: string; color: string; icon?: typeof LordsIcon }
  > &
    typeof chartConfig = {
    ...chartConfig,
    ...Object.fromEntries(
      allSenderLabels.map((label, index) => [
        `amounts.${label}`,
        {
          label,
          color: (() => {
            const senderAddress = data?.find(
              (item) => getVelordsSourceLabel(item.sender) === label,
            )?.sender;
            const knownColor = senderAddress
              ? sourceColors[senderAddress as keyof typeof sourceColors]
              : undefined;
            return (
              knownColor ??
              fallbackSourceColors[index % fallbackSourceColors.length]
            );
          })(),
        },
      ]),
    ),
  };

  return (
    <SectionCard
      title="LORDS rewards per week"
      contentClassName="px-2 pb-4 sm:px-4"
      action={
        <RadioGroup
          value={currentSelectedPeriod}
          onValueChange={handlePeriodChange}
          aria-label="Time period"
          className="flex gap-3"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="3m" id="3m" />
            <Label htmlFor="3m" className="cursor-pointer py-2 pl-1 text-sm">
              3m
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="6m" id="6m" />
            <Label htmlFor="6m" className="cursor-pointer py-2 pl-1 text-sm">
              6m
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="1y" id="1y" />
            <Label htmlFor="1y" className="cursor-pointer py-2 pl-1 text-sm">
              1y
            </Label>
          </div>
        </RadioGroup>
      }
    >
      <ChartContainer
        config={dynamicChartConfig}
        className="!aspect-auto h-80 w-full sm:h-96"
      >
        {errorMessage ? (
          <div className="text-destructive p-6 text-sm">{errorMessage}</div>
        ) : isLoading ? (
          <div className="text-muted-foreground p-6 text-sm">
            Loading chart data...
          </div>
        ) : parsedData.length === 0 ? (
          <div className="text-muted-foreground p-6 text-sm">
            No rewards data is available for this period.
          </div>
        ) : (
          <BarChart
            data={parsedData}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickLine={false}
              minTickGap={32}
              tickFormatter={(value: string) => value.slice(5)}
            />
            <YAxis
              yAxisId="amount"
              width={44}
              tickLine={false}
              tickFormatter={(value: number) => compactNumber(value)}
            />
            <YAxis
              yAxisId="apy"
              orientation="right"
              dataKey="apy"
              width={40}
              tickLine={false}
              tickFormatter={(value: number) => `${compactNumber(value)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => `Week of ${String(v)}`}
                />
              }
            />
            <ChartLegend
              content={
                <ChartLegendContent className="flex-wrap gap-x-4 gap-y-1" />
              }
            />

            {/* Stacked bars for each source (using labels) */}
            {allSenderLabels.map((label, index) => (
              <Bar
                key={label}
                dataKey={`amounts.${label}`}
                stackId="rewards"
                yAxisId="amount"
                fill={dynamicChartConfig[`amounts.${label}`].color}
                stroke={dynamicChartConfig[`amounts.${label}`].color}
                radius={
                  index === allSenderLabels.length - 1
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}

            <Line
              dataKey="apy"
              type="monotone"
              yAxisId="apy"
              stroke="var(--color-apy)"
              fill="var(--color-apy)"
              activeDot={{ r: 8 }}
            />
          </BarChart>
        )}
      </ChartContainer>
    </SectionCard>
  );
}
