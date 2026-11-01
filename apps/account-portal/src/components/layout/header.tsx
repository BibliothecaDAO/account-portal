import type { ReactNode } from "react";

import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Breadcrumbs } from "./breadcrumbs";

/** Sticky page header inside SidebarInset: sidebar toggle, breadcrumbs, optional actions. */
export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="bg-background/85 border-border sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md md:rounded-t-xl">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center gap-2 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <Breadcrumbs />
        {actions ? (
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
