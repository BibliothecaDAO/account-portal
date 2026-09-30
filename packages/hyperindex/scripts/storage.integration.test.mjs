// Opt-in persistence integration against disposable localhost PostgreSQL only.
// Uses pinned Envio 3.12.1 internals: tests durable rollback SQL, not source fork detection.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const databaseUrl = process.env.HYPERINDEX_TEST_DATABASE_URL;
test(
  "Envio PostgreSQL checkpoints, rollback, empty progress and storage reopen",
  { skip: !databaseUrl },
  async () => {
    const url = new URL(databaseUrl);
    assert.ok(
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
      "Only disposable loopback databases allowed",
    );
    assert.match(
      url.pathname,
      /^\/hyperindex_test(?:_[a-z0-9]+)?$/,
      "Only dedicated hyperindex_test databases allowed",
    );
    process.env.ENVIO_CONFIG = "config.mainnet.yaml";
    process.env.ENVIO_HASURA = "false";
    const Config = await import("envio/src/Config.res.mjs");
    const PgStorage = await import("envio/src/PgStorage.res.mjs");
    const ChainMap = await import("envio/src/ChainMap.res.mjs");
    const Persistence = await import("envio/src/Persistence.res.mjs");
    const RollbackFloors = await import("envio/src/db/RollbackFloors.res.mjs");
    const requireEnvio = createRequire(import.meta.resolve("envio"));
    const postgres = requireEnvio("postgres");
    const config = Config.load();
    const schema = `hyperindex_storage_test_${process.pid}_${Date.now()}`;
    const sibling = `${schema}_l2`;
    let sql = postgres(databaseUrl, { max: 2 });
    let storage;
    const open = () =>
      PgStorage.make(
        sql,
        url.hostname,
        schema,
        Number(url.port || 5432),
        decodeURIComponent(url.username),
        url.pathname.slice(1),
        decodeURIComponent(url.password),
        false,
        config.chainIdMode,
        config.ecosystem.name,
      );
    try {
      await sql.unsafe(
        `CREATE SCHEMA "${sibling}"; CREATE TABLE "${sibling}".evidence (id text PRIMARY KEY); INSERT INTO "${sibling}".evidence VALUES ('l2')`,
      );
      storage = open();
      const persistence = Persistence.make(
        config.userEntities,
        config.allEnums,
        storage,
      );
      const info = Config.stripSensitiveData(Config.getPublicConfigJson());
      await storage.initialize(
        ChainMap.values(config.chainMap),
        persistence.allEntities,
        persistence.allEnums,
        config.contractMapping,
        info,
      );
      const entityConfig = config.userEntities[0];
      const start = ChainMap.values(config.chainMap)[0].startBlock;
      const entity = (id, block) => ({
        id,
        request_key: "test-request",
        network: "mainnet",
        direction: "deposit",
        req_hash: "12",
        owner_l1: "0x123",
        owner_l2: "0x456",
        token_ids: ["42"],
        payload: ["12", "0", "291", "1110", "1", "42", "0"],
        source_chain: "1",
        event_name: "LogMessageToL2",
        type: "deposit_initiated_l1",
        block_number: BigInt(block),
        block_hash: `0x${id}`,
        transaction_hash: "0xabc",
        log_index: 0,
        timestamp: new Date(1720000000000),
      });
      const progress = (block, events) => ({
        fetchState: { chainId: 1 },
        progressBlockNumber: block,
        progressBlockTime: 1720000000 + block - start,
        sourceBlockNumber: block,
        totalEventsProcessed: events,
      });
      const batch = (checkpoint, block, events) => ({
        totalBatchSize: events,
        items: [],
        progressedChainsById: { 1: progress(block, events) },
        history: { 1: true },
        checkpointIds: [checkpoint],
        checkpointChainIds: [1],
        checkpointBlockNumbers: [block],
        checkpointBlockHashes: [`0x${block.toString(16)}`],
        checkpointItemsCount: [events],
        checkpointEventsProcessed: [events],
        registeredAddresses: [],
      });
      const updates = (changes) => [
        { entityConfig, scope: "crossChain", shouldSaveHistory: true, changes },
      ];
      const set = (value, checkpointId) => ({
        type: "SET",
        entityId: value.id,
        entity: value,
        checkpointId,
      });
      await storage.writeBatch(
        batch(1n, start, 1),
        undefined,
        config,
        config.userEntities,
        [],
        updates([set(entity("a", start), 1n)]),
        [],
        undefined,
        () => {},
      );
      await storage.writeBatch(
        batch(2n, start + 1, 1),
        undefined,
        config,
        config.userEntities,
        [],
        updates([set(entity("b", start + 1), 2n)]),
        [],
        undefined,
        () => {},
      );
      assert.equal(
        (await sql.unsafe(`SELECT * FROM "${schema}"."L1BridgeEvent"`)).length,
        2,
      );
      const target = await storage.getRollbackTargetCheckpoint(1, start);
      assert.equal(target, 1n);
      const floors = RollbackFloors.make(
        config.checkpointSequence,
        [1],
        1,
        target,
        start,
      );
      const [removals, restores] = await storage.getRollbackData(
        entityConfig,
        floors,
      );
      assert.deepEqual(
        removals.map((r) => r.entityId),
        ["b"],
      );
      assert.deepEqual(restores, []);
      const rollback = {
        floors,
        diffFrontier: { 1: 3n },
        diffCheckpoints: [],
        rolledBackAddresses: [],
        progressedChains: [{ chainId: 1, ...progress(start, 1) }],
      };
      const empty = {
        ...batch(3n, start, 0),
        checkpointIds: [],
        checkpointChainIds: [],
        checkpointBlockNumbers: [],
        checkpointBlockHashes: [],
        checkpointItemsCount: [],
        checkpointEventsProcessed: [],
        progressedChainsById: {},
      };
      await storage.writeBatch(
        empty,
        rollback,
        config,
        config.userEntities,
        [],
        updates(
          removals.map((r) => ({
            type: "DELETE",
            entityId: r.entityId,
            checkpointId: 3n,
          })),
        ),
        [],
        undefined,
        () => {},
      );
      assert.deepEqual(
        (
          await sql.unsafe(
            `SELECT id FROM "${schema}"."L1BridgeEvent" ORDER BY id`,
          )
        ).map((r) => r.id),
        ["a"],
      );
      await storage.writeBatch(
        batch(4n, start + 1, 1),
        undefined,
        config,
        config.userEntities,
        [],
        updates([set(entity("c", start + 1), 4n)]),
        [],
        undefined,
        () => {},
      );
      await storage.writeBatch(
        batch(5n, start + 2, 0),
        undefined,
        config,
        config.userEntities,
        [],
        [],
        [],
        undefined,
        () => {},
      );
      const [chain] = await sql.unsafe(
        `SELECT progress_block, progress_block_time FROM "${schema}".envio_chains`,
      );
      assert.equal(Number(chain.progress_block), start + 2);
      assert.equal(chain.progress_block_time.getTime(), 1720000002000);
      await storage.close();
      sql = postgres(databaseUrl, { max: 2 });
      storage = open();
      const resumed = await storage.resumeInitialState(
        config.userEntities,
        [1],
        () => {},
      );
      assert.equal(resumed.chains[0].progressBlockNumber, start + 2);
      assert.deepEqual(
        (
          await sql.unsafe(
            `SELECT id FROM "${schema}"."L1BridgeEvent" ORDER BY id`,
          )
        ).map((r) => r.id),
        ["a", "c"],
      );
      assert.deepEqual(
        (await sql.unsafe(`SELECT id FROM "${sibling}".evidence`)).map(
          (r) => r.id,
        ),
        ["l2"],
      );
    } finally {
      await sql.unsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE; DROP SCHEMA IF EXISTS "${sibling}" CASCADE`,
      );
      await sql.end();
    }
  },
);
