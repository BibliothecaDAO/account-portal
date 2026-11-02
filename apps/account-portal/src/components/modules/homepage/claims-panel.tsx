import type { ReactNode } from "react";
import LordsIcon from "@/components/icons/lords.svg?react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Link } from "@tanstack/react-router";

export interface ClaimsPanelProps {
  realmsClaimable: ReactNode;
  veLordsClaimable: ReactNode;
  canClaimRealms: boolean;
  canClaimVeLords: boolean;
  isClaimingRealms?: boolean;
  isClaimingVeLords?: boolean;
  onClaimRealms?: () => void;
  onClaimVeLords?: () => void;
}

function ClaimRow({
  to,
  title,
  description,
  amount,
  canClaim,
  isClaiming,
  onClaim,
}: {
  to: "/realms/claims" | "/velords";
  title: string;
  description: string;
  amount: ReactNode;
  canClaim: boolean;
  isClaiming: boolean;
  onClaim?: () => void;
}) {
  return (
    <div className="realm-subtle-panel flex flex-wrap items-center justify-between gap-3 rounded-md p-3">
      <Link
        to={to}
        className="focus-visible:ring-ring/50 flex min-w-0 flex-[1_1_12rem] items-center gap-3 rounded-md outline-none hover:underline focus-visible:ring-[3px]"
      >
        <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
          <LordsIcon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="realm-group-title block">{title}</span>
          <span className="realm-label block">{description}</span>
        </span>
      </Link>
      {canClaim || isClaiming ? (
        <div className="flex shrink-0 items-center gap-3">
          <span className="realm-stat text-sm font-semibold">{amount} LORDS</span>
          <Button size="sm" onClick={onClaim} disabled={isClaiming}>
            {isClaiming ? "Claiming…" : "Claim"}
          </Button>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Nothing to claim</span>
      )}
    </div>
  );
}

/** Claimable LORDS rewards: each row links to its page and claims for itself. */
export function ClaimsPanel({
  realmsClaimable,
  veLordsClaimable,
  canClaimRealms,
  canClaimVeLords,
  isClaimingRealms = false,
  isClaimingVeLords = false,
  onClaimRealms,
  onClaimVeLords,
}: ClaimsPanelProps) {
  return (
    <SectionCard
      title="Available claims"
      description={
        canClaimRealms || canClaimVeLords
          ? "LORDS rewards ready to collect on Starknet."
          : "No LORDS to collect right now."
      }
      contentClassName="space-y-2"
    >
      <ClaimRow
        to="/realms/claims"
        title="Realms emissions"
        description="Rewards for Realms held on Starknet"
        amount={realmsClaimable}
        canClaim={canClaimRealms}
        isClaiming={isClaimingRealms}
        onClaim={onClaimRealms}
      />
      <ClaimRow
        to="/velords"
        title="veLORDS rewards"
        description="Staking rewards from your lock"
        amount={veLordsClaimable}
        canClaim={canClaimVeLords}
        isClaiming={isClaimingVeLords}
        onClaim={onClaimVeLords}
      />
    </SectionCard>
  );
}
