import { formatNumber } from "@/utils/utils";
import { formatEther } from "viem";

import { UNKNOWN_VALUE } from "./velords-utils";

/** A claimable LORDS balance. Only a read that returned states a figure, so an unknown or failed read never shows as 0. */
export type ClaimRead =
  | { status: "unknown" }
  | { status: "failed" }
  | { status: "read"; amount: bigint };

/** The latest value wins; with none, an error is a failed read and anything else is not known yet. */
export function toClaimRead(value: unknown, isError: boolean): ClaimRead {
  if (typeof value === "bigint") return { status: "read", amount: value };
  return isError ? { status: "failed" } : { status: "unknown" };
}

/**
 * The amount a simulated `claim` returns: the low word of the first call's u256, after the call count and result length.
 * A simulation that returned no such word, such as a revert, is a failed read.
 */
export function simulatedClaimRead(simulateData: unknown, isError: boolean): ClaimRead {
  if (simulateData === undefined) return toClaimRead(undefined, isError);
  const low: unknown = (simulateData as any)?.[0]?.transaction_trace?.execute_invocation?.result?.[2];
  if (typeof low !== "string") return { status: "failed" };
  try {
    return { status: "read", amount: BigInt(low) };
  } catch {
    return { status: "failed" };
  }
}

export function hasClaimable(read: ClaimRead): boolean {
  return read.status === "read" && read.amount > 0n;
}

export function formatClaimRead(read: ClaimRead): string {
  return read.status === "read"
    ? formatNumber(Number(formatEther(read.amount)))
    : UNKNOWN_VALUE;
}
