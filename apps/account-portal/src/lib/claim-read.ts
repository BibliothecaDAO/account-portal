import { formatNumber } from "@/utils/utils";
import { formatEther } from "viem";

import { UNKNOWN_VALUE } from "./velords-utils";

/** A claimable LORDS balance. Only a read that returned states a figure, so a reading, unknown or failed read never shows as 0. */
export type ClaimRead =
  | { status: "reading" }
  | { status: "unknown" }
  | { status: "failed" }
  | { status: "read"; amount: bigint };

/** The latest value wins; with none, an error is a failed read, a read in flight is reading, and anything else is not known. */
export function toClaimRead(value: unknown, isError: boolean, isLoading: boolean): ClaimRead {
  if (typeof value === "bigint") return { status: "read", amount: value };
  if (isError) return { status: "failed" };
  return isLoading ? { status: "reading" } : { status: "unknown" };
}

/**
 * The amount a simulated `claim` returns: the low word of the first call's u256, after the call count and result length.
 * A simulation that returned no such word, such as a revert, is a failed read.
 */
export function simulatedClaimRead(
  simulateData: unknown,
  isError: boolean,
  isLoading: boolean,
): ClaimRead {
  if (simulateData === undefined) return toClaimRead(undefined, isError, isLoading);
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
  if (read.status === "read") return formatNumber(Number(formatEther(read.amount)));
  return read.status === "reading" ? "…" : UNKNOWN_VALUE;
}
