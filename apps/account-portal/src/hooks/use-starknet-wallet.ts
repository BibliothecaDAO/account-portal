import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-core";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  dedupeConnectors,
  disableAutoReconnect,
  getLastConnector,
  setLastConnectedWallet,
} from "@/utils/connectWallet";
import { useAccount, useConnect, useDisconnect } from "@starknet-start/react";

export interface StarknetWalletPickerContextValue {
  openPicker: () => void;
}

/** Provided once by `StarknetWalletPickerProvider` inside `StarknetProvider`. */
export const StarknetWalletPickerContext =
  createContext<StarknetWalletPickerContextValue | null>(null);

// Starknet wallet API USER_REFUSED_OP and EIP-1193 user rejection codes.
const USER_REJECTION_CODES = new Set([113, 4001]);

function isUserRejection(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const { code, message } = error as { code?: unknown; message?: unknown };
    if (typeof code === "number" && USER_REJECTION_CODES.has(code)) {
      return true;
    }
    if (typeof message === "string") {
      return /reject|denied|cancel|abort|refuse|closed/i.test(message);
    }
  }
  return typeof error === "string" && /reject|denied|cancel|abort/i.test(error);
}

// Cartridge's keychain iframe can fail to start when its stored session points
// at a deleted Slot deployment; clearing cartridge.gg site data recovers it.
function getConnectErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  if (/timeout waiting for keychain/i.test(message)) {
    return "Cartridge didn't finish loading. Try a private window, or clear site data for cartridge.gg in your browser settings and reconnect.";
  }
  return message;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string" && message) return message;
  }
  return "Something went wrong. Please try again.";
}

export function useStarknetWallet() {
  const picker = useContext(StarknetWalletPickerContext);
  if (!picker) {
    throw new Error("useStarknetWallet must be used within StarknetProvider");
  }
  const { openPicker } = picker;
  const { isConnected } = useAccount();
  const { connectAsync, connectors: allConnectors } = useConnect();
  const connectors = useMemo(
    () => dedupeConnectors(allConnectors),
    [allConnectors],
  );
  const { disconnectAsync } = useDisconnect();
  const [lastConnector, setLastConnector] =
    useState<WalletWithStarknetFeatures | null>(null);

  useEffect(() => {
    setLastConnector(getLastConnector(connectors));
  }, [isConnected, connectors]);

  /** Connects a specific wallet. Never throws; toasts and resolves false on failure. */
  async function connectWallet(connector: WalletWithStarknetFeatures) {
    try {
      await connectAsync({ connector });
    } catch (error) {
      if (isUserRejection(error)) {
        toast({
          title: "Connection canceled",
          description: `The ${connector.name} connection request was declined.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: `Couldn't connect ${connector.name}`,
          description: getConnectErrorMessage(error),
        });
      }
      return false;
    }

    // The library resolves without throwing when the wallet shares no account
    // (usually a dismissed prompt), so confirm the wallet actually connected.
    if (connector.accounts.length === 0) {
      toast({
        title: "Wallet not connected",
        description: `${connector.name} didn't share an account. Please try again.`,
      });
      return false;
    }

    setLastConnectedWallet(connector.name);
    setLastConnector(connector);
    return true;
  }

  /**
   * Connects the last-used wallet, or the only available one; otherwise opens
   * the wallet picker and resolves false.
   */
  async function requestConnect() {
    const connector =
      lastConnector ?? (connectors.length === 1 ? connectors[0] : undefined);
    if (connector) {
      return connectWallet(connector);
    }
    openPicker();
    return false;
  }

  /** Disconnects and disables auto-reconnect until the next manual connect. */
  async function disconnectWallet() {
    disableAutoReconnect();
    try {
      await disconnectAsync();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't disconnect wallet",
        description: getErrorMessage(error),
      });
    }
  }

  return {
    connectors,
    lastConnector,
    connectWallet,
    requestConnect,
    openPicker,
    disconnectWallet,
  };
}
