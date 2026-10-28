import { createStore } from "@starknet-io/get-starknet-core";

// get-starknet finds extension wallets that inject `window.starknet_*` (Ready,
// Braavos) by scanning once, when its store is created. On a cached page load
// that scan can run before the extensions inject, hiding them until a hard
// reload, so the app owns the store and rescans. Wallet-standard and EIP-6963
// wallets announce themselves and don't need this.
export const starknetWalletStore = createStore();

/** Registers injected wallets that appeared since the last scan; known ones are skipped. */
export const rescanInjectedWallets = () => {
  starknetWalletStore._refreshInjectedWallets();
};
