import BridgeIcon from "@/components/icons/bridge.svg?react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StarknetWalletButton } from "@/components/layout/starknet-wallet-button";
import {
  RealmsConnectPrompt,
  RealmsInventory,
} from "@/components/modules/realms/realms-inventory";
import { Button } from "@/components/ui/button";
import { getRealmInventoryQueryOptions } from "@/lib/realms/get-realm-inventory";
import { getRealmInventoryViewState } from "@/lib/realms/inventory-ui";
import { useAccount } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HandCoins } from "lucide-react";

export const Route = createFileRoute("/realms/")({
  component: RealmsComponent,
});

function RealmsActions() {
  return (
    <>
      <Button asChild variant="outline" size="sm">
        <Link to="/realms/bridge">
          <BridgeIcon />
          Bridge
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link to="/realms/claims">
          <HandCoins />
          Claims
        </Link>
      </Button>
    </>
  );
}

function RealmsComponent() {
  const { address } = useAccount();

  const l2RealmsQuery = useQuery(
    getRealmInventoryQueryOptions({
      address: address,
    }),
  );
  const inventory = l2RealmsQuery.data;
  const l2Realms = inventory?.tokens ?? [];
  const inventoryViewState = getRealmInventoryViewState({
    isPending: l2RealmsQuery.isPending,
    isError: l2RealmsQuery.isError,
    status: inventory?.status,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Your Realms"
        description="Realms held by your Starknet wallet. Bridge more from Ethereum at any time."
        actions={<RealmsActions />}
      />
      {address ? (
        <RealmsInventory
          viewState={inventoryViewState}
          tokens={l2Realms}
          status={inventory?.status}
          onRetry={() => void l2RealmsQuery.refetch()}
        />
      ) : (
        <RealmsConnectPrompt action={<StarknetWalletButton />} />
      )}
    </PageContainer>
  );
}
