import { z } from "zod";

/**
 * Server-only settings, kept out of env.ts because that also ships to the browser.
 * Vite exposes only VITE_ variables on import.meta.env, so these come from process.env
 * at call time. Anything but "true" leaves a flag off.
 */
const serverEnvSchema = z.object({
  DELEGATES_INDEXER_READS: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
