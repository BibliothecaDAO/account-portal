import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "env";

import { db } from "@realms-world/db/client";

import { resolveAuthRuntimeConfig } from "./auth/auth-config";
import { siws } from "./auth/auth-siws-plugin";

const authRuntime = resolveAuthRuntimeConfig({
  nodeEnv: process.env.NODE_ENV,
  baseUrl: env.VITE_BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

export const auth = betterAuth({
  ...authRuntime,
  appName: "Realms Account Portal",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 60 minutes
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/siws/nonce": { window: 60, max: 5 },
      "/siws/verify": { window: 60, max: 10 },
    },
  },

  plugins: [
    siws({
      domain: authRuntime.baseURL,
      chainId: env.VITE_PUBLIC_CHAIN === "sepolia" ? "SN_SEPOLIA" : "SN_MAIN",
    }),
  ],
});
