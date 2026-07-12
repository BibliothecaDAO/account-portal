import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, describe, expect, it } from "vitest";

import { velords_rewards_received } from "@realms-world/db/schema";

import { buildIndexerEventId } from "./event-identity";

describe("indexer event persistence", () => {
  let client: PGlite | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("preserves distinct same-amount events and ignores an exact replay", async () => {
    client = new PGlite();
    await client.exec(`
      CREATE TABLE velords_rewards_received (
        _id text PRIMARY KEY NOT NULL,
        sender text NOT NULL,
        amount numeric NOT NULL,
        transaction_hash text NOT NULL,
        epoch timestamp(3) NOT NULL
      )
    `);
    const database = drizzle(client);
    const timestamp = new Date("2026-01-01T00:00:00.000Z");
    const sharedEvent = {
      sender: "0x123",
      amount: "100",
      transaction_hash: "0xabc",
      timestamp,
    };

    await database
      .insert(velords_rewards_received)
      .values([
        { ...sharedEvent, _id: buildIndexerEventId("0xabc", 4) },
        { ...sharedEvent, _id: buildIndexerEventId("0xabc", 5) },
      ])
      .onConflictDoNothing();
    await database
      .insert(velords_rewards_received)
      .values({ ...sharedEvent, _id: buildIndexerEventId("0xabc", 4) })
      .onConflictDoNothing();

    const rows = await database.select().from(velords_rewards_received);
    expect(rows.map((row) => row._id).sort()).toEqual(["0xabc:4", "0xabc:5"]);
  });
});
