import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

describe("bridge event identity migration", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("gives each request lifecycle row an independent rollback identity", async () => {
    client = new PGlite();
    await client.exec(`
      CREATE TYPE "BridgeEventType" AS ENUM (
        'deposit_initiated_l1',
        'deposit_initiated_l2',
        'withdraw_available_l1',
        'withdraw_completed_l1',
        'withdraw_completed_l2'
      );
      CREATE TABLE realms_bridge_events (
        _id text NOT NULL,
        hash text NOT NULL,
        type "BridgeEventType" NOT NULL,
        timestamp timestamp NOT NULL,
        PRIMARY KEY (_id, type)
      );
      INSERT INTO realms_bridge_events VALUES
        ('request-1', '0xaaa', 'deposit_initiated_l1', '2026-01-01'),
        ('request-1', '0xbbb', 'withdraw_completed_l2', '2026-01-02');
    `);

    const migration = await readFile(
      new URL(
        "../../db/migrations/0006_bridge_event_identity.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await client.exec(migration);

    const migrated = await client.query<{ _event_id: string }>(`
      SELECT _event_id
      FROM realms_bridge_events
      ORDER BY _event_id
    `);
    expect(migrated.rows).toEqual([
      { _event_id: "request-1:deposit_initiated_l1" },
      { _event_id: "request-1:withdraw_completed_l2" },
    ]);

    await expect(
      client.exec(`
        INSERT INTO realms_bridge_events
          (_event_id, _id, hash, type, timestamp)
        VALUES
          ('another-id', 'request-1', '0xccc', 'deposit_initiated_l1', '2026-01-03')
      `),
    ).rejects.toThrow();
  });
});
