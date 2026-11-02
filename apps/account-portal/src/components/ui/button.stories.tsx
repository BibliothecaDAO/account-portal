import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Plus } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "./button";

const variants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Continue", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: variants },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon", "icon-sm"],
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Continue" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">
        Large <ArrowRight />
      </Button>
      <Button size="icon" variant="outline" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
};
