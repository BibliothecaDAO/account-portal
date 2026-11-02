import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ClaimRewards } from "@/components/modules/realms/claims";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/realms/claims")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer>
      <PageHeader
        title="Claims"
        description="Claim remaining LORDS emissions for Realms held on Starknet and review past claims."
      />
      <ClaimRewards />
    </PageContainer>
  );
}
