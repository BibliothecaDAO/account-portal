// Explicitly opt-in disposable PostgreSQL test, never the application's DATABASE_URL.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createIndexer, defineIndexer, run } from "@apibara/indexer";
import { internalContext } from "@apibara/indexer/internal/plugins";
import { logger } from "@apibara/indexer/plugins";
import { MockClient, MockStream } from "@apibara/protocol/testing";
import { drizzle } from "drizzle-orm/node-postgres";
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import pg from "pg";

const url = new URL(process.env.BRIDGE_SHADOW_TEST_DATABASE_URL ?? "");
if (
  !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
) {
  throw new Error(
    "Use an explicitly named disposable loopback *_test database",
  );
}
process.env.APIBARA_STORAGE_SCHEMA = "airfoil_l2_bridge_mainnet";
const { drizzleStorage, useDrizzleStorage } =
  await import("@apibara/plugin-drizzle");
const admin = new pg.Client({ connectionString: url.toString() });
let worker;
let fixturesCreated = false;
await admin.connect();
try {
  await admin.query(`
    CREATE ROLE l2_bridge_shadow_test LOGIN PASSWORD 'disposable-fixture';
    REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    CREATE SCHEMA airfoil;
    CREATE FUNCTION airfoil.reorg_checkpoint() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NULL; END $$;
    CREATE TABLE airfoil.checkpoints (id text PRIMARY KEY, order_key integer);
    INSERT INTO airfoil.checkpoints VALUES ('legacy', 77);
    CREATE SCHEMA airfoil_l2_bridge_mainnet AUTHORIZATION l2_bridge_shadow_test;
  `);
  fixturesCreated = true;
  await admin.query(
    await readFile(
      new URL("../../db/sql/20260930_isolated_l2_bridge.sql", import.meta.url),
      "utf8",
    ),
  );
  await admin.query(`
    BEGIN;
    GRANT CREATE ON SCHEMA public TO l2_bridge_shadow_test;
    ALTER TABLE public.l2_bridge_requests OWNER TO l2_bridge_shadow_test;
    ALTER TABLE public.l2_bridge_events OWNER TO l2_bridge_shadow_test;
    ALTER TABLE public.l2_bridge_progress OWNER TO l2_bridge_shadow_test;
    GRANT USAGE ON SCHEMA public TO l2_bridge_shadow_test;
    REVOKE CREATE ON SCHEMA public FROM l2_bridge_shadow_test;
    COMMIT;
  `);
  const originalFunction = await admin.query(
    "SELECT prosrc FROM pg_proc JOIN pg_namespace ON pg_namespace.oid=pronamespace WHERE nspname='airfoil'",
  );
  const workerUrl = new URL(url);
  workerUrl.username = "l2_bridge_shadow_test";
  workerUrl.password = "disposable-fixture";
  worker = new pg.Client({ connectionString: workerUrl.toString() });
  await worker.connect();
  assert.equal(
    (
      await worker.query(
        "SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS allowed",
      )
    ).rows[0].allowed,
    false,
    "Worker must not retain public-schema CREATE after ownership transfer",
  );
  // No CREATE on the database and no legacy schema privilege are required.
  assert.equal(
    (
      await worker.query(
        "SELECT has_database_privilege(current_user,current_database(),'CREATE') AS allowed",
      )
    ).rows[0].allowed,
    false,
  );
  assert.equal(
    (
      await worker.query(
        "SELECT has_schema_privilege(current_user,'airfoil','USAGE') AS allowed",
      )
    ).rows[0].allowed,
    false,
  );
  const progress = pgTable("l2_bridge_progress", {
    _id: text("_id").primaryKey(),
    network: text("network").notNull(),
    source_chain: text("source_chain").notNull(),
    block_number: numeric("block_number").notNull(),
    block_hash: text("block_hash").notNull(),
    block_timestamp: timestamp("block_timestamp", {
      withTimezone: true,
    }).notNull(),
    observed_at: timestamp("observed_at", { withTimezone: true }).notNull(),
    production: text("production").notNull(),
  });
  const db = drizzle(worker, { schema: { progress } });
  const config = defineIndexer(MockStream)({
    streamUrl: "http://127.0.0.1:1",
    filter: {},
    startingCursor: { orderKey: 0n },
    finality: "accepted",
    plugins: [
      logger({
        logger: {
          log() {
            /* Quiet framework logs. */
          },
        },
      }),
      internalContext({
        indexerName: "strk-realms-bridge",
        availableIndexers: ["strk-realms-bridge"],
      }),
      drizzleStorage({
        db,
        schema: db._.schema,
        idColumn: "_id",
        persistState: true,
        indexerName: "starknet-realms-bridge-isolated-mainnet-v1",
      }),
    ],
    async transform({ endCursor }) {
      const value = {
        _id: "mainnet",
        network: "mainnet",
        source_chain: "0x534e5f4d41494e",
        block_number: endCursor.orderKey.toString(),
        block_hash: "0xaa",
        block_timestamp: new Date(),
        observed_at: new Date(),
        production: "live",
      };
      await useDrizzleStorage()
        .db.insert(progress)
        .values(value)
        .onConflictDoUpdate({ target: progress._id, set: value });
    },
  });
  const message = (height) => ({
    _tag: "data",
    data: {
      cursor: { orderKey: height - 1n },
      endCursor: { orderKey: height },
      finality: "accepted",
      production: "live",
      data: [{}],
    },
  });
  await run(
    new MockClient(() => [message(1n), message(2n)]),
    createIndexer(config),
  );
  assert.equal(
    (
      await worker.query(
        "SELECT order_key FROM airfoil_l2_bridge_mainnet.checkpoints",
      )
    ).rows[0].order_key,
    2,
  );
  // New runtime instance exercises persisted reconnect and rollback privileges.
  await run(
    new MockClient(() => [
      { _tag: "invalidate", invalidate: { cursor: { orderKey: 1n } } },
    ]),
    createIndexer(config),
  );
  assert.equal(
    (await worker.query("SELECT block_number FROM l2_bridge_progress")).rows[0]
      .block_number,
    "1",
  );
  assert.equal(
    (
      await worker.query(
        "SELECT order_key FROM airfoil_l2_bridge_mainnet.checkpoints",
      )
    ).rows[0].order_key,
    1,
  );
  await assert.rejects(
    worker.query("UPDATE airfoil.checkpoints SET order_key=0"),
    /permission denied/,
  );
  assert.deepEqual(
    (await admin.query("SELECT * FROM airfoil.checkpoints")).rows,
    [{ id: "legacy", order_key: 77 }],
  );
  assert.deepEqual(
    (
      await admin.query(
        "SELECT prosrc FROM pg_proc JOIN pg_namespace ON pg_namespace.oid=pronamespace WHERE nspname='airfoil'",
      )
    ).rows,
    originalFunction.rows,
  );
  console.log(
    "Restricted-role startup, checkpoint restart and rollback passed; legacy airfoil unchanged",
  );
} finally {
  await worker?.end();
  if (fixturesCreated) {
    await admin.query("ROLLBACK");
    await admin.query(
      "DROP OWNED BY l2_bridge_shadow_test CASCADE; DROP ROLE l2_bridge_shadow_test; DROP SCHEMA airfoil CASCADE;",
    );
  }
  await admin.end();
}
