import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { validateDatabaseRole } from "./database-safety.mjs";
import { runtimeConfig, validateSourceConfig } from "./runtime-config.mjs";
import { acquireWriterLock, lockKey } from "./writer-lock.mjs";

const environment = {
  ENVIO_CONFIG: "config.mainnet.yaml",
  ENVIO_API_TOKEN: "test-token-not-a-real-secret",
  ENVIO_PG_HOST: "localhost",
  ENVIO_PG_PORT: "5432",
  ENVIO_PG_DATABASE: "isolated_test",
  ENVIO_PG_USER: "worker",
  ENVIO_PG_PASSWORD: "not-a-real-password",
  ENVIO_PG_SCHEMA: "hyperindex_l1_mainnet",
  ENVIO_PG_SSL_MODE: "verify-full",
  PORT: "9090",
};
test("requires secrets, isolated matching schema, TLS, and consistent port", () => {
  const valid = runtimeConfig(environment);
  assert.equal(valid.env.ENVIO_INDEXER_PORT, "9090");
  assert.equal(valid.env.ENVIO_HASURA, "false");
  assert.equal(valid.env.ENVIO_TUI, "false");
  assert.equal(valid.database.ssl.rejectUnauthorized, true);
  for (const change of [
    { ENVIO_API_TOKEN: "" },
    { ENVIO_PG_PASSWORD: "testing" },
    { ENVIO_CONFIG: "../config.yaml" },
    { ENVIO_PG_SCHEMA: "public" },
    { ENVIO_PG_SCHEMA: "hyperindex_l1_sepolia" },
    { ENVIO_PG_SSL_MODE: "prefer" },
    { ENVIO_PG_PORT: "65536" },
    { ENVIO_HASURA: "true" },
    { ENVIO_INDEXER_PORT: "8080" },
    { ENVIO_PG_PUBLIC_SCHEMA: "public" },
    { ENVIO_THROTTLE_CHAIN_METADATA_INTERVAL_MILLIS: "0" },
    { ENVIO_THROTTLE_PRUNE_STALE_DATA_INTERVAL_MILLIS: "invalid" },
  ])
    assert.throws(() => runtimeConfig({ ...environment, ...change }));
  assert.equal(
    runtimeConfig({
      ...environment,
      ENVIO_CONFIG: "config.sepolia.yaml",
      ENVIO_PG_SCHEMA: "hyperindex_l1_sepolia_rebuild2",
    }).network.id,
    11155111,
  );
});
test("production eager defaults keep disabled Hasura inert", () => {
  const { env } = runtimeConfig({
    ...environment,
    HASURA_GRAPHQL_ENDPOINT: "https://must-not-be-used.invalid/v1/metadata",
    HASURA_GRAPHQL_ADMIN_SECRET: "must-not-be-forwarded",
  });
  assert.equal(env.NODE_ENV, "production");
  assert.equal(env.ENVIO_HASURA, "false");
  assert.equal(env.HASURA_GRAPHQL_ENDPOINT, "http://127.0.0.1:1/v1/metadata");
  assert.equal(env.HASURA_GRAPHQL_ROLE, "disabled");
  assert.equal(env.HASURA_GRAPHQL_ADMIN_SECRET, "disabled-unused-placeholder");
  assert.equal(env.ENVIO_THROTTLE_CHAIN_METADATA_INTERVAL_MILLIS, "500");
  assert.equal(env.ENVIO_THROTTLE_PRUNE_STALE_DATA_INTERVAL_MILLIS, "30000");
});
test("source configuration rejects RPC, wrong network, disabled rollback", () => {
  const network = runtimeConfig(environment).network;
  const config = {
    address_format: "lowercase",
    rollback_on_reorg: true,
    raw_events: false,
    chains: [
      {
        id: 1,
        start_block: 20433152,
        max_reorg_depth: 200,
        block_lag: 0,
        hypersync_config: { url: "https://1.hypersync.xyz" },
      },
    ],
  };
  validateSourceConfig(config, network);
  assert.throws(() =>
    validateSourceConfig({ ...config, rpc_config: {} }, network),
  );
  assert.throws(() =>
    validateSourceConfig({ ...config, rollback_on_reorg: false }, network),
  );
  assert.throws(() =>
    validateSourceConfig(config, { ...network, id: 11155111 }),
  );
});

class FakeClient extends EventEmitter {
  acquired = true;
  ended = false;
  failQuery = false;
  async connect() {}
  async query(sql) {
    if (this.failQuery) throw new Error("disconnected");
    return { rows: [{ acquired: this.acquired }] };
  }
  async end() {
    this.ended = true;
    this.emit("end");
  }
}
test("lock key stable per schema, distinct across environments", () => {
  assert.equal(
    lockKey("hyperindex_l1_mainnet"),
    lockKey("hyperindex_l1_mainnet"),
  );
  assert.notEqual(
    lockKey("hyperindex_l1_mainnet"),
    lockKey("hyperindex_l1_sepolia"),
  );
});
test("refuses second writer and closes failed connection", async () => {
  const client = new FakeClient();
  client.acquired = false;
  await assert.rejects(
    acquireWriterLock(client, "schema", () => {}),
    /Another worker/,
  );
  assert.equal(client.ended, true);
});
test("session loss fails closed exactly once; intentional release does not", async () => {
  const client = new FakeClient();
  let lost = 0;
  const release = await acquireWriterLock(client, "schema", () => lost++);
  client.emit("error", new Error("lost"));
  client.emit("end");
  assert.equal(lost, 1);
  await release();
  const healthy = new FakeClient();
  await (
    await acquireWriterLock(healthy, "schema", () => lost++)
  )();
  assert.equal(lost, 1);
});
test("heartbeat failure invalidates ownership", async () => {
  const client = new FakeClient();
  let report;
  const lost = new Promise((resolve) => {
    report = resolve;
  });
  const release = await acquireWriterLock(client, "schema", report, 5);
  client.failQuery = true;
  await lost;
  await release();
});

test("database preflight refuses privileged roles, shared ownership and unknown tables without DDL", async () => {
  const client = (results) => ({
    query: async (sql) => {
      assert.match(sql, /^SELECT/);
      return results.shift();
    },
  });
  const role = {
    rows: [{ rolsuper: false, rolcreatedb: false, rolcreaterole: false }],
  };
  await assert.rejects(
    validateDatabaseRole(client([{ rows: [{ rolsuper: true }] }]), "schema"),
  );
  await assert.rejects(
    validateDatabaseRole(client([role, { rowCount: 1 }]), "schema"),
  );
  await assert.rejects(
    validateDatabaseRole(
      client([
        role,
        { rowCount: 0 },
        { rows: [{ table_name: "application_table" }] },
      ]),
      "schema",
    ),
  );
  await validateDatabaseRole(
    client([role, { rowCount: 0 }, { rows: [] }]),
    "schema",
  );
  await validateDatabaseRole(
    client([role, { rowCount: 0 }, { rows: [{ table_name: "envio_chains" }] }]),
    "schema",
  );
});
