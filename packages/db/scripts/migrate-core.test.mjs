import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  checksumMigration,
  MIGRATION_LOCK_NAME,
  runMigrations,
} from "./migrate-core.mjs";

function createClient({ appliedChecksum, failSql = false } = {}) {
  const calls = [];
  return {
    calls,
    query: async (text, values) => {
      calls.push({ text, values });
      if (text.startsWith("SELECT checksum")) {
        return {
          rows: appliedChecksum ? [{ checksum: appliedChecksum }] : [],
        };
      }
      if (failSql && text === "SELECT 1") {
        throw new Error("migration failed");
      }
      return { rows: [] };
    },
  };
}

describe("runMigrations", () => {
  it("locks, applies each new migration transactionally, and unlocks", async () => {
    const client = createClient();
    const applied = [];

    await runMigrations({
      client,
      migrations: [{ name: "0001_test.sql", sql: "SELECT 1" }],
      onApplied: (name) => applied.push(name),
    });

    assert.deepEqual(applied, ["0001_test.sql"]);
    assert.equal(client.calls[0].text, "SELECT pg_advisory_lock(hashtext($1))");
    assert.deepEqual(client.calls[0].values, [MIGRATION_LOCK_NAME]);
    assert.ok(client.calls.some(({ text }) => text === "BEGIN"));
    assert.ok(client.calls.some(({ text }) => text === "SELECT 1"));
    assert.ok(client.calls.some(({ text }) => text === "COMMIT"));
    assert.equal(
      client.calls.at(-1).text,
      "SELECT pg_advisory_unlock(hashtext($1))",
    );
  });

  it("refuses a changed migration checksum and still unlocks", async () => {
    const client = createClient({ appliedChecksum: "old-checksum" });

    await assert.rejects(
      runMigrations({
        client,
        migrations: [{ name: "0001_test.sql", sql: "SELECT 1" }],
      }),
      /has changed/,
    );

    assert.ok(!client.calls.some(({ text }) => text === "BEGIN"));
    assert.equal(
      client.calls.at(-1).text,
      "SELECT pg_advisory_unlock(hashtext($1))",
    );
  });

  it("rolls back a failed migration before releasing the lock", async () => {
    const client = createClient({ failSql: true });

    await assert.rejects(
      runMigrations({
        client,
        migrations: [{ name: "0001_test.sql", sql: "SELECT 1" }],
      }),
      /migration failed/,
    );

    assert.ok(client.calls.some(({ text }) => text === "ROLLBACK"));
    assert.equal(
      client.calls.at(-1).text,
      "SELECT pg_advisory_unlock(hashtext($1))",
    );
  });
});

describe("checksumMigration", () => {
  it("returns a stable SHA-256 checksum", () => {
    assert.equal(
      checksumMigration("SELECT 1"),
      "e004ebd5b5532a4b85984a62f8ad48a81aa3460c1ca07701f386135d72cdecf5",
    );
  });
});
