import { readFile } from "node:fs/promises";
import type { Client } from "@apibara/protocol";
import { createIndexer as instantiateIndexer, run } from "@apibara/indexer";
import { internalContext } from "@apibara/indexer/internal/plugins";
import { logger } from "@apibara/indexer/plugins";
import { MockClient } from "@apibara/protocol/testing";
import { getSelector } from "@apibara/starknet";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, expect, it, vi } from "vitest";

import {
  l2BridgeEvents,
  l2BridgeProgress,
  l2BridgeRequests,
} from "@realms-world/db/schema";

let client: PGlite | undefined;
afterEach(async () => {
  await client?.close();
  vi.unstubAllEnvs();
});

it("isolates L2 rollback, restores progress, and replays a replacement branch without duplicates", async () => {
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://test:test@localhost:5432/realms_test",
  );
  vi.stubEnv("VITE_PUBLIC_CHAIN", "mainnet");
  vi.stubEnv("APIBARA_STORAGE_SCHEMA", "airfoil_l2_bridge_mainnet");
  const { createIndexer } = await import("./strk-realms-bridge.indexer");
  client = new PGlite();
  await client.exec(
    await readFile(
      new URL("../../db/sql/20260930_isolated_l2_bridge.sql", import.meta.url),
      "utf8",
    ),
  );
  await client.exec(
    "CREATE TABLE legacy_evidence (id text); INSERT INTO legacy_evidence VALUES ('untouched'); CREATE SCHEMA hyperindex_l1_mainnet; CREATE TABLE hyperindex_l1_mainnet.evidence (id text); INSERT INTO hyperindex_l1_mainnet.evidence VALUES ('l1');",
  );
  await client.exec(`
    CREATE SCHEMA airfoil_l2_bridge_mainnet;
    CREATE SCHEMA airfoil;
    CREATE FUNCTION airfoil.reorg_checkpoint() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NULL; END $$;
    CREATE TABLE airfoil.checkpoints (id text PRIMARY KEY, order_key integer, unique_key text);
    INSERT INTO airfoil.checkpoints VALUES ('legacy-worker', 123, '0xabc');
    CREATE TABLE airfoil.schema_version (k integer PRIMARY KEY, version integer);
    INSERT INTO airfoil.schema_version VALUES (0, 99);
  `);
  const legacyObjects = await client.query(
    "SELECT relname FROM pg_class JOIN pg_namespace ON pg_namespace.oid=relnamespace WHERE nspname='airfoil' ORDER BY relname",
  );
  const legacyFunction = await client.query(
    "SELECT prosrc FROM pg_proc JOIN pg_namespace ON pg_namespace.oid=pronamespace WHERE nspname='airfoil'",
  );
  const database = drizzle(client, {
    schema: { l2BridgeEvents, l2BridgeRequests, l2BridgeProgress },
  });
  const config = createIndexer({ database, storage: "isolated" });
  expect(config.startingCursor?.orderKey).toBe(664161n);
  expect(config.filter.header).toBe("on_data_or_on_new_block");
  const event = (tx: string, index: number) => ({
    keys: [getSelector("DepositRequestInitiated"), "0x1", "0x0", "0x1"],
    data: ["0x1", "0x0", "0xa", "0xb", "0x1", "0x2a", "0x0"],
    transactionHash: tx,
    eventIndex: index,
  });
  const data = (height: bigint, hash: string, events: unknown[]) => ({
    _tag: "data",
    data: {
      cursor: { orderKey: height - 1n },
      endCursor: { orderKey: height, uniqueKey: hash },
      finality: "accepted",
      production: "live",
      data: [
        {
          header: {
            blockNumber: height,
            blockHash: hash,
            timestamp: new Date(),
          },
          events,
        },
      ],
    },
  });
  const execute = async (messages: unknown[]) => {
    const indexer = instantiateIndexer({
      ...config,
      plugins: [
        logger({
          logger: {
            log() {
              /* Keep runtime test output quiet. */
            },
          },
        }),
        internalContext({
          indexerName: "bridge-test",
          availableIndexers: ["bridge-test"],
        }),
        ...(config.plugins ?? []),
      ],
    });
    await run(
      new MockClient(() => messages as never) as Client<
        typeof config.filter,
        Parameters<typeof config.transform>[0]["block"]
      >,
      indexer,
    );
  };
  await execute([
    data(664162n, "0x100", []),
    data(664163n, "0x101", [event("0xabc", 0), event("0xabc", 1)]),
  ]);
  expect(await database.select().from(l2BridgeEvents)).toHaveLength(2);
  expect(await database.select().from(l2BridgeRequests)).toHaveLength(1);
  // Restart and process the protocol invalidation through the real plugin.
  await execute([
    {
      _tag: "invalidate",
      invalidate: { cursor: { orderKey: 664162n, uniqueKey: "0x100" } },
    },
  ]);
  expect(await database.select().from(l2BridgeEvents)).toEqual([]);
  expect(await database.select().from(l2BridgeRequests)).toEqual([]);
  expect(await database.select().from(l2BridgeProgress)).toMatchObject([
    { block_number: "664162", production: "live" },
  ]);
  await execute([
    data(664163n, "0x102", [event("0xdef", 0)]),
    data(664164n, "0x103", []),
  ]);
  expect(await database.select().from(l2BridgeEvents)).toMatchObject([
    { transaction_hash: "0xdef", direction: "withdrawal", token_ids: ["42"] },
  ]);
  expect(await database.select().from(l2BridgeProgress)).toMatchObject([
    { block_number: "664164" },
  ]);
  const pending = data(664165n, "0x0", [event("0xaaa", 0)]);
  pending.data.finality = "pending";
  // The actual DNA pending header has no block hash.
  delete (pending.data.data[0].header as { blockHash?: string }).blockHash;
  await execute([pending, data(664165n, "0x104", [event("0xbbb", 0)])]);
  const afterPending = await database.select().from(l2BridgeEvents);
  expect(afterPending.map((e) => e.transaction_hash).sort()).toEqual([
    "0xbbb",
    "0xdef",
  ]);
  expect(afterPending.some((e) => e._id.startsWith("pending:"))).toBe(false);
  const malformed = event("0xccc", 1);
  malformed.data = [];
  await expect(
    execute([data(664166n, "0x105", [event("0xccc", 0), malformed])]),
  ).rejects.toThrow();
  expect(await database.select().from(l2BridgeEvents)).toHaveLength(2);
  expect(await database.select().from(l2BridgeProgress)).toMatchObject([
    { block_number: "664165" },
  ]);
  expect(
    (await client.query("SELECT * FROM airfoil.checkpoints")).rows,
  ).toEqual([{ id: "legacy-worker", order_key: 123, unique_key: "0xabc" }]);
  expect(
    (await client.query("SELECT * FROM airfoil.schema_version")).rows,
  ).toEqual([{ k: 0, version: 99 }]);
  expect(
    await client.query(
      "SELECT relname FROM pg_class JOIN pg_namespace ON pg_namespace.oid=relnamespace WHERE nspname='airfoil' ORDER BY relname",
    ),
  ).toEqual(legacyObjects);
  expect(
    await client.query(
      "SELECT prosrc FROM pg_proc JOIN pg_namespace ON pg_namespace.oid=pronamespace WHERE nspname='airfoil'",
    ),
  ).toEqual(legacyFunction);
  expect(
    (
      await client.query(
        "SELECT order_key FROM airfoil_l2_bridge_mainnet.checkpoints",
      )
    ).rows,
  ).toEqual([{ order_key: 664165 }]);
  expect((await client.query("SELECT * FROM legacy_evidence")).rows).toEqual([
    { id: "untouched" },
  ]);
  expect(
    (await client.query("SELECT * FROM hyperindex_l1_mainnet.evidence")).rows,
  ).toEqual([{ id: "l1" }]);
}, 30_000);
