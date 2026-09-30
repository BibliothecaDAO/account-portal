import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { runtimeConfig } from "./runtime-config.mjs";

test("native CLI imports and starts in production with disabled Hasura and denied database sockets", async () => {
  const cwd = await mkdtemp(resolve(tmpdir(), "hyperindex-production-cli-"));
  const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const require = createRequire(import.meta.url);
  const binary = resolve(dirname(require.resolve("envio")), "bin.mjs");
  const { env } = runtimeConfig({
    PATH: process.env.PATH,
    ENVIO_CONFIG: "config.mainnet.yaml",
    ENVIO_API_TOKEN: "offline-placeholder-token",
    ENVIO_PG_HOST: "127.0.0.1",
    ENVIO_PG_PORT: "1",
    ENVIO_PG_DATABASE: "hyperindex_test",
    ENVIO_PG_USER: "offline",
    ENVIO_PG_PASSWORD: "offline-placeholder-password",
    ENVIO_PG_SCHEMA: "hyperindex_l1_mainnet",
    ENVIO_PG_SSL_MODE: "require",
    ENVIO_INDEXER_PORT: "9898",
    LOG_STRATEGY: "console-raw",
    DOTENV_CONFIG_PATH: resolve(cwd, "absent.env"),
  });
  try {
    // No environment files are copied. All native source endpoints are loopback;
    // Node TCP connections fail before a socket opens, independently of host policy.
    await cp(resolve(packageDir, "src"), resolve(cwd, "src"), {
      recursive: true,
    });
    await cp(
      resolve(packageDir, "schema.graphql"),
      resolve(cwd, "schema.graphql"),
    );
    await writeFile(resolve(cwd, "package.json"), '{"type":"module"}');
    await symlink(
      resolve(packageDir, "node_modules"),
      resolve(cwd, "node_modules"),
    );
    const config = (
      await readFile(resolve(packageDir, "config.mainnet.yaml"), "utf8")
    ).replace("https://1.hypersync.xyz", "http://127.0.0.1:1");
    assert.ok(!config.includes("hypersync.xyz"));
    await writeFile(resolve(cwd, "config.mainnet.yaml"), config);
    const guard = resolve(cwd, "deny-network.mjs");
    await writeFile(
      guard,
      `import net from 'node:net';
import {syncBuiltinESMExports} from 'node:module';
import {writeSync} from 'node:fs';
net.Socket.prototype.connect = function () { writeSync(2, 'OFFLINE_NETWORK_DENIED'); throw new Error('OFFLINE_NETWORK_DENIED'); };
syncBuiltinESMExports();
`,
    );
    const run = (args) =>
      spawnSync(process.execPath, ["--import", guard, binary, ...args], {
        cwd,
        env,
        encoding: "utf8",
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      });
    const help = run(["start", "--help"]);
    assert.equal(help.status, 0, help.stderr || help.stdout);
    const start = run(["start"]);
    assert.equal(
      start.status,
      1,
      `${start.error || ""}\n${start.stdout}\n${start.stderr}`,
    );
    assert.match(start.stdout + start.stderr, /OFFLINE_NETWORK_DENIED/);
    assert.doesNotMatch(
      start.stdout + start.stderr,
      /Missing environment variables|Cannot read properties of undefined/,
    );
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
