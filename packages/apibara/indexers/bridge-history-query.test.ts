import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { expect, it } from "vitest";

import { buildBridgeHistorySnapshotQuery } from "@realms-world/db";
import { l2BridgeEvents } from "@realms-world/db/schema";

it("reads both sources, filters normalized wallets/network and rejects arbitrary schemas", async () => {
  const client = new PGlite();
  try {
    await client.exec(
      await readFile(
        new URL(
          "../../db/sql/20260930_isolated_l2_bridge.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    // Match the pinned generated entity types; the application never migrates these.
    await client.exec(`CREATE SCHEMA hyperindex_l1_mainnet;
      CREATE TABLE hyperindex_l1_mainnet."L1BridgeEvent" (LIKE l2_bridge_events INCLUDING DEFAULTS);
      ALTER TABLE hyperindex_l1_mainnet."L1BridgeEvent" RENAME COLUMN _id TO id;
      CREATE TABLE hyperindex_l1_mainnet.envio_chains (id integer, progress_block integer, progress_block_time timestamptz, source_block integer, ready_at timestamptz);
      INSERT INTO hyperindex_l1_mainnet.envio_chains VALUES (1,100,now(),100,now());`);
    const database = drizzle(client);
    const row = {
      _id: "l2",
      request_key: "request",
      network: "mainnet",
      direction: "withdrawal",
      req_hash: "1",
      owner_l1: `0x${"a".padStart(40, "0")}`,
      owner_l2: "0xb",
      token_ids: ["42"],
      payload: ["1"],
      source_chain: "starknet",
      event_name: "DepositRequestInitiated",
      type: "deposit_initiated_l2",
      block_number: "99",
      block_hash: "0xaa",
      transaction_hash: "0xbb",
      log_index: 0,
      timestamp: new Date(),
    };
    await database.insert(l2BridgeEvents).values(row);
    await client.exec(
      `INSERT INTO hyperindex_l1_mainnet."L1BridgeEvent" SELECT * FROM l2_bridge_events; UPDATE hyperindex_l1_mainnet."L1BridgeEvent" SET id='l1',source_chain='1';`,
    );
    await database
      .insert(l2BridgeEvents)
      .values({ ...row, _id: "other-network", network: "sepolia" });
    const result = await database.execute(
      buildBridgeHistorySnapshotQuery({
        network: "mainnet",
        l1Schema: "hyperindex_l1_mainnet",
        l1Account: "0x000A",
      }),
    );
    const snapshot = result.rows[0] as {
      events: { id: string; block_number: string }[];
      l1_progress: { block_number: string };
    };
    expect(snapshot.events.map((e) => e.id).sort()).toEqual(["l1", "l2"]);
    expect(
      snapshot.events.every((e) => typeof e.block_number === "string"),
    ).toBe(true);
    expect(snapshot.l1_progress.block_number).toBe("100");
    const empty = await database.execute(
      buildBridgeHistorySnapshotQuery({
        network: "mainnet",
        l1Schema: "hyperindex_l1_mainnet",
        l2Account: "0xc",
      }),
    );
    expect(empty.rows[0]?.events).toEqual([]);
    // A conflicting owner on the other chain must still reach merge validation.
    // Selecting individual wallet-matching rows would silently hide it.
    await client.query(
      `UPDATE hyperindex_l1_mainnet."L1BridgeEvent" SET owner_l1=$1, owner_l2='0xd'`,
      [`0x${"c".padStart(40, "0")}`],
    );
    await database.insert(l2BridgeEvents).values({
      ...row,
      _id: "unrelated",
      request_key: "another-request",
      owner_l1: `0x${"e".padStart(40, "0")}`,
      owner_l2: "0xf",
    });
    for (const wallet of [
      { l1Account: "0xa" },
      { l1Account: "0xc" },
      { l2Account: "0xb" },
      { l2Account: "0xd" },
    ]) {
      const conflict = await database.execute(
        buildBridgeHistorySnapshotQuery({
          network: "mainnet",
          l1Schema: "hyperindex_l1_mainnet",
          ...wallet,
        }),
      );
      const evidence = conflict.rows[0]?.events as {
        id: string;
        owner_l1: string;
      }[];
      expect(evidence.map((e) => e.id).sort()).toEqual(["l1", "l2"]);
      expect(new Set(evidence.map((e) => e.owner_l1)).size).toBe(2);
    }
    expect(() =>
      buildBridgeHistorySnapshotQuery({
        network: "mainnet",
        l1Schema: "hyperindex_l1_mainnet_rebuild20261001",
      }),
    ).not.toThrow();
    for (const schema of [
      "public",
      "hyperindex_l1_sepolia_rebuild",
      'hyperindex_l1_mainnet_x";DROP SCHEMA public;--',
      "hyperindex_l1_mainnet_a_b",
      `hyperindex_l1_mainnet_${"a".repeat(64)}`,
    ]) {
      expect(() =>
        buildBridgeHistorySnapshotQuery({
          network: "mainnet",
          l1Schema: schema,
        }),
      ).toThrow("allowlisted");
    }
    expect(() =>
      buildBridgeHistorySnapshotQuery({
        network: "mainnet",
        l1Schema: "hyperindex_l1_sepolia",
      }),
    ).toThrow("allowlisted");
  } finally {
    await client.close();
  }
}, 30_000);
