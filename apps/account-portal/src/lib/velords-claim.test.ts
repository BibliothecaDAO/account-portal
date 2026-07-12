import { describe, expect, it } from "vitest";

import { extractClaimableAmount } from "./velords-claim";

describe("extractClaimableAmount", () => {
  it("reads the reward amount from a successful simulation trace", () => {
    expect(
      extractClaimableAmount([
        {
          transaction_trace: {
            execute_invocation: { result: ["0x0", "0x0", "0x2a"] },
          },
        },
      ]),
    ).toBe(42n);
  });

  it("returns zero for missing or malformed simulation data", () => {
    expect(extractClaimableAmount(undefined)).toBe(0n);
    expect(extractClaimableAmount([{ transaction_trace: null }])).toBe(0n);
    expect(
      extractClaimableAmount([
        {
          transaction_trace: {
            execute_invocation: { result: ["0x0", "0x0", "not-a-felt"] },
          },
        },
      ]),
    ).toBe(0n);
  });
});
