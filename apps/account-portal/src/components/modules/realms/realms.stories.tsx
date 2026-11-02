import type { RealmInventoryToken } from "@/lib/realms/get-realm-inventory";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import { useReactTable } from "@tanstack/react-table";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { getRealmBridgeTableOptions } from "@/routes/-realms.bridge-table";
import { HandCoins } from "lucide-react";
import { expect, fn, within } from "storybook/test";

import { getBridgeButtonState } from "./bridge-action";
import { BridgeDirection } from "./bridge-direction";
import { BridgePanelView } from "./bridge-sidebar";
import { BridgeTable } from "./bridge-table";
import BridgeTransactionHistorySkeleton from "./bridge-tx-skeleton";
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
  canClaim: true,
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

const bridgeRealms = realms.slice(0, 5).map((r) => ({
  token_id: r.token_id,
  name: (JSON.parse(r.metadata ?? "{}") as { name?: string }).name,
  attributes: [
    { trait_type: "Resource", value: "Wood" },
    { trait_type: "Resource", value: "Stone" },
  ],
}));

function BridgeRealmsTable({
  data = bridgeRealms,
  status,
}: {
  data?: typeof bridgeRealms;
  status?: "ready" | "loading" | "error";
}) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    "23": true,
  });
  const table = useReactTable(
    getRealmBridgeTableOptions({
      data,
      onRowSelectionChange: setRowSelection,
      rowSelection,
    }),
  );
  return (
    <BridgeTable
      table={table}
      status={status}
      emptyMessage="No Realms in this Ethereum wallet."
      onRetry={fn()}
    />
  );
}

export const BridgeTableReady: Story = {
  name: "Bridge table",
  render: () => <BridgeRealmsTable />,
  play: async ({ canvasElement }) => {
    const selectAll = within(canvasElement).getByRole("checkbox", {
      name: "Select all",
    });
    const target = selectAll.parentElement?.getBoundingClientRect();
    await expect(Math.min(target?.width ?? 0, target?.height ?? 0)).toBeGreaterThanOrEqual(24);
  },
};
export const BridgeTableLoading: Story = {
  name: "Bridge table · loading",
  render: () => <BridgeRealmsTable data={[]} status="loading" />,
};
export const BridgeTableFailed: Story = {
  name: "Bridge table · failed",
  render: () => <BridgeRealmsTable data={[]} status="error" />,
};
export const BridgeTableEmpty: Story = {
  name: "Bridge table · empty",
  render: () => <BridgeRealmsTable data={[]} />,
};

const buttonInput = {
  needsApproval: false,
  isApproving: false,
  isBridgeDisabled: false,
  isBridging: false,
  isAccountBlocked: false,
  isCheckingAccount: false,
  hasAccountError: false,
  isAccountMissing: false,
};

function BridgeButton(
  props: Partial<typeof buttonInput> & { selectedCount: number },
) {
  const { label, disabled } = getBridgeButtonState({ ...buttonInput, ...props });
  return (
    <Button className="w-full" disabled={disabled}>
      {label}
    </Button>
  );
}

function BridgePanel({
  from = "Ethereum",
  selectedIds = ["23", "144", "512"],
  needsApproval = false,
  connected = true,
}: {
  from?: "Ethereum" | "Starknet";
  selectedIds?: string[];
  needsApproval?: boolean;
  connected?: boolean;
}) {
  return (
    <SectionCard title="Bridge">
      <BridgePanelView
        from={from}
        selectedIds={selectedIds}
        ethereumWallet={
          connected ? (
            <Button variant="outline" size="sm">
              0x12ab...34cd
            </Button>
          ) : undefined
        }
        action={
          connected ? (
            <BridgeButton
              selectedCount={selectedIds.length}
              needsApproval={needsApproval}
            />
          ) : (
            <Button className="w-full">Connect Ethereum to bridge</Button>
          )
        }
        history={
          connected ? (
            <BridgeTransactionHistorySkeleton />
          ) : (
            <p className="text-muted-foreground text-sm">
              Connect a wallet to see your bridge history.
            </p>
          )
        }
      />
    </SectionCard>
  );
}

const narrow = (panel: React.ReactNode) => <div className="max-w-md">{panel}</div>;

export const BridgePanelToStarknet: Story = {
  name: "Bridge panel · to Starknet",
  render: () => narrow(<BridgePanel />),
};
export const BridgePanelToEthereum: Story = {
  name: "Bridge panel · to Ethereum",
  render: () => narrow(<BridgePanel from="Starknet" selectedIds={["23"]} />),
};
export const BridgePanelNothingSelected: Story = {
  name: "Bridge panel · nothing selected",
  render: () => narrow(<BridgePanel selectedIds={[]} />),
};
export const BridgePanelApproveNothingSelected: Story = {
  name: "Bridge panel · approval, nothing selected",
  render: () => narrow(<BridgePanel selectedIds={[]} needsApproval />),
};
export const BridgePanelDisconnected: Story = {
  name: "Bridge panel · disconnected",
  render: () => narrow(<BridgePanel selectedIds={[]} connected={false} />),
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
        claimable="—"
        isConnected={false}
        canClaim={false}
        connectAction={<Button className="w-full">Connect wallet to claim</Button>}
        pastClaims={[]}
      />
    </div>
  ),
};
export const ClaimsNothingToClaim: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView {...claimsProps} claimable={0} canClaim={false} />
    </div>
  ),
};
export const ClaimsHistoryLoading: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView {...claimsProps} pastClaims={[]} pastClaimsState="loading" />
    </div>
  ),
};
export const ClaimsHistoryFailed: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RealmsClaimsView {...claimsProps} pastClaims={[]} pastClaimsState="error" />
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

export const BridgePage: Story = {
  name: "Full page · Bridge",
  parameters: { layout: "fullscreen" },
  render: () => (
    <PageContainer className="flex-1">
      <PageHeader
        title="Starknet bridge"
        description="Move Realms between Ethereum and Starknet. Select Realms below, then review and bridge from the panel."
      />
      <div className="grid flex-1 grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <div className="max-w-2xl">
            <BridgeDirection from="Ethereum" onSwap={fn()} />
          </div>
          <BridgeRealmsTable />
        </div>
        <aside className="xl:sticky xl:top-20">
          <BridgePanel selectedIds={["23"]} />
        </aside>
      </div>
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
