import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

describe("event identity migration", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("preserves legacy rows and installs replay-safe primary keys", async () => {
    client = new PGlite();
    await client.exec(`
      CREATE TABLE realms_lords_claims (
        _id text,
        hash text NOT NULL,
        amount numeric NOT NULL,
        recipient text NOT NULL,
        timestamp timestamp NOT NULL,
        PRIMARY KEY (amount, hash)
      );
      CREATE TABLE velords_rewards_received (
        sender text NOT NULL,
        amount numeric NOT NULL,
        transaction_hash text NOT NULL,
        epoch timestamp(3) NOT NULL,
        PRIMARY KEY (amount, transaction_hash)
      );
      CREATE TABLE velords_lords_locked (
        owner text NOT NULL,
        amount numeric NOT NULL,
        transaction_hash text NOT NULL,
        epoch timestamp(3) NOT NULL,
        end_time integer,
        PRIMARY KEY (amount, transaction_hash)
      );
      CREATE TABLE velords_burner_transfers (
        sender text NOT NULL,
        amount numeric NOT NULL,
        transaction_hash text NOT NULL,
        timestamp timestamp(3) NOT NULL,
        PRIMARY KEY (amount, transaction_hash)
      );
      INSERT INTO realms_lords_claims VALUES
        ('0xclaim', '0xclaim', 10, '0x1', '2026-01-01');
      INSERT INTO velords_rewards_received VALUES
        ('0x1', 10, '0xreward', '2026-01-01');
      INSERT INTO velords_lords_locked VALUES
        ('0x1', 10, '0xlock', '2026-01-01', 42);
      INSERT INTO velords_burner_transfers VALUES
        ('0x1', 10, '0xburn', '2026-01-01');
    `);

    const migration = await readFile(
      new URL("../../db/migrations/0001_event_identity.sql", import.meta.url),
      "utf8",
    );
    await client.exec(migration);

    const migrated = await client.query<{ _id: string }>(
      "SELECT _id FROM velords_rewards_received",
    );
    expect(migrated.rows).toEqual([{ _id: "0xreward:legacy:10" }]);

    await client.exec(`
      INSERT INTO velords_rewards_received
        (_id, sender, amount, transaction_hash, epoch)
      VALUES
        ('0xreward:4', '0x1', 10, '0xreward', '2026-01-01'),
        ('0xreward:5', '0x1', 10, '0xreward', '2026-01-01');
    `);
    const count = await client.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM velords_rewards_received",
    );
    expect(count.rows[0]?.count).toBe("3");
  });
});
