import type { ReactNode } from "react";
import type * as React from "react";
import RWLogo from "@/components/icons/rw-logo.svg?react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

import { navGroups } from "./nav-config";
import { NavMain } from "./nav-main";

/**
 * App navigation (shadcn sidebar-07 pattern): inset, collapsible to icons,
 * brand header, grouped nav (nav-config.ts) and an account footer slot.
 */
export function AppSidebar({
  footer,
  ...props
}: React.ComponentProps<typeof Sidebar> & { footer?: ReactNode }) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Realms Portal">
              <Link to="/">
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <RWLogo className="h-auto w-8" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="realm-title truncate text-base">Realms</span>
                  <span className="realm-label truncate">Account portal</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, i) => (
          <Fragment key={group.label ?? "main"}>
            {i > 0 ? <SidebarSeparator /> : null}
            <NavMain group={group} />
          </Fragment>
        ))}
      </SidebarContent>
      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  );
}
