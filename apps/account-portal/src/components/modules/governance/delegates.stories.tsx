import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { DelegateListEmpty, DelegatePanel } from "./delegate-list";
import { DelegateListActionsView } from "./delegate-list-actions";
import type { DelegateRowData } from "./delegate-row";
import { DelegateRowView } from "./delegate-row";
import { DelegateRowSkeleton } from "./delegate-row-skeleton";
import { DelegateStats } from "./delegate-stats";

const delegate = (
  id: number,
  votes: string,
  interests: string[] = [],
  statement?: string,
): DelegateRowData => ({
  id: String(id),
  user: `0x0${id}a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef12`,
  delegatedVotes: votes,
  delegateProfile: { interests, statement },
});

const delegates: {
  data: DelegateRowData;
  name?: string;
  current?: boolean;
}[] = [
  {
    data: delegate(
      1,
      "1240",
      ["Gaming", "Treasury", "Eternum", "Bridges", "Art"],
      "Long-time Realms holder focused on sustainable treasury management and growing Eternum. I vote on every proposal and publish my reasoning.",
    ),
    name: "loaf.stark",
    current: true,
  },
  {
    data: delegate(2, "860", ["Developer", "Infra"], "Builder on Starknet."),
    name: "credence.stark",
  },
  {
    data: delegate(
      4,
      "412",
      ["Treasury", "Eternum", "Gaming"],
      "Publishes a monthly report on treasury spending and votes against any proposal without a stated budget, a named owner and a date for review.",
    ),
    name: "bibliotheca-treasury-council.stark",
  },
  {
    data: delegate(
      5,
      "97",
      ["Blitz"],
      "Plays Blitz most days. Votes for prize pools paid in LORDS.",
    ),
    name: "ironwarden.stark",
  },
  {
    data: delegate(
      6,
      "63",
      ["Art", "Frontier"],
      "Votes on art direction and on anything that changes Frontier.",
    ),
    name: "mapmaker.stark",
  },
  {
    data: delegate(
      7,
      "41",
      ["Infra", "Bridges"],
      "Runs a Starknet node. Reviews bridge and contract changes.",
    ),
  },
  { data: delegate(3, "15") },
  {
    data: delegate(8, "5", [], "Votes on every proposal."),
    name: "quietvote.stark",
  },
];

const meta = {
  title: "Pages/Governance/Delegates",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Toolbar() {
  return (
    <div className="bg-background sticky top-0 z-10 flex flex-wrap gap-2 py-2">
      <div className="relative min-w-0 flex-[1_1_13.75rem]">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          className="pl-9"
          placeholder="Search delegates..."
          aria-label="Search delegates"
        />
      </div>
      <DelegateListActionsView
        sortMethod="random"
        onToggleSort={fn()}
        showDelegateToSelf
        onDelegateToSelf={fn()}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <PageHeader
        title="Delegates"
        description="Choose who votes with your Realms in the DAO, or delegate to yourself."
      />
      <Toolbar />
      {children}
    </PageContainer>
  );
}

function Rows() {
  return (
    <DelegatePanel>
      {delegates.map((d) => (
        <DelegateRowView
          key={d.data.id}
          delegate={d.data}
          name={d.name}
          isCurrentDelegate={d.current}
          onDelegate={fn()}
        />
      ))}
    </DelegatePanel>
  );
}

export const List: Story = {
  render: () => (
    <Shell>
      <Rows />
    </Shell>
  ),
};

export const RowOpen: Story = {
  name: "List · More open",
  render: () => (
    <Shell>
      <Rows />
    </Shell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "More about loaf.stark" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Less about loaf.stark" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

export const Loading: Story = {
  render: () => (
    <Shell>
      <DelegatePanel isLoading>
        {Array.from({ length: 8 }, (_, i) => (
          <DelegateRowSkeleton key={i} />
        ))}
      </DelegatePanel>
    </Shell>
  ),
};

export const Empty: Story = {
  render: () => (
    <Shell>
      <DelegateListEmpty searchQuery="satoshi" />
    </Shell>
  ),
};

export const Stats: Story = {
  render: () => (
    <PageContainer width="narrow">
      <DelegateStats delegatedVotes="1240" tokenHolders={37} />
    </PageContainer>
  ),
};
