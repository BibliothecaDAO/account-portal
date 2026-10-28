import type { Chain } from "@starknet-start/chains";
import React from "react";
import { StarknetAutoReconnect } from "@/components/layout/starknet-auto-reconnect";
import { StarknetWalletPickerProvider } from "@/components/layout/starknet-wallet-picker";
import { cartridgeControllerWallet } from "@/utils/cartridge-controller";
import { starknetWalletStore } from "@/utils/starknet-wallet-store";
import { expectedStarknetChain } from "@/utils/starknet-chain";
import { mainnet, sepolia } from "@starknet-start/chains";
import { voyager } from "@starknet-start/explorers";
import { jsonRpcProvider } from "@starknet-start/providers";
import { StarknetConfig } from "@starknet-start/react";

// Module-level so StarknetConfig receives stable references; new identities on
// each render invalidate its memos and re-run its connect effect.
const chains = [mainnet, sepolia];
const extraWallets = [cartridgeControllerWallet];

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
      case sepolia:
      default:
        return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
    }
  },
});

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={chains}
      defaultChainId={expectedStarknetChain.id}
      provider={provider}
      explorer={voyager}
      extraWallets={extraWallets}
      store={starknetWalletStore}
    >
      <StarknetWalletPickerProvider>
        <StarknetAutoReconnect />
        {children}
      </StarknetWalletPickerProvider>
    </StarknetConfig>
  );
}
