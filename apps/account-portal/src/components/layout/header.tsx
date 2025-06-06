import RWLogo from "@/components/icons/rw-logo.svg?react";
import { toast } from "@/hooks/use-toast";
import useIsWrongNetwork from "@/hooks/use-wrong-network";
import { cn, shortenAddress } from "@/utils/utils";
import { Separator } from "@radix-ui/react-separator";
import {
  useAccount,
  useDisconnect,
  useExplorer,
  useSwitchChain,
} from "@starknet-react/core";
import { Link } from "@tanstack/react-router";
import { env } from "env";
import { Check, Copy, ExternalLink, Unplug } from "lucide-react";

import { ChainId } from "@realms-world/constants";

import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Breadcrumbs } from "./breadcrumbs";
import { ModeToggle } from "./mode-toggle";
import { StarknetWalletButton } from "./starknet-wallet-button";

export function Header() {
  const { address, connector } = useAccount();
  const { open } = useSidebar();
  const { disconnect } = useDisconnect();
  const explorer = useExplorer();
  const { isWrongNetwork /*, setIsWrongNetwork */ } = useIsWrongNetwork();
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId:
        env.VITE_PUBLIC_CHAIN === "sepolia"
          ? (ChainId.SN_SEPOLIA as string)
          : (ChainId.SN_MAIN as string),
    },
  });
  return (
    <header
      className={cn(
        "bg-sidebar sticky top-0 z-50 flex shrink-0 items-center border-b transition-[width,height] ease-linear",
      )}
    >
      <div className="h-(--header-height) flex w-full gap-2">
        <div
          className={
            `${open ? "sm:w-(--sidebar-width) w-16 px-1" : "w-(--sidebar-width-icon)"}` +
            " flex items-center justify-center border-r"
          }
        >
          <Link to="/">
            <RWLogo
              className={
                `${open ? "w-full sm:w-20" : "w-10"}` +
                " h-auto transition-[width,height] duration-300"
              }
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between px-1.5 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
          {address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 rounded px-3"
                >
                  <Avatar className="mr-1 size-6">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${address}`}
                    />
                  </Avatar>
                  {shortenAddress(address)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="flex flex-col gap-6 p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="mr-1 size-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${address}`}
                      />
                    </Avatar>
                    <div className="text-xl">{shortenAddress(address)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={explorer.contract(address)} target="_blank">
                      <Button
                        variant={"outline"}
                        size="icon"
                        className="rounded-full"
                      >
                        <ExternalLink />
                      </Button>
                    </a>
                    <Button
                      variant={"outline"}
                      size="icon"
                      className="rounded-full"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(address);
                        } catch (error) {
                          console.error("Failed to copy address:", error);
                        }
                        toast({
                          description: (
                            <div className="flex items-center gap-2">
                              <Check className="text-green-500" />
                              <span>Address copied to clipboard</span>
                            </div>
                          ),
                        });
                      }}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant={"outline"}
                      className="rounded-full"
                      onClick={() => disconnect()}
                    >
                      <Unplug /> Disconnect
                    </Button>
                  </div>
                </DropdownMenuLabel>
                {/*} <DropdownMenuSeparator />
                <DropdownMenuLabel>Connect to Ethereum</DropdownMenuLabel>*/}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <StarknetWalletButton />
            </>
          )}
          <Dialog open={isWrongNetwork}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wrong Network</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                You are on the wrong network. Please switch to{" "}
                {env.VITE_PUBLIC_CHAIN}
                <div className="mt-6 flex items-center gap-2">
                  {connector?.id == "argentX" && (
                    <Button onClick={() => switchChainAsync()}>
                      Switch to {env.VITE_PUBLIC_CHAIN}
                    </Button>
                  )}
                  or
                  <Button onClick={() => disconnect()}>Disconnect</Button>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
