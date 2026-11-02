import type { ClaimRead } from "@/lib/claim-read";
import LordsIcon from "@/components/icons/lords.svg?react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { formatClaimRead, hasClaimable } from "@/lib/claim-read";
import { Link } from "@tanstack/react-router";

export interface ClaimsPanelProps {
  realmsClaimable: ClaimRead;
  veLordsClaimable: ClaimRead;
  isClaimingRealms?: boolean;
  isClaimingVeLords?: boolean;
  onClaimRealms?: () => void;
  onClaimVeLords?: () => void;
}

function ClaimRow({
  to,
  title,
  description,
  claimable,
  isClaiming,
  onClaim,
}: {
  to: "/realms/claims" | "/velords";
  title: string;
  description: string;
  claimable: ClaimRead;
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
      {hasClaimable(claimable) || isClaiming ? (
        <div className="flex shrink-0 items-center gap-3">
          <span className="realm-stat text-sm font-semibold">
            {formatClaimRead(claimable)} LORDS
          </span>
          <Button size="sm" onClick={onClaim} disabled={isClaiming}>
            {isClaiming ? "Claiming…" : "Claim"}
          </Button>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">
          {claimable.status === "read"
            ? "Nothing to claim"
            : claimable.status === "failed"
              ? "Could not be read"
              : formatClaimRead(claimable)}
        </span>
      )}
    </div>
  );
}

/** "No LORDS" only when both reads returned 0; a read that failed or has not returned is never called empty. */
function panelDescription(realms: ClaimRead, veLords: ClaimRead) {
  const reads = [realms, veLords];
  if (reads.some(hasClaimable)) return "LORDS rewards ready to collect on Starknet.";
  if (reads.some((read) => read.status === "failed")) {
    return "A claimable balance could not be read.";
  }
  if (reads.every((read) => read.status === "read")) {
    return "No LORDS to collect right now.";
  }
  return "Claimable LORDS rewards on Starknet.";
}

/** Claimable LORDS rewards: each row links to its page and claims for itself. */
export function ClaimsPanel({
  realmsClaimable,
  veLordsClaimable,
  isClaimingRealms = false,
  isClaimingVeLords = false,
  onClaimRealms,
  onClaimVeLords,
}: ClaimsPanelProps) {
  return (
    <SectionCard
      title="Available claims"
      description={panelDescription(realmsClaimable, veLordsClaimable)}
      contentClassName="space-y-2"
    >
      <ClaimRow
        to="/realms/claims"
        title="Realms emissions"
        description="Rewards for Realms held on Starknet"
        claimable={realmsClaimable}
        isClaiming={isClaimingRealms}
        onClaim={onClaimRealms}
      />
      <ClaimRow
        to="/velords"
        title="veLORDS rewards"
        description="Staking rewards from your lock"
        claimable={veLordsClaimable}
        isClaiming={isClaimingVeLords}
        onClaim={onClaimVeLords}
      />
    </SectionCard>
  );
}
