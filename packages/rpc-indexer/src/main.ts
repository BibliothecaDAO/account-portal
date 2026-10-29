// Worker entrypoint.
//   node dist/main.mjs migrate   apply schema migrations, then exit
//   node dist/main.mjs           run every Starknet group until SIGTERM

import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

import type { WorkerEnv } from "./config";
import type { PollResult } from "./stream/processor";
import { StarknetReader } from "./chains/starknet";
import {
  groupFingerprint,
  parseWorkerEnv,
  STARKNET_CHAIN_IDS,
  starknetGroups,
} from "./config";
import { JsonRpcClient } from "./rpc/json-rpc";
import { migrate, validateSchemaName } from "./store/migrations";
import {
  CursorConflictError,
  FingerprintMismatchError,
  PostgresStore,
} from "./store/store";
import { RecoveryExhaustedError, StreamProcessor } from "./stream/processor";

const MAX_BACKOFF_MS = 5 * 60_000;
const LOCK_RETRY_MS = 5_000;

function log(level: "info" | "warn" | "error", message: string, fields = {}) {
  console.log(
    JSON.stringify(
      { time: new Date().toISOString(), level, message, ...fields },
      (_key, value: unknown) =>
        typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

function describe(error: unknown) {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
}

async function connect(env: WorkerEnv) {
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  return client;
}

async function runMigrations(env: WorkerEnv, schema: string) {
  const client = await connect(env);
  try {
    const applied = await migrate(client, schema);
    log("info", "migrations applied", { schema, applied });
  } finally {
    await client.end();
  }
}

/**
 * Hold a session advisory lock on the same connection that performs every
 * write, so a second worker can never interleave commits. Must not be a
 * transaction-pooling endpoint.
 */
async function acquireWriterLock(
  client: pg.Client,
  schema: string,
  signal: AbortSignal,
) {
  for (;;) {
    const { rows } = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext($1)) AS locked",
      [`rpc-indexer:${schema}`],
    );
    if (rows[0]?.locked) return;
    log("warn", "another writer holds the lock; waiting", { schema });
    await delay(LOCK_RETRY_MS, undefined, { signal });
  }
}

async function runGroup(
  processor: StreamProcessor,
  store: PostgresStore,
  intervalMs: number,
  signal: AbortSignal,
) {
  let failures = 0;
  while (!signal.aborted) {
    let result: PollResult | undefined;
    try {
      result = await processor.poll();
      failures = 0;
      if (result.status !== "idle") {
        log("info", "poll", { stream: processor.id, ...result });
      }
    } catch (error) {
      if (
        error instanceof CursorConflictError ||
        error instanceof FingerprintMismatchError
      ) {
        throw error;
      }
      failures++;
      const message = describe(error);
      log("error", "poll failed", {
        stream: processor.id,
        failures,
        error: message,
      });
      await store.recordFailure(processor.id, message).catch(() => undefined);
      if (error instanceof RecoveryExhaustedError) {
        // Fail closed for this stream only; other groups keep running.
        log("error", "stream stopped; operator action required", {
          stream: processor.id,
        });
        return;
      }
    }

    const immediate =
      result !== undefined &&
      ((result.status === "advanced" && !result.caughtUp) ||
        result.status === "range-split" ||
        result.status === "checkpoint-orphaned" ||
        result.status === "head-moved");
    const wait =
      failures > 0
        ? Math.min(MAX_BACKOFF_MS, intervalMs * 2 ** (failures - 1))
        : immediate
          ? 0
          : intervalMs;
    if (wait > 0) {
      await delay(wait, undefined, { signal }).catch(() => undefined);
    }
  }
}

async function runWorker(env: WorkerEnv, schema: string) {
  const shutdown = new AbortController();
  const stop = (reason: string) => {
    if (shutdown.signal.aborted) return;
    log("info", "stopping", { reason });
    shutdown.abort();
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));

  const client = await connect(env);
  const session = { lost: false };
  // Losing the writer session means losing the lock: stop all writes.
  client.on("error", (error) => {
    session.lost = true;
    log("error", "database session lost", { error: describe(error) });
    stop("database session lost");
  });

  try {
    await acquireWriterLock(client, schema, shutdown.signal);
    log("info", "writer lock acquired", { schema });

    const network = env.RPC_INDEXER_NETWORK;
    const rpc = new JsonRpcClient({
      url: env.STARKNET_RPC_URL,
      label: env.STARKNET_RPC_LABEL,
      timeoutMs: env.RPC_TIMEOUT_MS,
      maxRetries: env.RPC_MAX_RETRIES,
    });
    const reader = new StarknetReader(rpc);
    const chainId = await reader.chainId();
    if (chainId !== STARKNET_CHAIN_IDS[network]) {
      throw new Error(`RPC chain ${chainId} does not match ${network}`);
    }

    const store = new PostgresStore(client, schema, network);
    const groups = starknetGroups(network, env.STARKNET_QUERY_MODE, {
      fastMs: env.STARKNET_FAST_INTERVAL_MS,
      slowMs: env.STARKNET_SLOW_INTERVAL_MS,
    });
    const loops = [];
    for (const group of groups) {
      const startBlock = group.filters.reduce(
        (min, filter) => (filter.startBlock < min ? filter.startBlock : min),
        group.filters[0]?.startBlock ?? 0n,
      );
      await store.ensureStream({
        id: group.id,
        network,
        chainId,
        fingerprint: groupFingerprint(group),
        startBlock,
      });
      const processor = new StreamProcessor(reader, store, group, {
        addressList: env.STARKNET_QUERY_MODE === "address-list",
        overlapBlocks: BigInt(env.STARKNET_OVERLAP_BLOCKS),
        initialRangeBlocks: BigInt(env.STARKNET_INITIAL_RANGE_BLOCKS),
        maxRangeBlocks: BigInt(env.STARKNET_MAX_RANGE_BLOCKS),
        chunkSize: env.STARKNET_CHUNK_SIZE,
        maxPages: env.STARKNET_MAX_PAGES,
      });
      log("info", "stream started", {
        stream: group.id,
        filters: group.filters.map((filter) => filter.id),
        intervalMs: group.intervalMs,
      });
      loops.push(
        runGroup(processor, store, group.intervalMs, shutdown.signal).catch(
          (error: unknown) => {
            log("error", "fatal stream error", {
              stream: group.id,
              error: describe(error),
            });
            process.exitCode = 1;
            stop("fatal stream error");
          },
        ),
      );
    }
    await Promise.all(loops);
  } finally {
    if (!session.lost) {
      await client
        .query("SELECT pg_advisory_unlock_all()")
        .catch(() => undefined);
    }
    await client.end().catch(() => undefined);
    if (session.lost) process.exitCode = 1;
    log("info", "stopped");
  }
}

async function main() {
  const env = parseWorkerEnv(process.env);
  const schema = validateSchemaName(
    env.RPC_INDEXER_SCHEMA,
    env.RPC_INDEXER_NETWORK,
  );
  const command = process.argv[2] ?? "run";
  if (command === "migrate") return runMigrations(env, schema);
  if (command === "run") return runWorker(env, schema);
  throw new Error(`Unknown command ${command}; expected "migrate" or "run"`);
}

main().catch((error: unknown) => {
  log("error", "fatal", { error: describe(error) });
  process.exitCode = 1;
});
