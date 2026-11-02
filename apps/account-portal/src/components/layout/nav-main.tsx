import type { NavGroup } from "./nav-config";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { isActivePath, isExternal } from "./nav-config";

/** Internal or external link; forwards Slot props (className, data-*) from SidebarMenuButton. */
function NavLink({
  url,
  ...props
}: React.ComponentProps<"a"> & { url: string }) {
  return isExternal(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer" {...props} />
  ) : (
    <Link to={url} {...props} />
  );
}

export function NavMain({ group }: { group: NavGroup }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMobile, state } = useSidebar();
  const iconsOnly = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {group.items.map((item) => {
          const childActive =
            item.items?.some((sub) => isActivePath(pathname, sub.url)) ?? false;
          const active = childActive || isActivePath(pathname, item.url);

          if (!item.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                  <NavLink url={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Sub-items are hidden in icon mode, so a parent opens them in a menu instead.
          if (iconsOnly) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={active}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    {item.items.map((sub) => (
                      <DropdownMenuItem key={sub.title} asChild>
                        <NavLink url={sub.url}>{sub.title}</NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={childActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={active}>
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((sub) => (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, sub.url)}
                        >
                          <NavLink url={sub.url}>
                            <span>{sub.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
