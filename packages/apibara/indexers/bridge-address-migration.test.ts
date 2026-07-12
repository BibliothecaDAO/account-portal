import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

describe("bridge address migration", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("normalizes owners by chain and repairs legacy reversed L2 rows", async () => {
    client = new PGlite();
    await client.exec(`
      CREATE TABLE realms_bridge_requests (
        _id text PRIMARY KEY,
        from_chain text NOT NULL,
        from_address text NOT NULL,
        to_address text NOT NULL,
        tx_hash text NOT NULL
      );
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
      INSERT INTO realms_bridge_requests VALUES
        ('l1', '1', '0xabc', '0x000def', '0xl1'),
        (
          'l2-long',
          '0x534e5f4d41494e',
          '0xabc',
          '0x123456789abcdef0123456789abcdef0123456789abcdef',
          '0xl2-long'
        ),
        (
          'l2-short',
          '0x534e5f4d41494e',
          '0xabc',
          '0xdef',
          '0xl2-short'
        ),
        (
          'l2-correct',
          '0x534e5f4d41494e',
          '0xdef',
          '0xabc',
          '0xl2-correct'
        );
      INSERT INTO realms_bridge_events VALUES
        ('l2-long', '0xl2-long', 'withdraw_available_l1', '2026-01-01'),
        ('l2-short', '0xl2-short', 'withdraw_available_l1', '2026-01-01'),
        ('l2-correct', '0xl2-correct', 'deposit_initiated_l2', '2026-01-01');
    `);
    const migration = await readFile(
      new URL("../../db/migrations/0005_bridge_addresses.sql", import.meta.url),
      "utf8",
    );
    await client.exec(migration);

    const result = await client.query<{
      _id: string;
      from_address: string;
      to_address: string;
    }>(`
      SELECT _id, from_address, to_address
      FROM realms_bridge_requests
      ORDER BY _id
    `);
    expect(result.rows).toEqual([
      {
        _id: "l1",
        from_address: "0x0000000000000000000000000000000000000abc",
        to_address: "0xdef",
      },
      {
        _id: "l2-correct",
        from_address: "0xdef",
        to_address: "0x0000000000000000000000000000000000000abc",
      },
      {
        _id: "l2-long",
        from_address: "0x123456789abcdef0123456789abcdef0123456789abcdef",
        to_address: "0x0000000000000000000000000000000000000abc",
      },
      {
        _id: "l2-short",
        from_address: "0xdef",
        to_address: "0x0000000000000000000000000000000000000abc",
      },
    ]);
  });
});
