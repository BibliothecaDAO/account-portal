import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-core";
import { useCallback, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  StarknetWalletPickerContext,
  useStarknetWallet,
} from "@/hooks/use-starknet-wallet";
import { getConnectorIcon, isCartridgeController } from "@/utils/connectWallet";
import { rescanInjectedWallets } from "@/utils/starknet-wallet-store";
import { cn } from "@/utils/utils";
import { Loader2 } from "lucide-react";

/** Owns the single shared wallet picker; `useStarknetWallet().openPicker` opens it. */
export function StarknetWalletPickerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openPicker = useCallback(() => {
    // Pick up extension wallets that injected after the startup scans.
    rescanInjectedWallets();
    setIsOpen(true);
  }, []);
  const value = useMemo(() => ({ openPicker }), [openPicker]);

  return (
    <StarknetWalletPickerContext.Provider value={value}>
      {children}
      <StarknetWalletPickerSheet open={isOpen} onOpenChange={setIsOpen} />
    </StarknetWalletPickerContext.Provider>
  );
}

function StarknetWalletPickerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { connectors, lastConnector, connectWallet } = useStarknetWallet();
  const [pendingWalletName, setPendingWalletName] = useState<string | null>(
    null,
  );

  const selectWallet = async (connector: WalletWithStarknetFeatures) => {
    // Controller renders its UI in an in-page iframe that the sheet's focus
    // trap would fight with, so hand over before connecting.
    if (isCartridgeController(connector)) {
      onOpenChange(false);
      await connectWallet(connector);
      return;
    }

    setPendingWalletName(connector.name);
    const connected = await connectWallet(connector);
    setPendingWalletName(null);
    if (connected) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md border-l p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-xl">Connect a wallet</SheetTitle>
          <SheetDescription>
            Choose a Starknet wallet to continue.
          </SheetDescription>
        </SheetHeader>

        <div className="max-h-[calc(100svh-5rem)] space-y-3 overflow-y-auto px-4 py-4">
          {connectors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No Starknet wallets found. Install a Starknet wallet extension and
              refresh the page.
            </p>
          ) : null}
          {connectors.map((connector) => {
            const isRecent = connector.name === lastConnector?.name;
            const isPending = connector.name === pendingWalletName;
            return (
              <button
                key={connector.name}
                type="button"
                disabled={pendingWalletName !== null}
                aria-busy={isPending}
                onClick={() => void selectWallet(connector)}
                className={cn(
                  "bg-card hover:bg-accent flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed",
                  pendingWalletName !== null && !isPending && "opacity-50",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="bg-muted inline-flex h-9 w-9 items-center justify-center rounded-lg">
                    <img
                      className="h-5 w-5"
                      src={getConnectorIcon(connector)}
                      alt={`${connector.name} logo`}
                    />
                  </span>
                  <span className="text-sm font-medium">{connector.name}</span>
                </span>
                {isPending ? (
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : isRecent ? (
                  <span className="bg-primary/20 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                    Recently used
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
