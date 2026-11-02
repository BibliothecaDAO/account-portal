import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gavel } from "lucide-react";

import { Button } from "../ui/button";
import { MetricCard } from "../ui/metric-card";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Dashboard",
    description:
      "Your Realms, LORDS, rewards and governance across Ethereum and Starknet.",
  },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <PageContainer>
      <PageHeader
        {...args}
        actions={
          <Button variant="outline" size="sm">
            <Gavel /> Market
          </Button>
        }
      />
    </PageContainer>
  ),
};

export const InPageShell: Story = {
  render: (args) => (
    <PageContainer>
      <PageHeader {...args} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total locked" value="12.4M" />
        <MetricCard label="Your veLORDS" value="124,500" />
        <MetricCard label="APY" value="18.4%" valueClassName="text-trade-up" />
        <MetricCard label="Next unlock" value="182d" />
      </div>
    </PageContainer>
  ),
};
