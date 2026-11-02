import type { BridgeRealm } from "@/types/ark";
import type { Row, RowSelectionState } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Suspense, useMemo } from "react";
import { EthereumConnect } from "@/components/layout/ethereum-connect";
import { StarknetWalletButton } from "@/components/layout/starknet-wallet-button";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useBridgeL2Realms } from "@/hooks/bridge/useBridgeL2Realms";
import {
  isStarknetAccountDeployed,
  useWriteDepositRealms,
} from "@/hooks/bridge/useWriteDepositRealms";
import useERC721Approval from "@/hooks/token/L1/useERC721Approval";
import { useToast } from "@/hooks/use-toast";
import { formatRealmCount } from "@/lib/realms/inventory-ui";
import { useAccount } from "@starknet-start/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CircleHelp } from "lucide-react";
import { useAccount as useL1Account } from "wagmi";

import { getBridgeButtonState } from "./bridge-action";
import BridgeTransactionItems from "./bridge-tx-items";
import BridgeTransactionHistorySkeleton from "./bridge-tx-skeleton";

interface BridgeSidebarProps {
  disabled: boolean;
  selectedRows: Row<BridgeRealm>[];
  selectedAsset: "Ethereum" | "Starknet";
  setRowSelection: (rowSelection: RowSelectionState) => void;
}

const BRIDGE_NOTES: Record<"Ethereum" | "Starknet", string> = {
  Ethereum:
    "Realms arrive on Starknet in a few minutes. Your wallet shows the gas and bridge fee before you sign.",
  Starknet:
    "This takes two transactions: this one on Starknet, then one on Ethereum about 6 hours later to finish the withdrawal.",
};

