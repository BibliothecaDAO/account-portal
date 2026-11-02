import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Homepage } from "./homepage";

interface Read {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  isPending?: boolean;
}

const mocks = vi.hoisted(() => ({
  l1Address: "0x1" as string | undefined,
  l1Realms: {} as Read,
  l1Balance: {} as Read,
  l2Balance: {} as Read,
  lock: {} as Read,
  inventory: {} as Read,
  realmsClaim: {} as Read,
  veLordsClaim: {} as Read,
}));

vi.mock("@/components/icons/ethereum.svg?react", () => ({ default: () => null }));
vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));
vi.mock("@/components/icons/starknet.svg?react", () => ({ default: () => null }));
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mocks.l1Address }),
  useReadContract: ({ query }: { query: { enabled: boolean } }) =>
    query.enabled ? mocks.l1Balance : disabled,
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xabc" }),
  useBalance: () => mocks.l2Balance,
  useContract: () => ({ contract: undefined }),
  useReadContract: ({ functionName }: { functionName: string }) =>
    functionName === "get_reward_balance_for" ? mocks.realmsClaim : mocks.lock,
  useSendTransaction: () => ({ sendAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useSimulateTransactions", () => ({
  useSimulateTransactions: () => mocks.veLordsClaim,
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options?: { l1Realms?: true; inventory?: true; address?: string }) =>
    options?.l1Realms
      ? options.address
        ? mocks.l1Realms
        : disabled
      : options?.inventory
        ? mocks.inventory
        : { data: undefined, isLoading: false, isPending: false, isError: false },
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/hooks/governance/use-current-delegate", () => ({
  useCurrentDelegate: () => ({ data: undefined }),
}));
vi.mock("@/lib/getDelegates", () => ({ getDelegateByIDQueryOptions: vi.fn() }));
vi.mock("@/lib/getL1Realms", () => ({
  getL1UsersRealmsQueryOptions: ({ address }: { address?: string }) => ({
    l1Realms: true,
    address,
  }),
}));
vi.mock("@/lib/realms/get-realm-inventory", () => ({
  getRealmInventoryQueryOptions: () => ({ inventory: true }),
}));
vi.mock("../governance/proposal-list", () => ({ ProposalList: () => null }));
vi.mock("./realms-preview", () => ({ RealmsPreview: () => null }));

const read = (data: unknown): Read => ({ data, isLoading: false, isError: false });
const missing: Read = { data: undefined, isLoading: false, isError: false };
const failed: Read = { data: undefined, isLoading: false, isError: true };
const loading: Read = { data: undefined, isLoading: true, isError: false };
// What a query disabled for want of an address returns: not loading, not failed, no data.
const disabled = vi.hoisted(() => ({ data: undefined, isLoading: false, isError: false }));
const inventory = (count: number): Read => ({
  data: { status: "ready", tokens: Array.from({ length: count }, (_, id) => ({ id })) },
  isLoading: false,
  isPending: false,
  isError: false,
});
const simulation = (amount: bigint) => [
  { transaction_trace: { execute_invocation: { result: ["0x1", "0x2", `0x${amount.toString(16)}`, "0x0"] } } },
];
const realms = (count: number) =>
  read({
    collections: count
      ? [{ collection: { id: "0x7", name: "Realms" }, ownership: { tokenCount: String(count) } }]
      : [],
  });

const render = () => renderToStaticMarkup(<Homepage address="0xabc" />);
const figure = (label: string) => {
  const html = render();
  const start = html.indexOf(`>${label}</p>`);
  expect(start).toBeGreaterThan(-1);
  return /realm-stat[^>]*>([^<]*)</.exec(html.slice(start))?.[1];
};

const stats = [
  {
    label: "LORDS · Ethereum",
    set: (r: Read) => (mocks.l1Balance = r),
    zero: 0n,
    some: 12_400_500_000_000_000_000_000n,
  },
  {
    label: "LORDS · Starknet",
    set: (r: Read) => (mocks.l2Balance = r),
    zero: { formatted: "0", value: 0n },
    some: { formatted: "12400.5", value: 12_400_500_000_000_000_000_000n },
  },
  {
    label: "LORDS staked",
    set: (r: Read) => (mocks.lock = r),
    zero: { amount: 0n, end_time: 0n },
    some: { amount: 12_400_500_000_000_000_000_000n, end_time: 0n },
  },
] as const;

