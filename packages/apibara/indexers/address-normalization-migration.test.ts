import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, describe, expect, it } from "vitest";

import { PGLITE_TEST_TIMEOUT_MS } from "./pglite-test-timeout";

describe("Starknet address normalization migration", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it(
    "converts legacy decimal and padded hex values to normalized hex",
    async () => {
      client = new PGlite();
      await client.exec(`
      CREATE TABLE realms_lords_claims (recipient text NOT NULL);
      CREATE TABLE velords_rewards_received (sender text NOT NULL);
      CREATE TABLE velords_lords_locked (owner text NOT NULL);
      CREATE TABLE velords_burner_transfers (sender text NOT NULL);
      INSERT INTO realms_lords_claims VALUES ('2748');
      INSERT INTO velords_rewards_received VALUES ('0x000ABC');
      INSERT INTO velords_lords_locked VALUES ('2748');
      INSERT INTO velords_burner_transfers VALUES ('2748');
    `);
      const migration = await readFile(
        new URL(
          "../../db/migrations/0004_normalize_starknet_addresses.sql",
          import.meta.url,
        ),
        "utf8",
      );
      await client.exec(migration);

      const values = await client.query<{ address: string }>(`
      SELECT recipient AS address FROM realms_lords_claims
      UNION ALL SELECT sender FROM velords_rewards_received
      UNION ALL SELECT owner FROM velords_lords_locked
      UNION ALL SELECT sender FROM velords_burner_transfers
    `);
      expect(values.rows).toEqual([
        { address: "0xabc" },
        { address: "0xabc" },
        { address: "0xabc" },
        { address: "0xabc" },
      ]);
    },
    PGLITE_TEST_TIMEOUT_MS,
  );
});
