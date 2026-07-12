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
        to_address text NOT NULL
      );
      INSERT INTO realms_bridge_requests VALUES
        ('l1', '1', '0xabc', '0x000def'),
        (
          'l2',
          '0x534e5f4d41494e',
          '0xabc',
          '0x123456789abcdef0123456789abcdef0123456789abcdef'
        );
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
        _id: "l2",
        from_address: "0x123456789abcdef0123456789abcdef0123456789abcdef",
        to_address: "0x0000000000000000000000000000000000000abc",
      },
    ]);
  });
});
