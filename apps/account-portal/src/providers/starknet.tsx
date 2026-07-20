import type { Chain } from "@starknet-start/chains";
import React from "react";
import { mainnet, sepolia } from "@starknet-start/chains";
import { voyager } from "@starknet-start/explorers";
import { jsonRpcProvider } from "@starknet-start/providers";
import { StarknetConfig } from "@starknet-start/react";
import { env } from "env";
import { constants } from "starknet";

import {
  adaptCartridgeWallet,
  createLazyCartridgeWallet,
} from "./cartridge-wallet";

const CONTROLLER_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23191a1a'/%3E%3Cpath d='M9 9h14v5H14v4h9v5H9z' fill='%23fbcb4a'/%3E%3C/svg%3E";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const cartridgeControllerWallet = React.useMemo(() => {
    return createLazyCartridgeWallet({
      id: "controller",
      metadata: {
        version: "1.0.0",
        name: "Controller",
        icon: CONTROLLER_ICON,
        chains: [
          "starknet:0x534e5f4d41494e",
          "starknet:0x534e5f5345504f4c4941",
        ],
        walletVersion: "0.13.9",
      },
      loadWallet: async () => {
        const { default: Controller } = await import("@cartridge/controller");
        const controller = new Controller({
          slot: env.VITE_PUBLIC_SLOT,
          defaultChainId:
            env.VITE_PUBLIC_CHAIN === "sepolia"
              ? constants.StarknetChainId.SN_SEPOLIA
              : constants.StarknetChainId.SN_MAIN,
          chains: [
            { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
            { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
          ],
          lazyload: true,
        });
        return adaptCartridgeWallet(
          controller.asWalletStandard(),
          controller.id,
        );
      },
    });
  }, []);

  const provider = React.useMemo(
    () =>
      jsonRpcProvider({
        rpc: (chain: Chain) => {
          switch (chain) {
            case mainnet:
              return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
            case sepolia:
            default:
              return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
          }
        },
      }),
    [],
  );

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={provider}
      explorer={voyager}
      extraWallets={[cartridgeControllerWallet]}
      autoConnect={false}
    >
      {children}
    </StarknetConfig>
  );
}
