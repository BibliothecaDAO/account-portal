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

const simulation = (amount: bigint) => [
  { transaction_trace: { execute_invocation: { result: ["0x1", "0x2", `0x${amount.toString(16)}`, "0x0"] } } },
];
const render = () => renderToStaticMarkup(<VelordsRewards />);
const amount = (html: string) => /realm-stat[^>]*>([^<]*)</.exec(html)?.[1];
const claimButton = (html: string) =>
  /<button[^>]*>(?:(?!<\/button>).)*Claim LORDS<\/button>/.exec(html)?.[0];

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

  it.each([
    ["0", 0n],
    ["312.4", 312_400_000_000_000_000_000n],
  ])("says a refetch that fails after reading %s could not be read, and offers no claim", (figure, claimable) => {
    mocks.simulation = { data: simulation(claimable), isError: false, isLoading: false };
    expect(amount(render())).toBe(figure);

    mocks.simulation = { data: simulation(claimable), isError: true, isLoading: false };
    const html = render();
    expect(amount(html)).toBe("—");
    expect(html).toContain("Your claimable LORDS could not be read. Reload the page to try again.");
    expect(claimButton(html)).toBeUndefined();

    mocks.simulation = { data: simulation(claimable), isError: false, isLoading: false };
    expect(amount(render())).toBe(figure);
  });

  it("offers the claim for an amount it read", () => {
    mocks.simulation = { data: simulation(312_400_000_000_000_000_000n), isError: false, isLoading: false };
    expect(claimButton(render())).not.toContain('disabled=""');
  });
});
