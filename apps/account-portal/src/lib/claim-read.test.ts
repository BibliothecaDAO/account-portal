import { describe, expect, it } from "vitest";

import { formatClaimRead, hasClaimable, simulatedClaimRead, toClaimRead } from "./claim-read";

const simulation = (result: unknown) => [
  { transaction_trace: { execute_invocation: { result } } },
];

describe("toClaimRead", () => {
  it("keeps a returned 0 as a read", () => {
    expect(toClaimRead(0n, false, false)).toEqual({ status: "read", amount: 0n });
  });

  it("does not turn a missing value into 0", () => {
    expect(toClaimRead(undefined, false, false)).toEqual({ status: "unknown" });
    expect(toClaimRead(null, false, false)).toEqual({ status: "unknown" });
  });

  it("calls a read in flight reading, not unknown", () => {
    expect(toClaimRead(undefined, false, true)).toEqual({ status: "reading" });
  });

  it("calls an error with no value a failed read", () => {
    expect(toClaimRead(undefined, true, false)).toEqual({ status: "failed" });
  });

  it("keeps the latest value when a later refetch fails or reloads", () => {
    expect(toClaimRead(5n, true, false)).toEqual({ status: "read", amount: 5n });
    expect(toClaimRead(5n, false, true)).toEqual({ status: "read", amount: 5n });
  });
});

describe("simulatedClaimRead", () => {
  it("reads the claimed amount from the simulation", () => {
    expect(simulatedClaimRead(simulation(["0x1", "0x2", "0x10f0cf064dd59200000", "0x0"]), false, false)).toEqual({
      status: "read",
      amount: 5_000n * 10n ** 18n,
    });
  });

  it("keeps a simulated 0 as a read", () => {
    expect(simulatedClaimRead(simulation(["0x1", "0x2", "0x0", "0x0"]), false, false)).toEqual({
      status: "read",
      amount: 0n,
    });
  });

  it("is reading while the simulation runs, and not known when none runs", () => {
    expect(simulatedClaimRead(undefined, false, true)).toEqual({ status: "reading" });
    expect(simulatedClaimRead(undefined, false, false)).toEqual({ status: "unknown" });
  });

  it("calls a failed simulation a failed read, not 0", () => {
    expect(simulatedClaimRead(undefined, true, false)).toEqual({ status: "failed" });
  });

  it("calls a simulation with no result, such as a revert, a failed read", () => {
    expect(simulatedClaimRead([{ transaction_trace: { execute_invocation: { revert_reason: "x" } } }], false, false)).toEqual({
      status: "failed",
    });
    expect(simulatedClaimRead(simulation(["0x1", "0x2", "not a number"]), false, false)).toEqual({ status: "failed" });
  });
});

describe("display", () => {
  it("states a figure only for a read", () => {
    expect(formatClaimRead({ status: "read", amount: 0n })).toBe("0");
    expect(formatClaimRead({ status: "unknown" })).toBe("—");
    expect(formatClaimRead({ status: "failed" })).toBe("—");
    expect(formatClaimRead({ status: "reading" })).toBe("…");
  });

  it("offers a claim only for a read above 0", () => {
    expect(hasClaimable({ status: "read", amount: 1n })).toBe(true);
    expect(hasClaimable({ status: "read", amount: 0n })).toBe(false);
    expect(hasClaimable({ status: "failed" })).toBe(false);
    expect(hasClaimable({ status: "reading" })).toBe(false);
  });
});
