import { describe, expect, it } from "vitest";

import { formatErc20Balance, getErc20BalanceReadConfig } from "./erc20-balance";

describe("getErc20BalanceReadConfig", () => {
  const token = "0x0000000000000000000000000000000000000001" as const;
  const account = "0x0000000000000000000000000000000000000002" as const;

  it("guards the contract read until both addresses exist", () => {
    expect(getErc20BalanceReadConfig(undefined, token).query.enabled).toBe(
      false,
    );
    expect(getErc20BalanceReadConfig(account, undefined).query.enabled).toBe(
      false,
    );
    expect(getErc20BalanceReadConfig(account, token)).toMatchObject({
      address: token,
      functionName: "balanceOf",
      args: [account],
      query: { enabled: true },
    });
  });
});

describe("formatErc20Balance", () => {
  it("formats the raw 18-decimal contract balance", () => {
    expect(formatErc20Balance(1_500_000_000_000_000_000n)).toBe(1.5);
    expect(formatErc20Balance(undefined)).toBe(0);
  });
});
