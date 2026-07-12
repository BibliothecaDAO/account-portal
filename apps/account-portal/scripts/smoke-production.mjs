import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const appDirectory = fileURLToPath(new URL("../", import.meta.url));
const port = 32_000 + (process.pid % 1_000);
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  cwd: appDirectory,
  env: {
    ...process.env,
    ACCOUNT_PORTAL_PRODUCTION_SMOKE_TEST: "true",
    BETTER_AUTH_SECRET: "smoke-test-secret-with-at-least-32-characters",
    HOST: "127.0.0.1",
    PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
const appendOutput = (chunk) => {
  output = `${output}${String(chunk)}`.slice(-8_000);
};
server.stdout.on("data", appendOutput);
server.stderr.on("data", appendOutput);

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForHealth() {
  const deadline = Date.now() + 15_000;
  let lastError;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited early\n${output}`);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      const body = await response.text();
      if (!response.ok) {
        await delay(100);
        throw new Error(
          `Health check returned ${response.status}: ${body}\n${output}`,
        );
      }

      const health = JSON.parse(body);
      if (health.status !== "ok") {
        throw new Error(`Unexpected health response: ${body}`);
      }
      return health;
    } catch (error) {
      if (error instanceof Error && !error.message.startsWith("fetch failed")) {
        throw error;
      }
      lastError = error;
      await delay(100);
    }
  }

  throw new Error(
    `Production server did not become healthy: ${String(lastError)}\n${output}`,
  );
}

try {
  const health = await waitForHealth();
  const rootResponse = await fetch(`http://127.0.0.1:${port}/`);
  const rootBody = await rootResponse.text();
  if (!rootResponse.ok || !rootBody.includes("<html")) {
    throw new Error(
      `Root route returned ${rootResponse.status}: ${rootBody.slice(0, 500)}\n${output}`,
    );
  }
  process.stdout.write(
    `Production smoke test passed: ${JSON.stringify(health)}\n`,
  );
} finally {
  server.kill("SIGTERM");
  await Promise.race([once(server, "exit"), delay(5_000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
}