describe("Homepage holdings", () => {
  beforeEach(() => {
    mocks.l1Address = "0x1";
    mocks.l1Realms = realms(3);
    mocks.l1Balance = read(stats[0].some);
    mocks.l2Balance = read(stats[1].some);
    mocks.lock = read(stats[2].some);
    mocks.inventory = inventory(2);
    mocks.realmsClaim = read(0n);
    mocks.veLordsClaim = read(simulation(0n));
  });

  describe.each(stats)("$label", ({ label, set, zero, some }) => {
    it("does not state 0 for a read that is missing", () => {
      set(missing);
      expect(figure(label)).toBe("—");
    });

    it("does not state 0 for a read that failed", () => {
      set(failed);
      expect(figure(label)).toBe("—");
    });

    it("shows … while the read loads", () => {
      set(loading);
      expect(figure(label)).toBe("…");
    });

    it("states 0 when the read returned 0", () => {
      set(read(zero));
      expect(figure(label)).toBe("0");
    });

    it("states the balance it read", () => {
      set(read(some));
      expect(figure(label)).toBe("12,400.5");
    });

    it.each([
      ["0", zero],
      ["12,400.5", some],
    ] as const)("shows — when a refetch fails after reading %s, and the figure once a read succeeds", (shown, data) => {
      set(read(data));
      expect(figure(label)).toBe(shown);
      set({ data, isLoading: false, isError: true });
      expect(figure(label)).toBe("—");
      set(read(data));
      expect(figure(label)).toBe(shown);
    });
  });

  describe("Realms · Ethereum", () => {
    it("does not state 0 with no Ethereum wallet", () => {
      mocks.l1Address = undefined;
      expect(figure("Realms · Ethereum")).toBe("—");
      expect(figure("LORDS · Ethereum")).toBe("—");
    });

    it("does not state 0 for a read that failed", () => {
      mocks.l1Realms = failed;
      expect(figure("Realms · Ethereum")).toBe("—");
    });

    it("shows … while the read loads", () => {
      mocks.l1Realms = loading;
      expect(figure("Realms · Ethereum")).toBe("…");
    });

    it("states 0 when the read found none", () => {
      mocks.l1Realms = realms(0);
      expect(figure("Realms · Ethereum")).toBe("0");
    });

    it("states the count it read", () => {
      expect(figure("Realms · Ethereum")).toBe("3");
    });

    it.each([0, 3])("shows — when a refetch fails after reading %s", (count) => {
      mocks.l1Realms = realms(count);
      expect(figure("Realms · Ethereum")).toBe(String(count));
      mocks.l1Realms = { ...realms(count), isError: true };
      expect(figure("Realms · Ethereum")).toBe("—");
      mocks.l1Realms = realms(count);
      expect(figure("Realms · Ethereum")).toBe(String(count));
    });
  });

  describe("Realms · Starknet", () => {
    it.each([0, 2])("shows — when a refetch fails after reading %s", (count) => {
      mocks.inventory = inventory(count);
      expect(figure("Realms · Starknet")).toBe(String(count));
      mocks.inventory = { ...inventory(count), isError: true };
      expect(figure("Realms · Starknet")).toBe("—");
      mocks.inventory = inventory(count);
      expect(figure("Realms · Starknet")).toBe(String(count));
    });
  });
});

describe("Homepage claims", () => {
  /** The text a claim row shows after its title: an amount with Claim, "Nothing to claim", "Could not be read" or a mark. */
  const row = (html: string, title: string) => {
    const start = html.indexOf(`>${title}</span>`);
    expect(start).toBeGreaterThan(-1);
    const end = html.indexOf("realm-subtle-panel", start);
    return html.slice(start, end === -1 ? undefined : end);
  };
  const claims = [
    {
      title: "Realms emissions",
      set: (r: Read) => (mocks.realmsClaim = r),
      cached: (amount: bigint) => amount,
    },
    {
      title: "veLORDS rewards",
      set: (r: Read) => (mocks.veLordsClaim = r),
      cached: simulation,
    },
  ] as const;

  beforeEach(() => {
    mocks.l1Address = "0x1";
    mocks.l1Realms = realms(3);
    mocks.l1Balance = read(stats[0].some);
    mocks.l2Balance = read(stats[1].some);
    mocks.lock = read(stats[2].some);
    mocks.inventory = inventory(2);
    mocks.realmsClaim = read(0n);
    mocks.veLordsClaim = read(simulation(0n));
  });

  describe.each(claims)("$title", ({ title, set, cached }) => {
    it("says a refetch that fails after reading 0 could not be read, not that nothing is ready", () => {
      set(read(cached(0n)));
      expect(row(render(), title)).toContain("Nothing to claim");

      set({ data: cached(0n), isLoading: false, isError: true });
      const html = render();
      expect(row(html, title)).toContain("Could not be read");
      expect(row(html, title)).not.toContain("Nothing to claim");
      expect(html).toContain("A claimable balance could not be read. Reload the page to try again.");
      expect(html).not.toContain("No LORDS to collect right now.");

      set(read(cached(0n)));
      expect(row(render(), title)).toContain("Nothing to claim");
    });

    it("withdraws Claim when a refetch fails after reading an amount", () => {
      const amount = 1_284n * 10n ** 18n;
      set(read(cached(amount)));
      expect(row(render(), title)).toContain("1,284 LORDS");
      expect(row(render(), title)).toContain(">Claim<");

      set({ data: cached(amount), isLoading: false, isError: true });
      const html = render();
      expect(row(html, title)).toContain("Could not be read");
      expect(row(html, title)).not.toContain("1,284");
      expect(row(html, title)).not.toContain(">Claim<");
      expect(html).toContain("A claimable balance could not be read. Reload the page to try again.");

      set(read(cached(amount)));
      expect(row(render(), title)).toContain(">Claim<");
    });
  });
});
