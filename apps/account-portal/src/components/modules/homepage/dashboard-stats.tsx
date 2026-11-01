import type { ReactNode } from "react";
import EthereumIcon from "@/components/icons/ethereum.svg?react";
import LordsIcon from "@/components/icons/lords.svg?react";
import StarknetIcon from "@/components/icons/starknet.svg?react";
import { MetricCard } from "@/components/ui/metric-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface DashboardStatsProps {
  realmsL1: ReactNode;
  realmsL2: ReactNode;
  lordsL1: ReactNode;
  lordsL2: ReactNode;
  lordsStaked: ReactNode;
}

/** Holdings overview: Realms and LORDS on each chain plus staked veLORDS. */
export function DashboardStats({
  realmsL1,
  realmsL2,
  lordsL1,
  lordsL2,
  lordsStaked,
}: DashboardStatsProps) {
  const stats = [
    { label: "Realms · Ethereum", value: realmsL1, icon: <EthereumIcon /> },
    { label: "Realms · Starknet", value: realmsL2, icon: <StarknetIcon /> },
    { label: "LORDS · Ethereum", value: lordsL1, icon: <EthereumIcon /> },
    { label: "LORDS · Starknet", value: lordsL2, icon: <StarknetIcon /> },
    { label: "Staked veLORDS", value: lordsStaked, icon: <LordsIcon /> },
  ];

  return (
    <section
      aria-label="Holdings"
      className="grid grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-5"
    >
      {stats.map((stat, i) => (
        <MetricCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          className={i === stats.length - 1 ? "col-span-2 @4xl:col-span-1" : ""}
        />
      ))}
    </section>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <DashboardStats
      realmsL1={<Skeleton className="mt-1 h-7 w-12" />}
      realmsL2={<Skeleton className="mt-1 h-7 w-12" />}
      lordsL1={<Skeleton className="mt-1 h-7 w-20" />}
      lordsL2={<Skeleton className="mt-1 h-7 w-20" />}
      lordsStaked={<Skeleton className="mt-1 h-7 w-20" />}
    />
  );
}
