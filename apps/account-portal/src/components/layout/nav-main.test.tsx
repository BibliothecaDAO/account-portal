import type * as SidebarModule from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppSidebar } from "./app-sidebar";

const navigation = vi.hoisted(() => ({
  pathname: "/proposal/list",
  isMobile: false,
  closeMobile: vi.fn(),
  clicks: new Map<string, (event: { defaultPrevented: boolean }) => void>(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => navigation.pathname,
  Link: ({
    to,
    onClick,
    children,
    activeProps: _activeProps,
    ...props
  }: {
    to: string;
    onClick?: (event: { defaultPrevented: boolean }) => void;
    children: ReactNode;
    activeProps?: unknown;
  }) => {
    if (onClick) navigation.clicks.set(to, onClick);
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/components/ui/sidebar", async (importOriginal) => ({
  ...(await importOriginal<typeof SidebarModule>()),
  useSidebar: () => ({
    isMobile: navigation.isMobile,
    setOpenMobile: navigation.closeMobile,
  }),
}));

function renderSidebar() {
  return renderToStaticMarkup(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

function clickLink(url: string) {
  const handler = navigation.clicks.get(url);
  if (!handler) throw new Error(`Missing link handler: ${url}`);
  // The real tooltip's composed click handler clears its browser timer.
  vi.stubGlobal("window", { clearTimeout });
  try {
    handler({ defaultPrevented: false });
  } finally {
    vi.unstubAllGlobals();
  }
}

beforeEach(() => {
  navigation.pathname = "/proposal/list";
  navigation.isMobile = false;
  navigation.closeMobile.mockClear();
  navigation.clicks.clear();
});

describe("Realms sidebar navigation", () => {
  it("provides a parent inventory link and a separate accessible disclosure button", () => {
    const html = renderSidebar();
    expect(html).toContain('href="/realms"');
    expect(html).toMatch(
      /<button[^>]*aria-label="Toggle Realms submenu"[^>]*aria-expanded="false"/,
    );
  });

  it.each(["/realms", "/realms/bridge", "/realms/claims"])(
    "opens the submenu on %s with unchanged child destinations",
    (pathname) => {
      navigation.pathname = pathname;
      const html = renderSidebar();
      expect(html).toMatch(
        /aria-label="Toggle Realms submenu"[^>]*aria-expanded="true"/,
      );
      expect(html).toContain('data-active="true"');
      expect(html).toContain('href="/realms/bridge"');
      expect(html).toContain('href="/realms/claims"');
      expect(html).toContain('href="https://market.realms.world"');
    },
  );

  it("closes the mobile menu when the parent link is activated", () => {
    navigation.isMobile = true;
    renderSidebar();
    clickLink("/realms");
    expect(navigation.closeMobile).toHaveBeenCalledWith(false);
  });

  it("does not close the desktop sidebar when the parent link is activated", () => {
    renderSidebar();
    clickLink("/realms");
    expect(navigation.closeMobile).not.toHaveBeenCalled();
  });

  it("closes the mobile menu after following a Realms child link", () => {
    navigation.isMobile = true;
    navigation.pathname = "/realms";
    renderSidebar();
    clickLink("/realms/bridge");
    expect(navigation.closeMobile).toHaveBeenCalledWith(false);
  });
});
