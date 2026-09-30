import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { acquireWriterLock } from "./writer-lock.mjs";

// Deliberately uses its own opt-in variable, never ENVIO_PG_* or the app database.
const connectionString = process.env.HYPERINDEX_TEST_DATABASE_URL;
test(
  "PostgreSQL session exclusion, backend loss, reacquisition, and durable state",
  { skip: !connectionString },
  async () => {
    const url = new URL(connectionString);
    assert.ok(
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
      "Tests require local disposable PostgreSQL",
    );
    assert.match(
      url.pathname,
      /^\/hyperindex_test(?:_[a-z0-9]+)?$/,
      "Tests require a dedicated hyperindex_test database",
    );
    const { default: pg } = await import("pg");
    const options = {
      connectionString,
      query_timeout: 1000,
      connectionTimeoutMillis: 3000,
    };
    const admin = new pg.Client(options);
    const writer = new pg.Client(options);
    const schema = `runtime_test_${randomUUID().replaceAll("-", "")}`;
    let release;
    let replacement;
    let reportLost;
    const lost = new Promise((resolve) => {
      reportLost = resolve;
    });
    try {
      await admin.connect();
      release = await acquireWriterLock(writer, schema, reportLost, 25);
      await assert.rejects(
        acquireWriterLock(new pg.Client(options), schema, () => {}),
        /Another worker/,
      );
      await writer.query(`CREATE SCHEMA ${schema}`);
      await writer.query(
        `CREATE TABLE ${schema}.durable_probe (height bigint PRIMARY KEY)`,
      );
      await writer.query(
        `INSERT INTO ${schema}.durable_probe VALUES (20433152)`,
      );
      const pid = (await writer.query("SELECT pg_backend_pid() AS pid")).rows[0]
        .pid;
      await admin.query("SELECT pg_terminate_backend($1)", [pid]);
      await Promise.race([
        lost,
        new Promise((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error("Lock loss not detected")),
            2000,
          );
          timer.unref();
        }),
      ]);
      const next = new pg.Client(options);
      replacement = await acquireWriterLock(next, schema, () => {});
      assert.equal(
        (await next.query(`SELECT height FROM ${schema}.durable_probe`)).rows[0]
          .height,
        "20433152",
      );
    } finally {
      if (replacement) await replacement();
      if (release) await release().catch(() => {});
      await admin
        .query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`)
        .catch(() => {});
      await admin.end();
    }
  },
);
