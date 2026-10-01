import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = dirname(fileURLToPath(import.meta.url));
for (const network of ["mainnet", "sepolia"]) {
  await new Promise((resolveCheck, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--import",
        resolve(cwd, "offline-network-guard.mjs"),
        resolve(cwd, ".apibara/build/start.mjs"),
        "start",
        "--help",
      ],
      {
        cwd,
        stdio: "inherit",
        timeout: 15_000,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://offline:offline@127.0.0.1:1/offline",
          VITE_PUBLIC_CHAIN: network,
          APIBARA_BRIDGE_STORAGE: "isolated",
          APIBARA_STORAGE_SCHEMA: `airfoil_l2_bridge_${network}`,
          DNA_TOKEN: "offline-fixture",
        },
      },
    );
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolveCheck()
        : reject(new Error("Built Apibara runtime did not load")),
    );
  });
}
console.log(
  "Isolated bridge runtime imports on both networks without network access",
);
