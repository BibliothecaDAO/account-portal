import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BookOpen,
  Castle,
  ClipboardPen,
  ExternalLink,
  LayoutDashboard,
  Vote,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: NavSubItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      {
        title: "Realms",
        url: "/realms",
        icon: Castle,
        items: [
          { title: "Your Realms", url: "/realms" },
          { title: "Bridge", url: "/realms/bridge" },
          { title: "Claims", url: "/realms/claims" },
        ],
      },
      { title: "veLORDS", url: "/velords", icon: Banknote },
      {
        title: "Delegates",
        url: "/delegate/list",
        icon: ClipboardPen,
        items: [
          { title: "All delegates", url: "/delegate/list" },
          { title: "Your profile", url: "/delegate/profile" },
        ],
      },
      { title: "Proposals", url: "/proposal/list", icon: Vote },
    ],
  },
  {
    label: "Information",
    items: [
      {
        title: "Quick Links",
        url: "#",
        icon: ExternalLink,
        items: [
          { title: "CoinGecko", url: "https://www.coingecko.com/en/coins/lords" },
          { title: "Merch Shop", url: "https://shop.realms.world/" },
          { title: "Discord", url: "https://discord.com/invite/realmsworld" },
          { title: "Twitter", url: "https://x.com/lootrealms" },
          { title: "Github", url: "https://github.com/bibliothecaDAO" },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Realms.World", url: "https://realms.world" },
          { title: "Blitz", url: "https://blitz.realms.world" },
          { title: "Developer", url: "https://docs.realms.world" },
        ],
      },
    ],
  },
];

export const isExternal = (url: string) => /^https?:\/\//.test(url);

/** True when `pathname` is `url` or nested below it ("/" only matches exactly). */
export function isActivePath(pathname: string, url: string) {
  if (isExternal(url) || url === "#") return false;
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}

const labels: Record<string, string> = {
  realms: "Realms",
  bridge: "Bridge",
  claims: "Claims",
  velords: "veLORDS",
  delegate: "Delegates",
  profile: "Profile",
  proposal: "Proposals",
};

/** Sections with no index route: their crumb links to the section's list page. */
const sectionUrls: Record<string, string> = {
  "/delegate": "/delegate/list",
  "/proposal": "/proposal/list",
};

/** Breadcrumb trail derived from the pathname. The list page is its section, so it adds no crumb. */
export function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.flatMap((part, i) => {
    const url = `/${parts.slice(0, i + 1).join("/")}`;
    if (part === "list" && sectionUrls[`/${parts[i - 1]}`] === url) return [];
    return [
      {
        label: labels[part] ?? (part.length > 12 ? `${part.slice(0, 8)}…` : part),
        url: sectionUrls[url] ?? url,
      },
    ];
  });
}
