import BridgeIcon from "@/components/icons/bridge.svg?react";
import { EthereumConnect } from "@/components/layout/ethereum-connect";
import { LoginCard } from "@/components/layout/login-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Homepage } from "@/components/modules/homepage/homepage";
import { Button } from "@/components/ui/button";
import { getProposalsQueryOptions } from "@/lib/snapshot/getProposals";
import { SUPPORTED_L2_CHAIN_ID } from "@/utils/utils";
import { useAccount } from "@starknet-start/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gavel } from "lucide-react";

import { SnapshotSpaceAddresses } from "@realms-world/constants";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      getProposalsQueryOptions({
        spaceIds: [SnapshotSpaceAddresses[SUPPORTED_L2_CHAIN_ID] as string],
        limit: 5,
        skip: 0,
        current: 1,
        searchQuery: "",
      }),
    );
  },
  component: IndexComponent,
});

function IndexComponent() {
  const { address } = useAccount();
  if (!address) {
    return (
      <PageContainer width="narrow">
        <LoginCard />
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your Realms, LORDS, rewards and governance across Ethereum and Starknet."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/realms/bridge">
                <BridgeIcon />
                Bridge
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://market.realms.world"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Gavel />
                Market
              </a>
            </Button>
            <EthereumConnect />
          </>
        }
      />
      <Homepage address={address} />
    </PageContainer>
  );
}
