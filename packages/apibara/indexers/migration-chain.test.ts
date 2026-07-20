import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

import { PGLITE_TEST_TIMEOUT_MS } from "./pglite-test-timeout";

describe("database migration chain", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it(
    "provisions the complete current schema from an empty database",
    async () => {
      client = new PGlite();
      const migrationsDirectory = new URL(
        "../../db/migrations/",
        import.meta.url,
      );
      const migrationNames = (await readdir(migrationsDirectory))
        .filter((name) => name.endsWith(".sql"))
        .sort();

      for (const migrationName of migrationNames) {
        const migration = await readFile(
          new URL(migrationName, migrationsDirectory),
          "utf8",
        );
        await client.exec(migration);
      }

      const tables = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
      expect(tables.rows.map(({ table_name }) => table_name)).toEqual([
        "account",
        "delegate_profiles",
        "delegates",
        "dune_velords_burns",
        "dune_velords_supply",
        "governances",
        "rate_limit",
        "realms_bridge_events",
        "realms_bridge_requests",
        "realms_lords_claims",
        "session",
        "user",
        "velords_burner_transfers",
        "velords_lords_locked",
        "velords_rewards_received",
        "verification",
      ]);

      const eventColumns = await client.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'realms_bridge_events'
      ORDER BY ordinal_position
    `);
      expect(eventColumns.rows.map(({ column_name }) => column_name)).toEqual([
        "_id",
        "hash",
        "type",
        "timestamp",
        "_event_id",
      ]);
    },
    PGLITE_TEST_TIMEOUT_MS,
  );
});
