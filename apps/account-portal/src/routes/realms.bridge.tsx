import type { BridgeRealm, TokenMetadataAttribute } from "@/types/ark";
import type { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BridgeDirection } from "@/components/modules/realms/bridge-direction";
import BridgeSidebar from "@/components/modules/realms/bridge-sidebar";
import { BridgeTable } from "@/components/modules/realms/bridge-table";
import { OwnershipStatusAlert } from "@/components/modules/realms/ownership-status-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStarknetWallet } from "@/hooks/use-starknet-wallet";
import { getL1RealmsQueryOptions } from "@/lib/getL1Realms";
import { getRealmInventoryQueryOptions } from "@/lib/realms/get-realm-inventory";
import {
  formatRealmCount,
  getRealmInventoryViewState,
  parseRealmTokenId,
} from "@/lib/realms/inventory-ui";
import { useAccount } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useReactTable } from "@tanstack/react-table";
import { TriangleAlert } from "lucide-react";
import { useAccount as useL1Account } from "wagmi";

import {
  getRealmBridgeTableOptions,
  reconcileRealmBridgeSelection,
} from "./-realms.bridge-table";

export const Route = createFileRoute("/realms/bridge")({
  component: RouteComponent,
});

interface L1MetadataAttribute extends TokenMetadataAttribute {
  key?: string;
}

