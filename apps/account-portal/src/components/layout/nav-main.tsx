"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  label: string;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const realmsActive =
    pathname === "/realms" || pathname.startsWith("/realms/");
  const [realmsOpen, setRealmsOpen] = useState(realmsActive);
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (realmsActive) setRealmsOpen(true);
  }, [pathname, realmsActive]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              {...(item.url === "/realms"
                ? { open: realmsOpen, onOpenChange: setRealmsOpen }
                : {})}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.url === "/realms" ? (
                  <>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={realmsActive}
                    >
                      <Link
                        to={item.url}
                        onClick={() => {
                          setRealmsOpen(true);
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction aria-label="Toggle Realms submenu">
                        <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                  </>
                ) : (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to={subItem.url}
                            onClick={() => {
                              if (item.url === "/realms" && isMobile)
                                setOpenMobile(false);
                            }}
                            activeProps={{ className: `text-sidebar-ring` }}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url} activeProps={{ className: `font-bold` }}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
