export const SHADOW_INDEXER = "strk-realms-bridge";

export function shadowRuntimeConfig(env) {
  if (env.APIBARA_BRIDGE_STORAGE !== "isolated") {
    throw new Error("Bridge shadow requires APIBARA_BRIDGE_STORAGE=isolated");
  }
  if (!["mainnet", "sepolia"].includes(env.VITE_PUBLIC_CHAIN)) {
    throw new Error(
      "Bridge shadow requires VITE_PUBLIC_CHAIN=mainnet or sepolia",
    );
  }
  const storageSchema = `airfoil_l2_bridge_${env.VITE_PUBLIC_CHAIN}`;
  if (
    env.APIBARA_STORAGE_SCHEMA !== undefined &&
    env.APIBARA_STORAGE_SCHEMA !== storageSchema
  ) {
    throw new Error("Bridge shadow metadata schema does not match its network");
  }
  if (env.APIBARA_ALWAYS_REINDEX === "true") {
    throw new Error("Bridge shadow forbids APIBARA_ALWAYS_REINDEX");
  }
  if (!env.DNA_TOKEN?.trim()) throw new Error("DNA_TOKEN is required");
  let database;
  try {
    database = new URL(env.DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    !database.hostname ||
    database.pathname === "/"
  ) {
    throw new Error(
      "DATABASE_URL must identify the durable PostgreSQL database",
    );
  }
  return {
    ...env,
    NODE_ENV: "production",
    APIBARA_BRIDGE_STORAGE: "isolated",
    APIBARA_ALWAYS_REINDEX: "false",
    APIBARA_STORAGE_SCHEMA: storageSchema,
  };
}