function isMetadataAttribute(value: unknown): value is L1MetadataAttribute {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRealmMetadata(
  metadata: string | undefined,
): Pick<BridgeRealm, "name" | "attributes"> {
  if (!metadata) return {};

  try {
    const parsed: unknown = JSON.parse(metadata);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    const fields = parsed as Record<string, unknown>;
    return {
      name: typeof fields.name === "string" ? fields.name : undefined,
      attributes: Array.isArray(fields.attributes)
        ? fields.attributes.filter(isMetadataAttribute)
        : undefined,
    };
  } catch {
    return {};
  }
}

/** Matches Tailwind's xl breakpoint; false during SSR so the server renders the mobile bar. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function MobileBridgeBar({
  selectedCount,
  onOpen,
}: {
  selectedCount: number;
  onOpen: () => void;
}) {
  return (
    <div className="bg-background/95 sticky bottom-0 z-10 -mx-4 mt-auto border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 xl:hidden">
      <Button className="h-11 w-full" onClick={onOpen}>
        {selectedCount
          ? `Review & bridge ${formatRealmCount(selectedCount)}`
          : "Open bridge panel & history"}
      </Button>
    </div>
  );
}

function RouteComponent() {
  const isDesktop = useIsDesktop();
  const [panelOpen, setPanelOpen] = useState(false);
  const { address: l1Address } = useL1Account();
  const { address: l2Address } = useAccount();

  const l1RealmsQuery = useQuery(
    getL1RealmsQueryOptions({ address: l1Address }),
  );
  const l1Realms = l1RealmsQuery.data;
  const l2RealmsQuery = useQuery(
    getRealmInventoryQueryOptions({
      address: l2Address,
    }),
  );
  const l2Inventory = l2RealmsQuery.data;
  const l2Realms = l2Inventory?.tokens;
  const l2InventoryViewState = getRealmInventoryViewState({
    isPending: l2RealmsQuery.isPending,
    isError: l2RealmsQuery.isError,
    status: l2Inventory?.status,
  });

  const [selectedAsset, setSelectedAsset] = useState<"Ethereum" | "Starknet">(
    "Ethereum",
  );

  const mappedRealms = useMemo(() => {
    if (selectedAsset === "Ethereum") {
      return (
        l1Realms?.tokens?.flatMap((realm) => {
          const tokenId = parseRealmTokenId(realm.token?.tokenId);
          if (tokenId === undefined) return [];

          return [
            {
              token_id: tokenId,
              name: realm.token?.name,
              attributes:
                realm.token?.attributes
                  ?.filter(isMetadataAttribute)
                  .map((attribute) => ({
                    ...attribute,
                    trait_type: attribute.key ?? attribute.trait_type,
                  })) ?? [],
            },
          ];
        }) ?? []
      );
    } else if (selectedAsset === "Starknet") {
      return (
        l2Realms?.map((realm) => {
          const { attributes, name } = parseRealmMetadata(realm.metadata);
          return {
            token_id: realm.token_id,
            name,
            attributes,
          };
        }) ?? []
      );
    }
    return [];
  }, [selectedAsset, l2Realms, l1Realms]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable(
    getRealmBridgeTableOptions({
      data: mappedRealms,
      onRowSelectionChange: setRowSelection,
      rowSelection,
    }),
  );

  const starknetInventoryReady =
    !!l2Address && l2InventoryViewState === "ready";

  useEffect(() => {
    setRowSelection({});
  }, [selectedAsset, l1Address, l2Address, starknetInventoryReady]);

  useEffect(() => {
    setRowSelection((current) =>
      reconcileRealmBridgeSelection(current, mappedRealms),
    );
  }, [mappedRealms]);

  const swapAssets = () => {
    setSelectedAsset((prev) => (prev === "Ethereum" ? "Starknet" : "Ethereum"));
  };
  const { requestConnect } = useStarknetWallet();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const canShowInventory =
    selectedAsset !== "Starknet" || starknetInventoryReady;
  const bridgeDisabled = selectedAsset === "Starknet" && !canShowInventory;
  const showTable =
    canShowInventory && (selectedAsset !== "Ethereum" || !!l1Address);

  const bridgePanel = (
    <BridgeSidebar
      disabled={bridgeDisabled}
      selectedRows={bridgeDisabled ? [] : selectedRows}
      setRowSelection={setRowSelection}
      selectedAsset={selectedAsset}
    />
  );

  return (
    <PageContainer className="flex-1">
      <PageHeader
        title="Starknet bridge"
        description="Move Realms between Ethereum and Starknet. Select Realms below, then review and bridge from the panel."
      />
      <div className="grid flex-1 grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <div className="max-w-2xl">
            <BridgeDirection from={selectedAsset} onSwap={swapAssets} />
          </div>
          {selectedAsset === "Ethereum" && !l1Address && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>Your Ethereum wallet is not connected</AlertTitle>
              <AlertDescription>
                Connect your Ethereum wallet using the bridge panel to view and
                bridge your Realms.
              </AlertDescription>
            </Alert>
          )}
          {selectedAsset === "Starknet" && !l2Address && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>Your Starknet wallet is not connected</AlertTitle>
              <AlertDescription>
                <span>
                  <Button
                    className="h-auto p-0"
                    variant="link"
                    onClick={() => void requestConnect()}
                  >
                    Connect your Starknet wallet
                  </Button>{" "}
                  to view and bridge your Realms.
                </span>
              </AlertDescription>
            </Alert>
          )}
          {selectedAsset === "Starknet" &&
            l2Address &&
            (l2InventoryViewState === "loading" ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : (
              <OwnershipStatusAlert
                status={l2Inventory?.status}
                isError={l2InventoryViewState === "error"}
                onRetry={() => void l2RealmsQuery.refetch()}
              />
            ))}
          {showTable && (
            <BridgeTable
              table={table}
              status={
                selectedAsset !== "Ethereum"
                  ? "ready"
                  : l1RealmsQuery.isLoading
                    ? "loading"
                    : l1RealmsQuery.isError
                      ? "error"
                      : "ready"
              }
              emptyMessage={`No Realms in this ${selectedAsset} wallet.`}
              onRetry={() => void l1RealmsQuery.refetch()}
            />
          )}
        </div>
        {isDesktop ? (
          <aside className="xl:sticky xl:top-20">
            <SectionCard title="Bridge">{bridgePanel}</SectionCard>
          </aside>
        ) : null}
      </div>
      <MobileBridgeBar
        selectedCount={bridgeDisabled ? 0 : selectedRows.length}
        onOpen={() => setPanelOpen(true)}
      />
      <Sheet open={!isDesktop && panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>Bridge Realms</SheetTitle>
            <SheetDescription>
              Review your selection and bridge between Ethereum and Starknet.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{!isDesktop ? bridgePanel : null}</div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
