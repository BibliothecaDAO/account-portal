const networks = {
  "config.mainnet.yaml": {
    id: 1,
    schema: "hyperindex_l1_mainnet",
    start: 20433152,
  },
  "config.sepolia.yaml": {
    id: 11155111,
    schema: "hyperindex_l1_sepolia",
    start: 6180467,
  },
};

export function runtimeConfig(input) {
  const env = { ...input };
  const required = [
    "ENVIO_CONFIG",
    "ENVIO_API_TOKEN",
    "ENVIO_PG_HOST",
    "ENVIO_PG_PORT",
    "ENVIO_PG_DATABASE",
    "ENVIO_PG_USER",
    "ENVIO_PG_PASSWORD",
    "ENVIO_PG_SCHEMA",
    "ENVIO_PG_SSL_MODE",
  ];
  for (const key of required) {
    if (!env[key]?.trim()) throw new Error(`${key} is required`);
    if (/[\r\n\0]/.test(env[key]))
      throw new Error(`${key} contains unsupported control characters`);
  }
  const network = networks[env.ENVIO_CONFIG];
  if (!network)
    throw new Error(
      "ENVIO_CONFIG must select a checked-in mainnet or sepolia configuration",
    );
  if (
    ["testing", "password", "changeme"].includes(
      env.ENVIO_PG_PASSWORD.toLowerCase(),
    ) ||
    env.ENVIO_API_TOKEN.length < 16
  )
    throw new Error("Production secrets must not be placeholders");
  // An explicit suffix permits a clean rebuild without resetting the previous schema.
  if (
    !new RegExp(`^${network.schema}(?:_[a-z0-9]+)?$`).test(
      env.ENVIO_PG_SCHEMA,
    ) ||
    env.ENVIO_PG_SCHEMA.length > 63
  ) {
    throw new Error("ENVIO_PG_SCHEMA does not match the selected network");
  }
  const port = (value, label) => {
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535)
      throw new Error(`${label} must be a valid port`);
    return Number(value);
  };
  port(env.ENVIO_PG_PORT, "ENVIO_PG_PORT");
  if (!["verify-full", "require"].includes(env.ENVIO_PG_SSL_MODE))
    throw new Error(
      "ENVIO_PG_SSL_MODE must require TLS (verify-full or require)",
    );
  for (const key of ["ENVIO_HASURA", "ENVIO_TUI"]) {
    if (env[key] && env[key] !== "false")
      throw new Error(`${key} must be false`);
    env[key] = "false";
  }
  // Envio 3.12.1 eagerly reads these even when Hasura is disabled. Never pass
  // through a real endpoint or credential for an integration we do not enable.
  env.HASURA_GRAPHQL_ENDPOINT = "http://127.0.0.1:1/v1/metadata";
  env.HASURA_GRAPHQL_ROLE = "disabled";
  env.HASURA_GRAPHQL_ADMIN_SECRET = "disabled-unused-placeholder";
  // Upstream defines only development defaults, so production must supply them.
  for (const [key, fallback] of [
    ["ENVIO_THROTTLE_CHAIN_METADATA_INTERVAL_MILLIS", "500"],
    ["ENVIO_THROTTLE_PRUNE_STALE_DATA_INTERVAL_MILLIS", "30000"],
  ]) {
    env[key] ??= fallback;
    if (
      !/^\d+$/.test(env[key]) ||
      !Number.isSafeInteger(Number(env[key])) ||
      Number(env[key]) <= 0
    ) {
      throw new Error(`${key} must be a positive integer`);
    }
  }
  for (const key of ["ENVIO_PG_PUBLIC_SCHEMA", "ENVIO_POSTGRES_PASSWORD"]) {
    if (env[key]) throw new Error(`${key} is an unsupported legacy override`);
  }
  if (env.PORT && env.ENVIO_INDEXER_PORT && env.PORT !== env.ENVIO_INDEXER_PORT)
    throw new Error("PORT and ENVIO_INDEXER_PORT must match");
  env.ENVIO_INDEXER_PORT = String(
    port(env.PORT || env.ENVIO_INDEXER_PORT || "8080", "ENVIO_INDEXER_PORT"),
  );
  env.NODE_ENV = "production";
  return {
    env,
    network,
    database: {
      host: env.ENVIO_PG_HOST,
      port: Number(env.ENVIO_PG_PORT),
      database: env.ENVIO_PG_DATABASE,
      user: env.ENVIO_PG_USER,
      password: env.ENVIO_PG_PASSWORD,
      ssl: { rejectUnauthorized: env.ENVIO_PG_SSL_MODE === "verify-full" },
      connectionTimeoutMillis: 10000,
      query_timeout: 5000,
      keepAlive: true,
      application_name: "realms-hyperindex-writer-lock",
    },
  };
}

export function validateSourceConfig(config, network) {
  const chains = config.chains;
  if (
    !Array.isArray(chains) ||
    chains.length !== 1 ||
    chains[0].id !== network.id ||
    chains[0].start_block !== network.start
  )
    throw new Error(
      "Configuration chain or start block differs from the reviewed network",
    );
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (/rpc/i.test(key))
        throw new Error("RPC sources and fallbacks are forbidden");
      walk(child);
    }
  };
  walk(config);
  if (
    config.raw_events !== false ||
    config.chains[0].hypersync_config?.url !==
      `https://${network.id}.hypersync.xyz`
  )
    throw new Error(
      "Configuration must use the reviewed HyperSync source without raw-event storage",
    );
  if (
    config.rollback_on_reorg !== true ||
    config.address_format !== "lowercase"
  )
    throw new Error(
      "Configuration must enable rollback and lowercase addresses",
    );
  if (chains[0].max_reorg_depth !== 200 || (chains[0].block_lag ?? 0) !== 0)
    throw new Error("Unexpected reorg window or block lag");
}
