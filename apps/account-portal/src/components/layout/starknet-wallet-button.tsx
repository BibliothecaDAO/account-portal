import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStarknetWallet } from "@/hooks/use-starknet-wallet";
import { getConnectorIcon } from "@/utils/connectWallet";
import { cn } from "@/utils/utils";
import { ArrowDownIcon, ChevronDownIcon, WalletMinimal } from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export const StarknetWalletButton = ({
  className,
  label,
  variant = "default",
  pickerMode,
}: {
  className?: string;
  label?: string;
  autoConnect?: boolean;
  variant?: "default" | "reference";
  pickerMode?: "dropdown" | "sheet";
}) => {
  const { lastConnector, openWalletModal, connectWallet, connectors } =
    useStarknetWallet();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const primaryConnector = lastConnector ?? connectors.at(0);
  const hasConnectorPicker = connectors.length > 1;
  const isReferenceVariant = variant === "reference";
  const resolvedPickerMode =
    pickerMode ?? (variant === "reference" ? "sheet" : "dropdown");
  const pickerTriggerClassName = isReferenceVariant
    ? "realm-button realm-button--ghost inline-flex h-10 w-10 items-center justify-center rounded-full p-0 text-foreground"
    : "realm-button realm-button--ghost inline-flex h-8 w-8 items-center justify-center rounded-full p-0 text-primary-foreground/80";

  const connectPrimary = () => {
    if (primaryConnector) {
      void connectWallet(primaryConnector);
      return;
    }
    void openWalletModal();
  };

  const connectFromPicker = (connector: (typeof connectors)[number]) => {
    void connectWallet(connector).finally(() => setIsPickerOpen(false));
  };

  const pickerSheet = (
    <Sheet open={isPickerOpen} onOpenChange={setIsPickerOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={pickerTriggerClassName}
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md border-l p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-xl">Connect a wallet</SheetTitle>
        </SheetHeader>

        <div className="max-h-[calc(100svh-5rem)] space-y-3 overflow-y-auto px-4 py-4">
          {connectors.map((connector) => {
            const isRecent = connector.name === lastConnector?.name;
            return (
              <button
                key={connector.name}
                type="button"
                onClick={() => connectFromPicker(connector)}
                className="realm-sidebar-item flex w-full items-center justify-between rounded-[0.95rem] border px-3 py-3 text-left transition"
              >
                <span className="flex items-center gap-3">
                  <span className="border-border/60 bg-muted/20 inline-flex h-9 w-9 items-center justify-center rounded-lg border">
                    <img
                      className="h-5 w-5"
                      src={getConnectorIcon(connector)}
                    />
                  </span>
                  <span className="text-sm font-medium">{connector.name}</span>
                </span>
                {isRecent ? (
                  <span className="realm-sigil">Recently used</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );

  if (variant === "reference") {
    return (
      <div className={cn("relative w-full", className)}>
        <Button
          onClick={connectPrimary}
          className="h-14 w-full justify-start rounded-[1rem] px-3 pr-16 text-left"
        >
          <span className="border-border/60 bg-muted/20 mr-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border">
            {lastConnector ? (
              <img className="h-4 w-4" src={getConnectorIcon(lastConnector)} />
            ) : (
              <WalletMinimal className="text-primary h-4 w-4" />
            )}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-base font-semibold">
              {label ?? "Connect wallet"}
            </span>
            <span className="text-muted-foreground text-xs">
              {lastConnector
                ? `Previously used ${lastConnector.name}`
                : "Choose a Starknet wallet"}
            </span>
          </span>
        </Button>

        {hasConnectorPicker ? (
          <div
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            {pickerSheet}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Button onClick={connectPrimary} className={`px-2.5 ${className}`}>
      <div className="flex items-center">
        {lastConnector ? (
          <img className="w-7 pr-2" src={getConnectorIcon(lastConnector)} />
        ) : null}
        <p className="mx-auto">{label ?? "Connect wallet"}</p>
        {hasConnectorPicker ? (
          <>
            <Separator orientation="vertical" className="mr-1.5 ml-3 h-6" />

            {resolvedPickerMode === "sheet" ? (
              <div onClick={(e) => e.stopPropagation()}>{pickerSheet}</div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="hover:bg-background/20 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowDownIcon width="18" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {connectors.map((connector) => (
                    <DropdownMenuItem
                      key={connector.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        connectFromPicker(connector);
                      }}
                    >
                      <img
                        className="mr-2 h-4 w-4"
                        src={getConnectorIcon(connector)}
                      />
                      {connector.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ) : null}
      </div>
    </Button>
  );
};
