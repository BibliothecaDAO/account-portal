/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AppKitProvider } from "@/providers/ethereum";
import { StarknetProvider } from "@/providers/starknet";
import { ThemeProvider } from "@/providers/theme";
import appCss from "@/styles.css?url";
import { seo } from "@/utils/seo";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";

const THEME_STORAGE_KEY = "vite-ui-theme";
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden antialiased">
        <ScriptOnce>
          {`(() => {
            const theme = localStorage.getItem('${THEME_STORAGE_KEY}');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const shouldUseDark =
              theme === 'dark' || theme === null || (theme === 'system' && prefersDark);
            document.documentElement.classList.toggle('dark', shouldUseDark);
          })();`}
        </ScriptOnce>
        <div
          className={`realm-app-shell flex h-screen flex-col [--header-height:calc(--spacing(16))]`}
        >
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <StarknetProvider>
              <AppKitProvider queryClient={queryClient}>
                <SidebarProvider className="realm-app-shell flex h-full flex-col">
                  <Header />
                  <div className="flex min-h-0 flex-1">
                    <AppSidebar />
                    <SidebarInset className="min-h-auto overflow-auto">
                      <Outlet />
                    </SidebarInset>
                  </div>
                  <Toaster />
                </SidebarProvider>
              </AppKitProvider>
            </StarknetProvider>
          </ThemeProvider>
        </div>
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
