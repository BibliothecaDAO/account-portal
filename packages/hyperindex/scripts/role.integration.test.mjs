// Opt-in, disposable database only: test the pinned framework with a restricted role.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import { validateDatabaseRole } from "./database-safety.mjs";

const databaseUrl = process.env.HYPERINDEX_TEST_DATABASE_URL;
test(
  "restricted worker first-start grants, application isolation and restart",
  { skip: !databaseUrl },
  async () => {
    const url = new URL(databaseUrl);
    assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
    assert.match(url.pathname, /^\/hyperindex_test(?:_[a-z0-9]+)?$/);
    process.env.ENVIO_CONFIG = "config.mainnet.yaml";
    process.env.ENVIO_HASURA = "false";
    const Config = await import("envio/src/Config.res.mjs");
    const PgStorage = await import("envio/src/PgStorage.res.mjs");
    const ChainMap = await import("envio/src/ChainMap.res.mjs");
    const Persistence = await import("envio/src/Persistence.res.mjs");
    const { default: pg } = await import("pg");
    const postgres = createRequire(import.meta.resolve("envio"))("postgres");
    const suffix = `${process.pid}_${Date.now()}`;
    const role = `worker_test_${suffix}`;
    const schema = `hyperindex_role_test_${suffix}`;
    const application = `application_test_${suffix}`;
    const database = url.pathname.slice(1);
    const admin = postgres(databaseUrl, { max: 1 });
    const workerUrl = new URL(url);
    workerUrl.username = role;
    workerUrl.password = "disposable-worker-password";
    let worker;
    let preflight;
    const config = Config.load();
    const makeStorage = () =>
      PgStorage.make(
        worker,
        url.hostname,
        schema,
        Number(url.port || 5432),
        role,
        database,
        workerUrl.password,
        false,
        config.chainIdMode,
        config.ecosystem.name,
      );
    try {
      await admin.unsafe(
        `CREATE ROLE "${role}" LOGIN PASSWORD 'disposable-worker-password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`,
      );
      await admin.unsafe(
        `GRANT CONNECT ON DATABASE "${database}" TO "${role}"`,
      );
      await admin.unsafe(
        `CREATE SCHEMA "${application}"; CREATE TABLE "${application}".sentinel (id integer PRIMARY KEY); INSERT INTO "${application}".sentinel VALUES (1); CREATE SCHEMA "${schema}" AUTHORIZATION "${role}"`,
      );
      worker = postgres(workerUrl.toString(), { max: 1 });
      const initialize = async () => {
        const storage = makeStorage();
        const persistence = Persistence.make(
          config.userEntities,
          config.allEnums,
          storage,
        );
        return storage.initialize(
          ChainMap.values(config.chainMap),
          persistence.allEntities,
          persistence.allEnums,
          config.contractMapping,
          Config.stripSensitiveData(Config.getPublicConfigJson()),
        );
      };
      // Even a precreated empty schema is dropped/recreated by the native transaction.
      await assert.rejects(initialize(), (error) => error.code === "42501");
      await admin.unsafe(`GRANT CREATE ON DATABASE "${database}" TO "${role}"`);
      await initialize();
      const [privilege] = await admin.unsafe(
        `SELECT EXISTS (SELECT 1 FROM pg_namespace n, aclexplode(n.nspacl) a WHERE n.nspname = '${schema}' AND a.grantee = 0 AND a.privilege_type = 'CREATE') AS granted`,
      );
      assert.equal(
        privilege.granted,
        true,
        "Pinned native initialization grants PUBLIC schema CREATE",
      );
      await admin.unsafe(
        `REVOKE CREATE ON DATABASE "${database}" FROM "${role}"; REVOKE ALL ON SCHEMA "${schema}" FROM PUBLIC`,
      );
      preflight = new pg.Client({ connectionString: workerUrl.toString() });
      await preflight.connect();
      await validateDatabaseRole(preflight, schema);
      await assert.rejects(
        worker.unsafe(`INSERT INTO "${application}".sentinel VALUES (2)`),
        (error) => error.code === "42501",
      );
      await assert.rejects(
        worker.unsafe(`DROP TABLE "${application}".sentinel`),
        (error) => error.code === "42501",
      );
      await assert.rejects(
        worker.unsafe(`CREATE TABLE "${application}".intrusion (id int)`),
        (error) => error.code === "42501",
      );
      await assert.rejects(
        worker.unsafe(`CREATE SCHEMA unexpected_${suffix}`),
        (error) => error.code === "42501",
      );
      await worker.end();
      worker = postgres(workerUrl.toString(), { max: 1 });
      const restarted = makeStorage();
      const resumed = await restarted.resumeInitialState(
        config.userEntities,
        [1],
        () => {},
      );
      assert.equal(resumed.chains.length, 1);
      const block = ChainMap.values(config.chainMap)[0].startBlock;
      await restarted.writeBatch(
        {
          totalBatchSize: 0,
          items: [],
          history: { 1: true },
          progressedChainsById: {
            1: {
              fetchState: { chainId: 1 },
              progressBlockNumber: block,
              progressBlockTime: 1720000000,
              sourceBlockNumber: block,
              totalEventsProcessed: 0,
            },
          },
          checkpointIds: [1n],
          checkpointChainIds: [1],
          checkpointBlockNumbers: [block],
          checkpointBlockHashes: ["0xabc"],
          checkpointItemsCount: [0],
          checkpointEventsProcessed: [0],
          registeredAddresses: [],
        },
        undefined,
        config,
        config.userEntities,
        [],
        [],
        [],
        undefined,
        () => {},
      );
      assert.equal(
        Number(
          (
            await worker.unsafe(
              `SELECT progress_block FROM "${schema}".envio_chains`,
            )
          )[0].progress_block,
        ),
        block,
      );
      assert.equal(
        (
          await admin.unsafe(
            `SELECT EXISTS (SELECT 1 FROM pg_namespace n, aclexplode(n.nspacl) a WHERE n.nspname = '${schema}' AND a.grantee = 0 AND a.privilege_type = 'CREATE') AS granted`,
          )
        )[0].granted,
        false,
      );
      assert.equal(
        (
          await admin.unsafe(
            `SELECT count(*)::int AS count FROM "${application}".sentinel`,
          )
        )[0].count,
        1,
      );
    } finally {
      if (preflight) await preflight.end();
      if (worker) await worker.end();
      await admin.unsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE; DROP SCHEMA IF EXISTS "${application}" CASCADE; DROP OWNED BY "${role}"; DROP ROLE IF EXISTS "${role}"`,
      );
      await admin.end();
    }
  },
);
