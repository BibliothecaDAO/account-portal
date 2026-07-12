import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

describe("auth rate-limit migration", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("creates the database-backed Better Auth rate-limit model", async () => {
    client = new PGlite();
    const migration = await readFile(
      new URL("../../db/migrations/0002_auth_rate_limit.sql", import.meta.url),
      "utf8",
    );
    await client.exec(migration);

    await client.query(
      `INSERT INTO rate_limit (id, key, count, last_request)
       VALUES ($1, $2, $3, $4)`,
      ["rate-1", "ip:127.0.0.1", 1, 1_700_000_000_000],
    );
    const result = await client.query<{
      key: string;
      count: number;
      last_request: string;
    }>("SELECT key, count, last_request::text FROM rate_limit");

    expect(result.rows).toEqual([
      {
        key: "ip:127.0.0.1",
        count: 1,
        last_request: "1700000000000",
      },
    ]);
  });

  it("makes SIWS nonce replacement atomic by enforcing one verification per identifier", async () => {
    client = new PGlite();
    await client.exec(`
      CREATE TABLE verification (
        id text PRIMARY KEY,
        identifier text NOT NULL,
        value text NOT NULL,
        expires_at timestamp NOT NULL,
        created_at timestamp,
        updated_at timestamp
      );
      INSERT INTO verification VALUES
        ('old', 'siws_0xabc', 'old', '2026-01-01', '2025-01-01', '2025-01-01'),
        ('new', 'siws_0xabc', 'new', '2026-01-02', '2025-01-02', '2025-01-02');
    `);
    const migration = await readFile(
      new URL(
        "../../db/migrations/0003_verification_identifier.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await client.exec(migration);

    const records = await client.query<{ id: string }>(
      "SELECT id FROM verification",
    );
    expect(records.rows).toEqual([{ id: "new" }]);
    await expect(
      client.exec(`
        INSERT INTO verification
          (id, identifier, value, expires_at)
        VALUES ('duplicate', 'siws_0xabc', 'duplicate', '2026-01-03')
      `),
    ).rejects.toThrow();
  });
});
