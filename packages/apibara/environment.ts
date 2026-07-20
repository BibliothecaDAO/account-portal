import { z } from "zod";

const ApibaraEnvironmentSchema = z.object({
  VITE_PUBLIC_CHAIN: z.enum(["sepolia", "mainnet"]),
});

export type ApibaraEnvironment = z.infer<typeof ApibaraEnvironmentSchema>;

export function parseApibaraEnvironment(
  input: Record<string, unknown>,
): ApibaraEnvironment {
  return ApibaraEnvironmentSchema.parse(input);
}
