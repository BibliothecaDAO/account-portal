import { DelegateCardSkeleton } from "@/components/modules/governance/delegate-card-skeleton";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardStatsSkeleton } from "./dashboard-stats";
import { ProposalListSkeleton } from "./proposal-list-skeleton";
import { RealmsPreview } from "./realms-preview";

export function HomepageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2">
        <SectionCard
          title="Available claims"
          description="LORDS rewards ready to collect on Starknet."
          contentClassName="space-y-2"
          footer={
            <>
              <Button className="w-full sm:flex-1" variant="outline" disabled>
                Claim Realms
              </Button>
              <Button className="w-full sm:flex-1" variant="outline" disabled>
                Claim veLORDS
              </Button>
            </>
          }
        >
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </SectionCard>
        <DelegateCardSkeleton />
      </div>
      <SectionCard title="Recent proposals" contentClassName="pt-0">
        <ProposalListSkeleton />
      </SectionCard>
      <RealmsPreview viewState="loading" tokens={[]} />
    </div>
  );
}
