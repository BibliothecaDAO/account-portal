import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import * as DelegatesStories from "../modules/governance/delegates.stories";
import * as ProposalsStories from "../modules/governance/proposals.stories";
import * as DashboardStories from "../modules/homepage/dashboard.stories";
import { DashboardStats } from "../modules/homepage/dashboard-stats";
import * as RealmsStories from "../modules/realms/realms.stories";
import * as VelordsStories from "../modules/velords/velords.stories";
import { SectionCard } from "../ui/section-card";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./header";
import { NavUserView } from "./nav-user";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";

function Shell({
  defaultOpen = true,
  connected = true,
  children,
}: {
  defaultOpen?: boolean;
  connected?: boolean;
  children?: ReactNode;
}) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="[--header-height:calc(--spacing(14))]"
    >
      <AppSidebar
        footer={
          <NavUserView
            address={
              connected
                ? "0x04a1c0f3b2e8d7c6a5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d49c2e"
                : undefined
            }
            connectorName="Argent X"
            explorerUrl="https://voyager.online"
            onConnect={fn()}
            onCopy={fn()}
            onDisconnect={fn()}
          />
        }
      />
      <SidebarInset>
        <SiteHeader />
        {children ?? (
          <PageContainer>
            <PageHeader
              title="Dashboard"
              description="Your Realms, LORDS, rewards and governance across Ethereum and Starknet."
            />
            <DashboardStats
              realmsL1={3}
              realmsL2={7}
              lordsL1="12.4K"
              lordsL2="48.2K"
              lordsStaked="124.5K"
            />
            <SectionCard title="Recent proposals" description="Page content area." />
          </PageContainer>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

const meta = {
  title: "Layout/App shell",
  component: Shell,
  parameters: { layout: "fullscreen" },
  args: { defaultOpen: true, connected: true },
} satisfies Meta<typeof Shell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};
export const Collapsed: Story = { args: { defaultOpen: false } };
export const CollapsedMenuOpen: Story = {
  args: { defaultOpen: false },
  play: async ({ canvasElement }) => {
    // Below 768 the side panel is a closed sheet, with nothing to open.
    if (window.innerWidth < 768) return;
    await userEvent.click(
      await within(canvasElement).findByRole("button", { name: "Realms" }),
    );
    await expect(
      await screen.findByRole("menuitem", { name: "Bridge" }),
    ).toBeVisible();
  },
};
export const Disconnected: Story = { args: { connected: false } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};

/** The real width a page gets: its own story, inside the side panel and header. */
const inShell = (page: { render?: unknown }): Story => ({
  render: (args) => <Shell {...args}>{(page.render as () => ReactNode)()}</Shell>,
});

export const DashboardPage = inShell(DashboardStories.FullPage);
export const RealmsPage = inShell(RealmsStories.RealmsPage);
export const BridgePage = inShell(RealmsStories.BridgePage);
export const ClaimsPage = inShell(RealmsStories.ClaimsPage);
export const VelordsPage = inShell(VelordsStories.FullPage);
export const DelegatesPage = inShell(DelegatesStories.List);
export const ProposalsPage = inShell(ProposalsStories.List);
export const ProposalPage = inShell(ProposalsStories.DetailActive);
