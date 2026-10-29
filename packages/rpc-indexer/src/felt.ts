// Starknet field elements arrive from RPC as unpadded 0x-hex strings. Keep
// them as bigint internally and format explicitly for each consumer, because
// legacy Apibara rows use zero-padded 64-digit hex while ownership rows and
// the bridge package use unpadded hex.

const FELT_PRIME = 2n ** 251n + 17n * 2n ** 192n + 1n;
const U128_LIMIT = 2n ** 128n;
const HEX_PATTERN = /^0x[0-9a-fA-F]+$/;

export type Felt = `0x${string}`;

export function parseFelt(value: unknown, field: string): bigint {
  if (typeof value !== "string" || !HEX_PATTERN.test(value)) {
    throw new TypeError(`${field} is not a hex felt: ${String(value)}`);
  }
  const parsed = BigInt(value);
  if (parsed >= FELT_PRIME) {
    throw new RangeError(`${field} exceeds the Starknet field: ${value}`);
  }
  return parsed;
}

export function toHex(value: bigint): Felt {
  return `0x${value.toString(16)}`;
}

export function toPaddedHex(value: bigint): Felt {
  return `0x${value.toString(16).padStart(64, "0")}`;
}

/** Canonical comparison key for felts that may differ only in padding/case. */
export function normalizeFelt(value: unknown, field = "felt"): Felt {
  return toHex(parseFelt(value, field));
}

export function parseU128(value: unknown, field: string): bigint {
  const parsed = parseFelt(value, field);
  if (parsed >= U128_LIMIT) {
    throw new RangeError(`${field} exceeds u128: ${String(value)}`);
  }
  return parsed;
}

export function parseU64(value: unknown, field: string): bigint {
  const parsed = parseFelt(value, field);
  if (parsed >= 2n ** 64n) {
    throw new RangeError(`${field} exceeds u64: ${String(value)}`);
  }
  return parsed;
}

export function parseU256(low: unknown, high: unknown, field: string): bigint {
  return (
    parseU128(low, `${field}.low`) + (parseU128(high, `${field}.high`) << 128n)
  );
}
