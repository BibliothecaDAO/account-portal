import { formatAddress } from "@/utils/utils";
import { num } from "starknet";

/** The address in the form delegate records use, or undefined for no delegate (zero). */
export function toDelegateAddress(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = BigInt(raw as bigint | string);
  return value === 0n ? undefined : formatAddress(num.toHex(value));
}

/**
 * The current delegate leads the list. `currentRecord` adds them when the fetched page
 * left them out, so a wallet can always see who holds its votes.
 */
export function placeCurrentDelegateFirst<
  T extends { user: string; delegatedVotes?: string | null },
>(
  items: T[],
  currentAddress: string | undefined,
  currentRecord?: T | null,
): T[] {
  if (!currentAddress) return items;
  const listed = items.find((item) => item.user === currentAddress);
  const record = currentRecord?.user === currentAddress ? currentRecord : undefined;
  // A listed row with unknown votes gives way to the record, which read the chain.
  const current = listed?.delegatedVotes === null ? (record ?? listed) : (listed ?? record);
  if (!current) return items;
  return [current, ...items.filter((item) => item.user !== currentAddress)];
}