function DeployAccountHelp() {
  return (
    <div className="text-muted-foreground mt-2 text-sm">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 text-sm">
            <CircleHelp className="mr-1 h-4 w-4" />
            How to deploy your Starknet account
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 space-y-2">
          <p>
            Starknet wallets are smart contracts and must be deployed onchain
            before L1 to L2 bridging can complete.
          </p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Fund your wallet with ETH or STRK for gas.</li>
            <li>
              Send your first Starknet transaction to trigger account
              deployment.
            </li>
            <li>
              If you use Argent X, you can also deploy manually in Settings via
              Deploy account.
            </li>
          </ol>
          <p>Deployment can take up to around 20 minutes.</p>
          <a
            href="https://support.argent.xyz/hc/en-us/articles/8802319054237-How-to-activate-deploy-my-Argent-Starknet-wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Argent deployment guide
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export interface BridgePanelViewProps {
  /** The chain Realms leave. */
  from: "Ethereum" | "Starknet";
  selectedIds: string[];
  /** Wallet row, shown only once an Ethereum wallet is connected. */
  ethereumWallet?: ReactNode;
  /** The button: connect a wallet, approve or bridge. */
  action: ReactNode;
  showDeployHelp?: boolean;
  history: ReactNode;
}

/** Presentational bridge panel: what is selected, what it costs in steps, the action and history. */
export function BridgePanelView({
  from,
  selectedIds,
  ethereumWallet,
  action,
  showDeployHelp = false,
  history,
}: BridgePanelViewProps) {
  const to = from === "Ethereum" ? "Starknet" : "Ethereum";
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="space-y-3">
        {ethereumWallet ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">
                Ethereum Wallet
              </span>
              {ethereumWallet}
            </div>
            <Separator />
          </>
        ) : null}
        <h2 className="realm-card-title text-balance">
          {selectedIds.length ? (
            <>
              Bridge{" "}
              <span className="font-sans font-semibold">
                {selectedIds.length}
              </span>{" "}
              {selectedIds.length === 1 ? "Realm" : "Realms"} to {to}
            </>
          ) : (
            "Select Realms to bridge"
          )}
        </h2>
        <div>
          {selectedIds.length ? (
            <div className="mb-4 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {selectedIds.map((id) => (
                <span className="rounded border p-1 text-sm" key={id}>
                  #{id}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-muted-foreground mb-4 text-sm">
            {BRIDGE_NOTES[from]}
          </p>
          {action}
          {showDeployHelp ? <DeployAccountHelp /> : null}
        </div>
      </div>
      <div>
        <Separator className="mb-2" />

        <Collapsible defaultOpen className="group/collapsible">
          <CollapsibleTrigger className="realm-group-title hover:bg-accent flex h-10 w-full items-center rounded-md px-2 text-left">
            Transaction history
            <ChevronRight className="text-muted-foreground ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">{history}</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

const BridgeSidebar: React.FC<BridgeSidebarProps> = ({
  disabled,
  selectedRows,
  selectedAsset,
  setRowSelection,
}) => {
  const { address: l1Address } = useL1Account();
  const { address: l2Address } = useAccount();
  const { toast } = useToast();

  const { writeAsync: depositRealms, isPending: isDepositPending } =
    useWriteDepositRealms({
      onSuccess: () => {
        toast({
          title: "Initiating Realms Bridge to Starknet",
          description: `Realms will appear in your L2 wallet in a few minutes`,
        });
      },
    });

  const tokenIds: string[] = useMemo(
    () => selectedRows.map((row) => row.getValue("token_id")),
    [selectedRows],
  );

  const {
    isApprovedForAll,
    approveForAll,
    approveForAllLoading,
    isPending: isApproveForAllPending,
  } = useERC721Approval();

  const { initiateWithdraw, isPending: isWithdrawPending } = useBridgeL2Realms({
    selectedTokenIds: tokenIds,
  });

  const {
    data: isL2AccountDeployed,
    isLoading: isL2AccountDeploymentLoading,
    error: l2AccountDeploymentError,
  } = useQuery({
    queryKey: ["starknet-account-deployed", l2Address],
    queryFn: async () =>
      l2Address ? isStarknetAccountDeployed(l2Address) : false,
    enabled: selectedAsset === "Ethereum" && !!l2Address,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const shouldBlockL1ToL2Bridge =
    selectedAsset === "Ethereum" &&
    (!!l2AccountDeploymentError ||
      isL2AccountDeploymentLoading ||
      isL2AccountDeployed === false);
  const showDeployHelp =
    selectedAsset === "Ethereum" && isL2AccountDeployed === false;

  const onBridge = async () => {
    try {
      let hash: string | undefined;
      if (selectedAsset === "Ethereum") {
        if (!l2Address) throw new Error("Missing L2 Address");
        if (!isApprovedForAll) {
          await approveForAll();
        }
        hash = await depositRealms({
          tokenIds: tokenIds.map((id) => BigInt(id)),
          l2Address: l2Address,
        });
      } else {
        hash = (await initiateWithdraw()).transaction_hash;
      }
      if (hash) {
        toast({
          title: "Bridge Realms",
          description:
            selectedAsset === "Ethereum"
              ? `${formatRealmCount(selectedRows.length)} will appear in your L2 wallet in a few minutes`
              : `${formatRealmCount(selectedRows.length)} will require a transaction in ~6 hours to finalize your withdrawal`,
        });
        setRowSelection({});
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Unable to bridge Realms.",
      });
    }
  };

  const buttonState = getBridgeButtonState({
    selectedCount: selectedRows.length,
    needsApproval: selectedAsset === "Ethereum" && !isApprovedForAll,
    isApproving: approveForAllLoading || isApproveForAllPending,
    isBridgeDisabled: disabled,
    isBridging: isDepositPending || isWithdrawPending,
    isAccountBlocked: shouldBlockL1ToL2Bridge,
    isCheckingAccount: isL2AccountDeploymentLoading,
    hasAccountError: !!l2AccountDeploymentError,
    isAccountMissing: isL2AccountDeployed === false,
  });

  return (
    <BridgePanelView
      from={selectedAsset}
      selectedIds={tokenIds}
      ethereumWallet={l1Address ? <EthereumConnect /> : undefined}
      action={
        !l1Address ? (
          <EthereumConnect label="Connect Ethereum to bridge" />
        ) : !l2Address ? (
          <StarknetWalletButton
            label="Connect Starknet to bridge"
            variant="reference"
          />
        ) : (
          <Button
            disabled={buttonState.disabled}
            className="w-full"
            onClick={onBridge}
          >
            {buttonState.label}
          </Button>
        )
      }
      showDeployHelp={showDeployHelp}
      history={
        l1Address || l2Address ? (
          <Suspense fallback={<BridgeTransactionHistorySkeleton />}>
            <BridgeTransactionItems />
          </Suspense>
        ) : (
          <p className="text-muted-foreground text-sm">
            Connect a wallet to see your bridge history.
          </p>
        )
      }
    />
  );
};

export default BridgeSidebar;
