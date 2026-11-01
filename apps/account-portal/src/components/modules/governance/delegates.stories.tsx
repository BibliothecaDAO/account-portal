import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shuffle } from "lucide-react";
import { fn } from "storybook/test";

import type { DelegateCardData } from "./delegate-card";
import { DelegateCardView } from "./delegate-card";
import { DelegateCardSkeleton } from "./delegate-card-skeleton";
import { DelegateGrid, DelegateListEmpty } from "./delegate-list";
import { DelegateStats } from "./delegate-stats";

const delegate = (
  id: number,
  votes: string,
  interests: string[] = [],
  statement?: string,
): DelegateCardData => ({
  id: String(id),
  user: `0x0${id}a1b2c3d4e5f60718293a4b5c6d7e8f9012345678901234567890abcdef12`,
  delegatedVotes: votes,
  delegateProfile: { interests, statement },
});

const delegates: {
  data: DelegateCardData;
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
  { data: delegate(3, "15") },
];

const meta = {
  title: "Pages/Governance/Delegates",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Toolbar() {
  return (
    <div className="bg-card/85 border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input className="pl-9" placeholder="Search delegates..." />
      </div>
      <Button variant="outline">
        <Shuffle />
        Random
      </Button>
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

export const List: Story = {
  render: () => (
    <Shell>
      <DelegateGrid>
        {delegates.map((d) => (
          <DelegateCardView
            key={d.data.id}
            delegate={d.data}
            name={d.name}
            isCurrentDelegate={d.current}
            onDelegate={fn()}
          />
        ))}
      </DelegateGrid>
    </Shell>
  ),
};

export const Loading: Story = {
  render: () => (
    <Shell>
      <DelegateGrid>
        {Array.from({ length: 6 }, (_, i) => (
          <DelegateCardSkeleton key={i} />
        ))}
      </DelegateGrid>
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
