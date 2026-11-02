import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalList } from "@/components/modules/governance/proposal-list";
import { ProposalListSkeleton } from "@/components/modules/governance/proposal-list-skeleton";
import { SnapshotLink } from "@/components/modules/governance/snapshot-link";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { useCurrentDelegate } from "@/hooks/governance/use-current-delegate";
import { getDelegateByIDQueryOptions } from "@/lib/getDelegates";
import { getProposalsQueryOptions } from "@/lib/snapshot/getProposals";
import { formatAddress, SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { num } from "starknet";

import { SnapshotSpaceAddresses } from "@realms-world/constants";

export const Route = createFileRoute("/proposal/list")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      getProposalsQueryOptions({
        spaceIds: [SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string],
        limit: 20,
        skip: 0,
        current: 1,
        searchQuery: "",
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
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

  return (
    <PageContainer>
      <PageHeader
        title="Proposals"
        description="Realms DAO proposals on Snapshot. Vote on open proposals or review past outcomes."
        actions={
          <>
            <SnapshotLink />
            <Button asChild variant="outline" size="sm">
              <Link to="/delegate/list">Delegates</Link>
            </Button>
          </>
        }
      />
      <SectionCard title="All proposals" contentClassName="py-0">
        <ProposalList
          limit={20}
          delegateId={currentDelegate?.user}
          loading={<ProposalListSkeleton />}
        />
      </SectionCard>
    </PageContainer>
  );
}
