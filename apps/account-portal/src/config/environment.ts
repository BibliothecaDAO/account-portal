import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);
const requiredUrl = z.string().url();
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const PublicEnvironmentSchema = z.object({
  VITE_PUBLIC_CHAIN: z.enum(["sepolia", "mainnet"]),
  VITE_BASE_URL: optionalUrl,
  VITE_PUBLIC_IMAGE_CDN_URL: optionalUrl,
  VITE_PUBLIC_IMAGE_PROXY_URL: optionalUrl,
  VITE_PUBLIC_IPFS_GATEWAY: optionalUrl,
  VITE_TORII_API_URL: requiredUrl,
  VITE_PUBLIC_SLOT: z.string().min(1),
  VITE_PUBLIC_NODE_URL: optionalUrl,
});

const ServerEnvironmentSchema = z.object({
  ALCHEMY_API_KEY: z.string().min(1),
  ETHPLORER_API_KEY: optionalSecret,
});

export type PublicEnvironment = z.infer<typeof PublicEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof ServerEnvironmentSchema>;

export function parsePublicEnvironment(
  input: Record<string, unknown>,
  { isCi = false }: { isCi?: boolean } = {},
): PublicEnvironment {
  return PublicEnvironmentSchema.parse(
    isCi
      ? {
          ...input,
          VITE_PUBLIC_CHAIN: input.VITE_PUBLIC_CHAIN ?? "mainnet",
          VITE_PUBLIC_SLOT: input.VITE_PUBLIC_SLOT ?? "ci",
        }
      : input,
  );
}

export function parseServerEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
  return ServerEnvironmentSchema.parse({
    ALCHEMY_API_KEY: input.ALCHEMY_API_KEY ?? input.VITE_ALCHEMY_API_KEY,
    ETHPLORER_API_KEY: input.ETHPLORER_API_KEY ?? input.VITE_ETHPLORER_APIKEY,
  });
}

export function getServerEnvironment(): ServerEnvironment {
  return parseServerEnvironment({
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    ETHPLORER_API_KEY: process.env.ETHPLORER_API_KEY,
    VITE_ALCHEMY_API_KEY: process.env.VITE_ALCHEMY_API_KEY,
    VITE_ETHPLORER_APIKEY: process.env.VITE_ETHPLORER_APIKEY,
  });
}
