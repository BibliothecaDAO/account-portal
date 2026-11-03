import type { Decorator, Preview } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { expect } from "storybook/test";

import "../src/styles.css";

import { storybookTheme } from "./theme";
import { titleFaceWithoutCapitals } from "./title-face";

function Theme({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0, refetchOnWindowFocus: false },
        },
      }),
  );
  useEffect(() => () => client.clear(), [client]);
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.classList.add("dark");
  }, []);
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <div className="bg-background text-foreground font-sans antialiased">
          {children}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/** Components use TanStack <Link>; give every story an in-memory router. */
const withRouter: Decorator = (Story, context) => {
  const argsKey = JSON.stringify(context.args);
  const router = useMemo(
    () =>
      createRouter({
        routeTree: createRootRoute({ component: () => <Story /> }),
        history: createMemoryHistory({ initialEntries: ["/"] }),
      }),
    // Rebuild when controls change so the routed story re-renders with new args.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [argsKey],
  );
  return <RouterProvider router={router} />;
};

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    docs: { theme: storybookTheme },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "error" },
    options: {
      storySort: { order: ["Foundations", "UI", "Layout", "Dashboard"] },
    },
    viewport: {
      options: {
        mobile: {
          name: "Mobile",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
    },
  },
  // Every story, after its play function: no title in IM Fell English SC shows small capitals.
  async afterEach() {
    await expect(titleFaceWithoutCapitals()).toEqual([]);
  },
  decorators: [
    withRouter,
    (Story, context) => (
      <Theme key={context.id}>
        <Story />
      </Theme>
    ),
  ],
};

export default preview;
