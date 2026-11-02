import { describe, expect, it, vi } from "vitest";

import { useVelordsData } from "./use-velords-data";

const mocks = vi.hoisted(() => ({ failing: [] as string[] }));

vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({}),
  useNetwork: () => ({ chain: {} }),
  useReadContract: ({ functionName }: { functionName: string }) => ({
    data: undefined,
    isError: mocks.failing.includes(functionName),
  }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}));
vi.mock("@/lib/getLordsPrice", () => ({ getLordsPriceUsd: vi.fn() }));

describe("useVelordsData", () => {
  it("reports each failed read, so nothing waits on it forever", () => {
    mocks.failing = ["total_supply"];
    expect(useVelordsData()).toMatchObject({
      isTotalSupplyError: true,
      isLordsLockedError: false,
    });

    mocks.failing = ["balance_of"];
    expect(useVelordsData()).toMatchObject({
      isTotalSupplyError: false,
      isLordsLockedError: true,
    });
  });
});
