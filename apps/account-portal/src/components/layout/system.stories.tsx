import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { fn } from "storybook/test";

import { ErrorStateView } from "./default-catch-boundary";
import { LoginCardView } from "./login-card";
import { NotFoundView } from "./not-found";
import { PageContainer } from "./page-container";

const meta = {
  title: "Pages/System",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <PageContainer width="narrow">
        <Story />
      </PageContainer>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  render: () => <LoginCardView action={<Button className="w-full">Connect wallet</Button>} />,
};

export const NotFound: Story = {
  render: () => <NotFoundView onBack={fn()} />,
};

export const ProposalNotFound: Story = {
  render: () => (
    <NotFoundView
      title="Proposal not found"
      description="This proposal does not exist or has been removed."
      onBack={fn()}
    />
  ),
};

export const RouteError: Story = {
  render: () => (
    <ErrorStateView
      details={
        <pre>
          TypeError: Cannot read properties of undefined (reading 'proposal')
        </pre>
      }
      onRetry={fn()}
      onBack={fn()}
    />
  ),
};

export const ErrorAtRoot: Story = {
  render: () => <ErrorStateView isRoot onRetry={fn()} />,
};

