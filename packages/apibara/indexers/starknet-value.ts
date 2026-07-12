type NumericValue = bigint | number | string;

function parseNumericValue(value: NumericValue): bigint {
  try {
    return BigInt(value);
  } catch {
    throw new Error(`Invalid numeric address: ${String(value)}`);
  }
}

export function toStarknetAddress(value: NumericValue): string {
  const address = parseNumericValue(value);
  if (address <= 0n || address >= 2n ** 251n - 256n) {
    throw new Error(`Invalid Starknet address: ${String(value)}`);
  }
  return `0x${address.toString(16)}`;
}

export function toEthereumAddress(value: NumericValue): string {
  const address = parseNumericValue(value);
  if (address <= 0n || address >= 2n ** 160n) {
    throw new Error(`Invalid Ethereum address: ${String(value)}`);
  }
  return `0x${address.toString(16).padStart(40, "0")}`;
}
