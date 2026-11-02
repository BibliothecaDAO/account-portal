import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Route } from "./velords.index";

const mocks = vi.hoisted(() => ({
  velordsData: {} as Record<string, unknown>,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: object) => ({
    ...options,
    options,
    useNavigate: () => vi.fn(),
    useSearch: () => ({ period: "3m", view: "overview" }),
  }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      weekly: [],
      sources: [],
      rewards7dWei: "1000000000000000000",
      rewards30dWei: "1000000000000000000",
    },
    isLoading: false,
    isError: false,
  }),
  QueryClient: vi.fn(),
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({}),
  useExplorer: () => ({ contract: (address: string) => address }),
}));
vi.mock("@/hooks/use-velords-data", () => ({
  useVelordsData: () => mocks.velordsData,
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/getVeLordsAnalytics", () => ({
  getVelordsOverviewQueryOptions: vi.fn(),
  getVelordsRewardsSeriesQueryOptions: vi.fn(),
  getVelordsLockActivityQueryOptions: vi.fn(),
}));
vi.mock("@/lib/getVeLordsBurns", () => ({
  getVelordsBurnsQueryOptions: vi.fn(),
}));
vi.mock("@/lib/velords-sources", () => ({
  getVelordsSourceLabel: (sender: string) => sender,
}));
vi.mock("@/lib/velords-analytics", () => ({
  calculateTrailingApyPercent: () => 18.42,
}));

function metrics() {
  const Page = (Route as unknown as { options: { component: React.FC } }).options
    .component;
  const html = renderToStaticMarkup(<Page />);
  const start = html.indexOf('aria-label="veLORDS metrics"');
  return html.slice(start, html.indexOf("</section>", start));
}

const skeletons = (html: string) => html.split('data-slot="skeleton"').length - 1;

describe("veLORDS metrics", () => {
  beforeEach(() => {
    mocks.velordsData = { isTVLLoading: true };
  });

  it("waits while the contract reads are pending", () => {
    expect(skeletons(metrics())).toBe(4);
  });

  it("shows unknown, not an endless skeleton, when the reads fail", () => {
    mocks.velordsData = {
      isTVLLoading: false,
      isTotalSupplyError: true,
      isLordsLockedError: true,
    };

    const html = metrics();
    expect(skeletons(html)).toBe(0);
    expect(html.split(">—<").length - 1).toBe(4);
  });

  it("does not let one failed read clear the other's skeleton", () => {
    mocks.velordsData = { isTVLLoading: true, isLordsLockedError: true };

    expect(skeletons(metrics())).toBe(3);
  });
});
