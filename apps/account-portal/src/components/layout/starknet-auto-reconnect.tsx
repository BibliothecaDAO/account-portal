import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-core";
import { useEffect, useState } from "react";
import {
  dedupeConnectors,
  getLastConnectedWalletName,
  isAutoReconnectDisabled,
} from "@/utils/connectWallet";
import { rescanInjectedWallets } from "@/utils/starknet-wallet-store";
import { useAccount, useConnect } from "@starknet-start/react";

// Injected wallets are discovered asynchronously after mount; stop waiting for
// the last-used wallet to appear after this long.
const WALLET_DISCOVERY_TIMEOUT_MS = 3000;
// Extensions can inject `window.starknet_*` after get-starknet's initial scan,
// so rescan while waiting for them.
const WALLET_RESCAN_INTERVAL_MS = 250;

// Module-level so the attempt happens once per page load, even across StrictMode
// double effects and remounts.
let hasAttemptedReconnect = false;

/**
 * Restores the last wallet session on page load without prompting the user.
 *
 * `silent: true` makes injected wallets answer from existing authorization only,
 * and makes Cartridge Controller probe its hidden keychain iframe for a session
 * instead of opening its UI. Once the wallet reports accounts, the library
 * connect resolves immediately because the wallet already holds the account.
 */
async function reconnectSilently(
  connector: WalletWithStarknetFeatures,
  connect: (args: { connector: WalletWithStarknetFeatures }) => Promise<void>,
) {
  try {
    const { accounts } = await connector.features["standard:connect"].connect({
      silent: true,
    });
    if (accounts.length === 0) return;
    await connect({ connector });
  } catch {
    // Silent reconnect is best effort; the user can still connect manually.
  }
}

export function StarknetAutoReconnect() {
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [discoveryTimedOut, setDiscoveryTimedOut] = useState(false);

  useEffect(() => {
    rescanInjectedWallets();
    const interval = setInterval(
      rescanInjectedWallets,
      WALLET_RESCAN_INTERVAL_MS,
    );
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDiscoveryTimedOut(true);
    }, WALLET_DISCOVERY_TIMEOUT_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (hasAttemptedReconnect || discoveryTimedOut) return;

    const lastWalletName = getLastConnectedWalletName();
    if (isConnected || !lastWalletName || isAutoReconnectDisabled()) {
      hasAttemptedReconnect = true;
      return;
    }

    const connector = dedupeConnectors(connectors).find(
      (item) => item.name === lastWalletName,
    );
    if (!connector) return;

    hasAttemptedReconnect = true;
    void reconnectSilently(connector, connectAsync);
  }, [connectAsync, connectors, discoveryTimedOut, isConnected]);

  return null;
}
