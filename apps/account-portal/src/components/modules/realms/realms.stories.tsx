import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";
import { fn } from "storybook/test";

import { BridgeDirection } from "./bridge-direction";
import { RealmsClaimsView } from "./claims";
import { RealmsConnectPrompt, RealmsInventory } from "./realms-inventory";

const realm = (id: number, name: string): RealmInventoryToken => ({
  token_id: id,
  metadata_status: "unavailable",
  metadata: JSON.stringify({
    name,
    description: "",
    image: "",
    attributes: [
      { trait_type: "Resource", value: "Wood" },
      { trait_type: "Resource", value: "Stone" },
      { trait_type: "Resource", value: "Coal" },
    ],
  }),
});

const realms = [
  realm(1, "Stolsli"),
  realm(23, "Ilum"),
  realm(144, "Smutmum"),
  realm(512, "Nhalnar"),
  realm(3324, "Azebiz"),
  realm(4001, "Olsosi"),
  realm(6700, "Grahbem"),
];

const e18 = (n: number) => (BigInt(n) * 10n ** 18n).toString();

const pastClaims = [
  {
    hash: "0x04a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f",
    timestamp: "2025-03-02",
    amount: e18(1_284),
    recipient:
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
  },
  {
    hash: "0x05f6e7d8c9b0a1928374655647382910fedcba9876543210fedcba9876543210",
    timestamp: "2025-01-19",
    amount: e18(912),
    recipient:
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
  },
];

const claimsProps = {
  claimable: "1,284",
  isConnected: true,
  onClaim: fn(),
  pastClaims,
  transactionUrl: (hash: string) => `https://voyager.online/tx/${hash}`,
};

const meta = {
  title: "Pages/Realms/Sections",
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="@container">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inventory: Story = {
  render: () => (
    <RealmsInventory viewState="ready" tokens={realms} status="ready" />
  ),
};
export const InventoryEmpty: Story = {
  render: () => (
    <RealmsInventory viewState="ready" tokens={[]} status="ready" />
  ),
};
export const InventoryLoading: Story = {
  render: () => <RealmsInventory viewState="loading" tokens={[]} />,
};
export const InventorySyncing: Story = {
  render: () => (
    <RealmsInventory viewState="syncing" tokens={[]} status="syncing" />
  ),
};
export const InventoryError: Story = {
  render: () => (
    <RealmsInventory viewState="error" tokens={[]} onRetry={fn()} />
  ),
};
export const ConnectPrompt: Story = {
  render: () => (
    <RealmsConnectPrompt action={<Button>Connect wallet</Button>} />
  ),
};

function DirectionDemo() {
  const [from, setFrom] = useState<"Ethereum" | "Starknet">("Ethereum");
  return (
    <div className="max-w-2xl">
      <BridgeDirection
        from={from}
        onSwap={() =>
          setFrom((f) => (f === "Ethereum" ? "Starknet" : "Ethereum"))
        }
      />
    </div>
  );
}
export const BridgeDirectionSwap: Story = {
  name: "Bridge direction",
  render: () => <DirectionDemo />,
};

export const Claims: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView {...claimsProps} />
    </div>
  ),
};
export const ClaimsDisconnected: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView
        {...claimsProps}
        claimable={0}
        isConnected={false}
        pastClaims={[]}
      />
    </div>
  ),
};
export const ClaimsSubmitting: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView {...claimsProps} isSubmitting />
    </div>
  ),
};

export const RealmsPage: Story = {
  name: "Full page · Realms",
  parameters: { layout: "fullscreen" },
  render: () => (
    <PageContainer>
      <PageHeader
        title="Your Realms"
        description="Realms held by your Starknet wallet. Bridge more from Ethereum at any time."
        actions={
          <Button variant="outline" size="sm">
            <HandCoins />
            Claims
          </Button>
        }
      />
      <RealmsInventory viewState="ready" tokens={realms} status="ready" />
    </PageContainer>
  ),
};

export const ClaimsPage: Story = {
  name: "Full page · Claims",
  parameters: { layout: "fullscreen" },
  render: () => (
    <PageContainer>
      <PageHeader
        title="Claims"
        description="Claim remaining LORDS emissions for Realms held on Starknet and review past claims."
      />
      <RealmsClaimsView {...claimsProps} />
    </PageContainer>
  ),
};
