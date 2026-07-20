import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-core";

interface LegacyCartridgeWallet {
  readonly version: string;
  readonly name: string;
  readonly icon: string;
  readonly chains: readonly string[];
  readonly accounts: readonly unknown[];
  readonly features: Record<string, unknown> & {
    readonly "starknet:walletApi": {
      readonly version: "1.0.0";
      readonly request: unknown;
      readonly walletVersion: string;
    };
  };
}

interface LazyWalletMetadata {
  readonly version: string;
  readonly name: string;
  readonly icon: string;
  readonly chains: readonly string[];
  readonly walletVersion: string;
}

interface PendingEventSubscription {
  active: boolean;
  event: unknown;
  listener: unknown;
  unsubscribe?: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFeatureMethod(
  wallet: LegacyCartridgeWallet,
  featureName: string,
  methodName: string,
): (...args: unknown[]) => unknown {
  const feature = wallet.features[featureName];
  if (!isRecord(feature)) {
    throw new Error(`Cartridge wallet is missing ${featureName}`);
  }
  const method = feature[methodName];
  if (typeof method !== "function") {
    throw new Error(`Cartridge wallet is missing ${featureName}.${methodName}`);
  }
  return (...args: unknown[]) =>
    Reflect.apply(method, feature, args) as unknown;
}

export function createLazyCartridgeWallet({
  id,
  loadWallet,
  metadata,
}: {
  id: string;
  loadWallet: () => Promise<LegacyCartridgeWallet>;
  metadata: LazyWalletMetadata;
}): WalletWithStarknetFeatures {
  let loadedWallet: LegacyCartridgeWallet | undefined;
  let walletPromise: Promise<LegacyCartridgeWallet> | undefined;
  const eventSubscriptions = new Set<PendingEventSubscription>();

  const attachEventSubscription = (
    wallet: LegacyCartridgeWallet,
    subscription: PendingEventSubscription,
  ) => {
    if (!subscription.active) return;
    const method = getFeatureMethod(wallet, "standard:events", "on");
    const unsubscribe = method(subscription.event, subscription.listener);
    if (typeof unsubscribe === "function") {
      subscription.unsubscribe = unsubscribe as () => void;
    }
  };

  const getWallet = async () => {
    walletPromise ??= loadWallet().then((wallet) => {
      loadedWallet = wallet;
      for (const subscription of eventSubscriptions) {
        attachEventSubscription(wallet, subscription);
      }
      return wallet;
    });
    return walletPromise;
  };

  const callAsyncFeature = async (
    featureName: string,
    methodName: string,
    args: unknown[],
  ) => {
    const wallet = await getWallet();
    const method = getFeatureMethod(wallet, featureName, methodName);
    return method(...args);
  };

  const wallet = {
    version: metadata.version,
    name: metadata.name,
    icon: metadata.icon,
    chains: metadata.chains,
    get accounts() {
      return loadedWallet?.accounts ?? [];
    },
    features: {
      "standard:connect": {
        version: "1.0.0",
        connect: (...args: unknown[]) =>
          callAsyncFeature("standard:connect", "connect", args),
      },
      "standard:disconnect": {
        version: "1.0.0",
        disconnect: (...args: unknown[]) => {
          if (!loadedWallet) return Promise.resolve();
          const method = getFeatureMethod(
            loadedWallet,
            "standard:disconnect",
            "disconnect",
          );
          return Promise.resolve(method(...args));
        },
      },
      "standard:events": {
        version: "1.0.0",
        on: (event: unknown, listener: unknown) => {
          const subscription: PendingEventSubscription = {
            active: true,
            event,
            listener,
          };
          eventSubscriptions.add(subscription);
          if (loadedWallet) attachEventSubscription(loadedWallet, subscription);

          return () => {
            subscription.active = false;
            subscription.unsubscribe?.();
            eventSubscriptions.delete(subscription);
          };
        },
      },
      "starknet:walletApi": {
        version: "1.0.0",
        id,
        walletVersion: metadata.walletVersion,
        request: (...args: unknown[]) =>
          callAsyncFeature("starknet:walletApi", "request", args),
      },
    },
  };

  return wallet as unknown as WalletWithStarknetFeatures;
}

export function adaptCartridgeWallet(
  wallet: LegacyCartridgeWallet,
  id: string,
): WalletWithStarknetFeatures {
  const adapted = {
    get version() {
      return wallet.version;
    },
    get name() {
      return wallet.name;
    },
    get icon() {
      return wallet.icon;
    },
    get chains() {
      return wallet.chains;
    },
    get accounts() {
      return wallet.accounts;
    },
    get features() {
      return {
        ...wallet.features,
        "starknet:walletApi": {
          ...wallet.features["starknet:walletApi"],
          id,
        },
      };
    },
  };

  return adapted as unknown as WalletWithStarknetFeatures;
}
