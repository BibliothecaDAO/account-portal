import type { Address } from "@starknet-start/react";
import { Suspense } from "react";
import { VeLords } from "@/abi/L2/VeLords";
import { DelegateCard } from "@/components/modules/governance/delegate-card";
import { DelegateCardSkeleton } from "@/components/modules/governance/delegate-card-skeleton";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import { useL2RealmsClaims } from "@/hooks/use-l2-realms-claims";
import useVeLordsClaims from "@/hooks/use-velords-claims";
import { getDelegateByIDQueryOptions } from "@/lib/getDelegates";
import { getL1UsersRealmsQueryOptions } from "@/lib/getL1Realms";
import { getRealmInventoryQueryOptions } from "@/lib/realms/get-realm-inventory";
import { getRealmInventoryViewState } from "@/lib/realms/inventory-ui";
import {
  formatAddress,
  formatNumber,
  SUPPORTED_L1_CHAIN_ID,
  SUPPORTED_L2_CHAIN_ID,
} from "@/utils/utils";
import {
  useBalance,
  useReadContract,
  useSendTransaction,
} from "@starknet-start/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { num } from "starknet";
import { formatEther } from "viem";
import { runWithErrorToast } from "@/utils/run-with-error-toast";
import { useAccount as useL1Account, useBalance as useL1Balance } from "wagmi";

import { LORDS, StakingAddresses } from "@realms-world/constants";

import { ProposalList } from "../governance/proposal-list";
import { ClaimsPanel } from "./claims-panel";
import { DashboardStats } from "./dashboard-stats";
import { NoDelegateCard } from "./governance-panel";
import { ProposalListSkeleton } from "./proposal-list-skeleton";
import { RealmsPreview } from "./realms-preview";

export function Homepage({ address }: { address: `0x${string}` }) {
  const { address: l1Address } = useL1Account();

  const l1UsersRealmsQuery = useSuspenseQuery(
    getL1UsersRealmsQueryOptions({
      address: l1Address,
    }),
  );
  const accountTokensQuery = useQuery(
    getRealmInventoryQueryOptions({
      address: address,
    }),
  );
  const l1UsersRealms = l1UsersRealmsQuery.data;
  const accountInventory = accountTokensQuery.data;
  const accountTokens = accountInventory?.tokens ?? [];
  const accountInventoryViewState = getRealmInventoryViewState({
    isPending: accountTokensQuery.isPending,
    isError: accountTokensQuery.isError,
    status: accountInventory?.status,
  });
  const l1RealmCount = l1UsersRealms?.collections[0]?.ownership.tokenCount ?? 0;

  const { data } = useCurrentDelegate();
  const delegateAddress =
    data && BigInt(data) !== 0n
      ? formatAddress(num.toHex(BigInt(data)))
      : undefined;
  const currentDelegateQuery = useQuery(
    getDelegateByIDQueryOptions({
      address: delegateAddress,
    }),
  );
  const currentDelegate = currentDelegateQuery.data;

  const { data: starknetBalance } = useBalance({
    address,
    token: LORDS[SUPPORTED_L2_CHAIN_ID]?.address as Address,
    watch: true,
  });
  const { data: l1Balance } = useL1Balance({
    address: l1Address,
    token: LORDS[SUPPORTED_L1_CHAIN_ID]?.address as Address,
  });

  const { lordsClaimable, claimCall } = useVeLordsClaims();

  const { balance: l2RealmsBalance, calls: l2RealmsClaimCall } =
    useL2RealmsClaims();

  const { data: ownerLordsLock } = useReadContract({
    address: StakingAddresses.velords[SUPPORTED_L2_CHAIN_ID] as Address,
    abi: VeLords,
    functionName: "get_lock_for",
    watch: true,
    args: [address],
  });

  // Prepare the functions to send claim rewards transactions.
  const {
    sendAsync: claimVeLordsRewards,
    isPending: claimVeLordsIsSubmitting,
  } = useSendTransaction({
    calls: claimCall ?? [],
  });

  const { sendAsync: claimRealmsRewards, isPending: claimRealmsIsSubmitting } =
    useSendTransaction({
      calls: l2RealmsClaimCall,
    });

  const delegateSection = currentDelegateQuery.isLoading ? (
    <DelegateCardSkeleton />
  ) : !currentDelegate ||
    (currentDelegate.user && BigInt(currentDelegate.user) === 0n) ? (
    <NoDelegateCard />
  ) : (
    <DelegateCard
      delegate={{
        user: currentDelegate.user,
        delegateProfile: currentDelegate.delegateProfile
          ? {
              twitter: currentDelegate.delegateProfile.twitter ?? undefined,
              github: currentDelegate.delegateProfile.github ?? undefined,
              telegram: currentDelegate.delegateProfile.telegram ?? undefined,
              discord: currentDelegate.delegateProfile.discord ?? undefined,
              interests: currentDelegate.delegateProfile.interests ?? undefined,
              statement: currentDelegate.delegateProfile.statement,
            }
          : undefined,
        delegatedVotes: currentDelegate.delegatedVotes,
        id: currentDelegate.id,
      }}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardStats
        realmsL1={l1RealmCount}
        realmsL2={
          accountInventoryViewState === "loading"
            ? "…"
            : accountInventoryViewState !== "ready"
              ? "—"
              : accountTokens.length
        }
        lordsL1={formatNumber(Number(l1Balance?.formatted ?? 0))}
        lordsL2={formatNumber(Number(starknetBalance?.formatted ?? 0))}
        lordsStaked={formatNumber(
          Number(formatEther(BigInt(ownerLordsLock?.amount ?? 0))),
        )}
      />

      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2">
        <ClaimsPanel
          realmsClaimable={
            l2RealmsBalance ? formatNumber(Number(formatEther(l2RealmsBalance))) : 0
          }
          veLordsClaimable={
            lordsClaimable ? formatNumber(Number(formatEther(lordsClaimable))) : 0
          }
          canClaimRealms={!!l2RealmsBalance && l2RealmsBalance !== 0n}
          canClaimVeLords={!!lordsClaimable && lordsClaimable !== 0n}
          isClaimingRealms={claimRealmsIsSubmitting}
          isClaimingVeLords={claimVeLordsIsSubmitting}
          onClaimRealms={() =>
            void runWithErrorToast(claimRealmsRewards, "Unable to claim Realms rewards")
          }
          onClaimVeLords={() =>
            void runWithErrorToast(claimVeLordsRewards, "Unable to claim veLORDS rewards")
          }
        />
        {delegateSection}
      </div>

      <SectionCard
        title="Recent proposals"
        description="Latest Realms DAO proposals and your delegate's votes."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/proposal/list">View all</Link>
          </Button>
        }
        contentClassName="pt-0"
      >
        <Suspense fallback={<ProposalListSkeleton />}>
          <ProposalList delegateId={currentDelegate?.user} />
        </Suspense>
      </SectionCard>

      <RealmsPreview
        viewState={accountInventoryViewState}
        tokens={accountTokens}
        status={accountInventory?.status}
        onRetry={() => void accountTokensQuery.refetch()}
      />
    </div>
  );
}
