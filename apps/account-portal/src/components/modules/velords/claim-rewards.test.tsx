import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VelordsRewards } from "./claim-rewards";

const mocks = vi.hoisted(() => ({
  simulation: { data: undefined as unknown, isError: false, isLoading: false },
}));

vi.mock("@/components/icons/lords.svg?react", () => ({ default: () => null }));
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
vi.mock("@/hooks/useSimulateTransactions", () => ({
  useSimulateTransactions: () => mocks.simulation,
}));
vi.mock("@starknet-start/react", () => ({
  useAccount: () => ({ address: "0xabc" }),
  useContract: () => ({ contract: { populate: () => ({}) } }),
  useSendTransaction: () => ({ sendAsync: vi.fn(), isPending: false }),
}));

const render = () => renderToStaticMarkup(<VelordsRewards />);
const amount = (html: string) => /realm-stat[^>]*>([^<]*)</.exec(html)?.[1];

describe("VelordsRewards", () => {
  beforeEach(() => {
    mocks.simulation = { data: undefined, isError: false, isLoading: false };
  });

  it("shows a claim simulation still running as reading, never as 0 or unknown", () => {
    mocks.simulation = { data: undefined, isError: false, isLoading: true };
    expect(amount(render())).toBe("…");
  });

  it("does not state a figure when no simulation runs", () => {
    expect(amount(render())).toBe("—");
  });

  it("says a failed simulation could not be read", () => {
    mocks.simulation = { data: undefined, isError: true, isLoading: false };
    const html = render();
    expect(amount(html)).toBe("—");
    expect(html).toContain("Your claimable LORDS could not be read. Reload the page to try again.");
  });
});
