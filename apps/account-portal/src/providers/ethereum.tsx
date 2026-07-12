"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { Config } from "wagmi";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

const PROJECT_ID = "d80d873dcad4b8636dd7314223238a59";
const METADATA = {
  name: "Realms World",
  description: "Connect your Ethereum wallet to Realms World",
  url: "https://account.realms.world",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

let appKitConfigPromise: Promise<Config> | undefined;

function createFallbackWagmiConfig(): Config {
  return createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    ssr: true,
  });
}

async function initializeAppKit(): Promise<Config> {
  const [adapterModule, networksModule, appKitModule] = await Promise.all([
    import("@reown/appkit-adapter-wagmi"),
    import("@reown/appkit/networks"),
    import("@reown/appkit/react"),
  ]);
  const networks = [networksModule.mainnet, networksModule.sepolia] as const;
  const wagmiAdapter = new adapterModule.WagmiAdapter({
    networks: [...networks],
    projectId: PROJECT_ID,
    ssr: true,
  });

  appKitModule.createAppKit({
    adapters: [wagmiAdapter],
    networks: [...networks],
    projectId: PROJECT_ID,
    metadata: METADATA,
    coinbasePreference: "eoaOnly",
    features: {
      analytics: false,
      swaps: false,
      onramp: false,
      pay: false,
      email: false,
      socials: false,
      history: false,
      receive: false,
      send: false,
    },
  });

  return wagmiAdapter.wagmiConfig;
}

function loadAppKitConfig(): Promise<Config> {
  appKitConfigPromise ??= initializeAppKit().catch((error: unknown) => {
    appKitConfigPromise = undefined;
    throw error;
  });
  return appKitConfigPromise;
}

export function AppKitProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const [wagmiConfig, setWagmiConfig] = useState(createFallbackWagmiConfig);

  useEffect(() => {
    let active = true;
    void loadAppKitConfig()
      .then((config) => {
        if (active) setWagmiConfig(config);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
