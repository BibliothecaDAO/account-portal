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
      CREATE TABLE realms_bridge_requests (
        _id text PRIMARY KEY,
        from_chain text NOT NULL,
        token_ids integer[] NOT NULL,
        from_address text NOT NULL,
        to_address text NOT NULL,
        timestamp timestamp NOT NULL,
        tx_hash text NOT NULL,
        req_hash numeric NOT NULL
      );
      CREATE TABLE realms_bridge_events (
        _id text NOT NULL,
        hash text NOT NULL,
        type "BridgeEventType" NOT NULL,
        timestamp timestamp NOT NULL,
        CONSTRAINT realms_bridge_events__id_type_pk PRIMARY KEY (_id, type)
      );
      INSERT INTO realms_bridge_requests VALUES
        ('request-1', '1', '{1}', '0x1', '0x2', '2026-01-01', '0xaaa', 1),
        (
          '1:2:3:4:1:5:0',
          '2',
          '{5}',
          '0x2',
          '0x1',
          '2026-01-04',
          '0xddd',
          2
        ),
        (
          '{"1","2","3","4","1","5","0"}',
          '1',
          '{5}',
          '0x1',
          '0x2',
          '2026-01-03',
          '0xccc',
          2
        );
      INSERT INTO realms_bridge_events VALUES
        ('request-1', '0xaaa', 'deposit_initiated_l1', '2026-01-01'),
        ('request-1', '0xbbb', 'withdraw_completed_l2', '2026-01-02'),
        (
          '{"1","2","3","4","1","5","0"}',
          '0xccc',
          'deposit_initiated_l1',
          '2026-01-03'
        ),
        ('1:2:3:4:1:5:0', '0xddd', 'deposit_initiated_l2', '2026-01-04');
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
      { _event_id: "1:2:3:4:1:5:0:deposit_initiated_l1" },
      { _event_id: "1:2:3:4:1:5:0:deposit_initiated_l2" },
      { _event_id: "request-1:deposit_initiated_l1" },
      { _event_id: "request-1:withdraw_completed_l2" },
    ]);

    const requests = await client.query<{ _id: string; tx_hash: string }>(`
      SELECT _id, tx_hash FROM realms_bridge_requests ORDER BY _id
    `);
    expect(requests.rows).toEqual([
      { _id: "1:2:3:4:1:5:0", tx_hash: "0xccc" },
      { _id: "request-1", tx_hash: "0xaaa" },
    ]);

    const constraints = await client.query<{ conname: string }>(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'realms_bridge_events'::regclass
        AND contype IN ('p', 'u')
      ORDER BY conname
    `);
    expect(constraints.rows).toEqual([
      { conname: "realms_bridge_events_pkey" },
      { conname: "realms_bridge_events_request_type_unique" },
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
