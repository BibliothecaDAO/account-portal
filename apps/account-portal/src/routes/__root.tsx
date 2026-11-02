/// <reference types="vite/client" />
import { lazy, Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { NavUser } from "@/components/layout/nav-user";
import { RouteProgress } from "@/components/layout/route-progress";
import { WrongNetworkDialog } from "@/components/layout/wrong-network-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import appCss from "@/styles.css?url";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { StarknetProvider } from "@/providers/starknet";
import { seo } from "@/utils/seo";
import { AppKitProvider } from "@/providers/ethereum";

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : null;
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : null;

export interface RouterAppContext {
  session: {
    address: string;
    chain: string;
    provider: string;
  };
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "RW | Account Portal",
        description: `Interact with your Realms and Lords on the various ecosystem projects. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "32x32",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/icon.svg",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <StarknetProvider>
          <AppKitProvider queryClient={queryClient}>
            <SidebarProvider className="[--header-height:calc(--spacing(14))]">
              <RouteProgress />
              <AppSidebar footer={<NavUser />} />
              <SidebarInset>
                <SiteHeader />
                <div id="main-content" className="main-content flex-1">
                  <Outlet />
                </div>
              </SidebarInset>
              <WrongNetworkDialog />
              <Toaster />
            </SidebarProvider>
          </AppKitProvider>
        </StarknetProvider>
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            {TanStackRouterDevtools && (
              <TanStackRouterDevtools position="bottom-left" />
            )}
            {ReactQueryDevtools && (
              <ReactQueryDevtools
                position="bottom"
                buttonPosition="bottom-right"
              />
            )}
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
