import { z } from "zod";

export const StarknetAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{1,64}$/, "Invalid Starknet address")
  .refine((address) => {
    try {
      const value = BigInt(address);
      return value > 0n && value < 2n ** 251n - 256n;
    } catch {
      return false;
    }
  }, "Invalid Starknet address")
  .transform((address) => `0x${BigInt(address).toString(16)}`);

export const EthereumAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid Ethereum address");

export function normalizeOptionalStarknetAddress(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") return undefined;

  const result = StarknetAddressSchema.safeParse(value.trim());
  return result.success ? result.data : undefined;
}
