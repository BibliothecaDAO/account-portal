import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { parse } from "yaml";

import { validateDatabaseRole } from "./database-safety.mjs";
import { runtimeConfig, validateSourceConfig } from "./runtime-config.mjs";
import { acquireWriterLock } from "./writer-lock.mjs";

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let child;
let stopping = false;
let failed = false;
let killTimer;
function signalGroup(signal) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}
function stop(lockLost = false) {
  failed ||= lockLost;
  if (lockLost) {
    // Once lock ownership is uncertain, do not allow a grace interval of writes.
    signalGroup("SIGKILL");
  }
  if (stopping) return;
  stopping = true;
  signalGroup("SIGTERM");
  killTimer = setTimeout(() => signalGroup("SIGKILL"), 20000);
  killTimer.unref();
}
process.on("SIGTERM", () => stop());
process.on("SIGINT", () => stop());

let release;
try {
  if (process.argv.length !== 2)
    throw new Error("Production bootstrap accepts no CLI arguments");
  const config = runtimeConfig(process.env);
  validateSourceConfig(
    parse(await readFile(resolve(cwd, config.env.ENVIO_CONFIG), "utf8")),
    config.network,
  );
  const lockClient = new pg.Client(config.database);
  release = await acquireWriterLock(
    lockClient,
    config.env.ENVIO_PG_SCHEMA,
    () => {
      console.error("Writer lock connection lost; terminating the worker");
      stop(true);
    },
  );
  await validateDatabaseRole(lockClient, config.env.ENVIO_PG_SCHEMA);
  if (!stopping) {
    const binary = resolve(dirname(require.resolve("envio")), "bin.mjs");
    child = spawn(process.execPath, [binary, "start"], {
      cwd,
      env: config.env,
      stdio: "inherit",
      detached: true,
    });
    const code = await new Promise((resolveExit, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) =>
        resolveExit(code ?? (stopping && signal === "SIGTERM" ? 0 : 1)),
      );
    });
    // Also stop any descendants before the database session can release its lock.
    signalGroup("SIGKILL");
    process.exitCode = failed ? 1 : code;
  } else process.exitCode = failed ? 1 : 0;
} catch {
  // Connection errors may embed credentials/hosts; do not dump external exceptions.
  console.error(
    "HyperIndex bootstrap failed. Check required configuration, database connectivity, and writer ownership.",
  );
  signalGroup("SIGKILL");
  process.exitCode = 1;
} finally {
  clearTimeout(killTimer);
  if (release)
    await release().catch(() => {
      process.exitCode = 1;
    });
}
