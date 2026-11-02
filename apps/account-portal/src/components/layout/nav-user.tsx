import { useStarknetWallet } from "@/hooks/use-starknet-wallet";
import { toast } from "@/hooks/use-toast";
import { cartridgeController } from "@/utils/cartridge-controller";
import { getConnectorIcon, isCartridgeController } from "@/utils/connectWallet";
import { shortenAddress } from "@/utils/utils";
import { useAccount, useExplorer } from "@starknet-start/react";
import {
  Check,
  ChevronsUpDown,
  Copy,
  ExternalLink,
  Gamepad2,
  Unplug,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

export interface NavUserViewProps {
  address?: string;
  connectorName?: string;
  connectorIcon?: string;
  explorerUrl?: string;
  onConnect?: () => void;
  onCopy?: () => void;
  onDisconnect?: () => void;
  /** Set only for Cartridge Controller; opens its inventory (send, tokens). */
  onOpenController?: () => void;
}

/** Sidebar footer: wallet account menu, or a connect button. */
export function NavUserView({
  address,
  connectorName,
  connectorIcon,
  explorerUrl,
  onConnect,
  onCopy,
  onDisconnect,
  onOpenController,
}: NavUserViewProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                tooltip="Account"
                className="data-[state=open]:bg-sidebar-accent min-w-0 flex-1"
              >
                <Avatar className="size-8 rounded-md">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${address}`}
                    alt=""
                  />
                  <AvatarFallback className="rounded-md">RW</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="realm-stat truncate text-sm">
                    {shortenAddress(address)}
                  </span>
                  <span className="realm-label truncate">
                    {connectorName ?? "Starknet"}
                  </span>
                </span>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "top" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                {connectorIcon ? (
                  <img src={connectorIcon} alt="" className="size-5" />
                ) : null}
                <span className="realm-stat truncate text-sm">
                  {shortenAddress(address)}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {onOpenController ? (
                  <DropdownMenuItem onSelect={onOpenController}>
                    <Gamepad2 /> Open Controller
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onSelect={onCopy}>
                  <Copy /> Copy address
                </DropdownMenuItem>
                {explorerUrl ? (
                  <DropdownMenuItem asChild>
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink /> View on explorer
                    </a>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDisconnect}>
                <Unplug /> Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton
            size="lg"
            tooltip="Connect wallet"
            onClick={onConnect}
            className="min-w-0 flex-1"
          >
            <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <Wallet className="size-4" />
            </span>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">Connect wallet</span>
              <span className="realm-label truncate">Starknet</span>
            </span>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUser() {
  const { address, connector } = useAccount();
  const { disconnectWallet, requestConnect } = useStarknetWallet();
  const explorer = useExplorer();

  return (
    <NavUserView
      address={address}
      connectorName={connector?.name}
      connectorIcon={address ? getConnectorIcon(connector) : undefined}
      explorerUrl={address ? explorer.contract(address) : undefined}
      onConnect={() => void requestConnect()}
      onDisconnect={() => void disconnectWallet()}
      onOpenController={
        address && isCartridgeController(connector)
          ? () =>
              void cartridgeController
                .openProfile("inventory")
                .catch((error: unknown) =>
                  toast({
                    variant: "destructive",
                    title: "Couldn't open Controller",
                    description:
                      error instanceof Error ? error.message : undefined,
                  }),
                )
          : undefined
      }
      onCopy={() => {
        if (!address) return;
        void navigator.clipboard.writeText(address).then(
          () =>
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Check className="text-success" />
                  <span>Address copied to clipboard</span>
                </div>
              ),
            }),
          (error: unknown) => console.error("Failed to copy address:", error),
        );
      }}
    />
  );
}
