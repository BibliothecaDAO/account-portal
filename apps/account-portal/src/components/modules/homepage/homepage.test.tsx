import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Homepage } from "./homepage";

interface Read {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
}

const mocks = vi.hoisted(() => ({
  l1Address: "0x1" as string | undefined,
  l1Realms: {} as Read,
  l1Balance: {} as Read,
  l2Balance: {} as Read,
  lock: {} as Read,
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
  useBalance: () => mocks.l2Balance,
  useReadContract: () => mocks.lock,
  useSendTransaction: () => ({ sendAsync: vi.fn(), isPending: false }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options?: { l1Realms: true; address?: string }) =>
    options?.l1Realms
      ? options.address
        ? mocks.l1Realms
        : disabled
      : { data: undefined, isLoading: false, isPending: false, isError: false },
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/hooks/governance/use-current-delegate", () => ({
  useCurrentDelegate: () => ({ data: undefined }),
}));
vi.mock("@/hooks/use-l2-realms-claims", () => ({
  useL2RealmsClaims: () => ({ claimable: { status: "unknown" }, calls: [] }),
}));
vi.mock("@/hooks/use-velords-claims", () => ({
  default: () => ({ lordsClaimable: { status: "unknown" }, claimCall: undefined }),
}));
vi.mock("@/lib/getDelegates", () => ({ getDelegateByIDQueryOptions: vi.fn() }));
vi.mock("@/lib/getL1Realms", () => ({
  getL1UsersRealmsQueryOptions: ({ address }: { address?: string }) => ({
    l1Realms: true,
    address,
  }),
}));
vi.mock("@/lib/realms/get-realm-inventory", () => ({
  getRealmInventoryQueryOptions: vi.fn(),
}));
vi.mock("../governance/proposal-list", () => ({ ProposalList: () => null }));
vi.mock("./realms-preview", () => ({ RealmsPreview: () => null }));

const read = (data: unknown): Read => ({ data, isLoading: false, isError: false });
const missing: Read = { data: undefined, isLoading: false, isError: false };
const failed: Read = { data: undefined, isLoading: false, isError: true };
const loading: Read = { data: undefined, isLoading: true, isError: false };
// What a query disabled for want of an address returns: not loading, not failed, no data.
const disabled = vi.hoisted(() => ({ data: undefined, isLoading: false, isError: false }));
const realms = (count: number) =>
  read({
    collections: count
      ? [{ collection: { id: "0x7", name: "Realms" }, ownership: { tokenCount: String(count) } }]
      : [],
  });

const figure = (label: string) => {
  const html = renderToStaticMarkup(<Homepage address="0xabc" />);
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
  });
});
