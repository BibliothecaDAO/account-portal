import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SHADOW_INDEXER, shadowRuntimeConfig } from "./runtime-config.mjs";

// Use the CLI's compiled standalone entry directly. The pinned outer `apibara
// start` command does not propagate its child exit status or termination signal.
// This runs exactly the same start implementation and authenticated DNA client.
try {
  if (process.argv.length !== 2)
    throw new Error("Shadow bootstrap accepts no CLI arguments");
  const env = shadowRuntimeConfig(process.env);
  const cwd = dirname(fileURLToPath(import.meta.url));
  const child = spawn(
    process.execPath,
    [
      resolve(cwd, ".apibara/build/start.mjs"),
      "start",
      "--indexer",
      SHADOW_INDEXER,
    ],
    {
      cwd,
      env,
      stdio: "inherit",
      detached: true,
    },
  );
  let stopping = false;
  let killTimer;
  const signal = (value) => {
    if (!child.pid) return;
    try {
      process.kill(-child.pid, value);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  const stop = () => {
    if (stopping) return;
    stopping = true;
    signal("SIGTERM");
    killTimer = setTimeout(() => signal("SIGKILL"), 20_000);
    killTimer.unref();
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  child.once("error", () => {
    console.error("Bridge shadow runtime could not start");
    process.exitCode = 1;
  });
  child.once("exit", (code, terminationSignal) => {
    clearTimeout(killTimer);
    // A live stream ending without operator shutdown must restart too.
    process.exitCode =
      stopping && (code === 0 || terminationSignal === "SIGTERM")
        ? 0
        : code || 1;
  });
} catch (error) {
  // Validation messages contain variable names, never their secret values.
  console.error(error.message);
  process.exitCode = 1;
}
