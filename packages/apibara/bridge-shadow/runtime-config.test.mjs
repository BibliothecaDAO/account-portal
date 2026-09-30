import assert from "node:assert/strict";
import { test } from "node:test";

import { SHADOW_INDEXER, shadowRuntimeConfig } from "./runtime-config.mjs";

const env = {
  APIBARA_BRIDGE_STORAGE: "isolated",
  VITE_PUBLIC_CHAIN: "mainnet",
  DATABASE_URL: "postgresql://fixture:fixture@localhost/shadow",
  DNA_TOKEN: "fixture-token",
};
test("retains database/token for the single isolated runtime on either network", () => {
  assert.equal(SHADOW_INDEXER, "strk-realms-bridge");
  for (const network of ["mainnet", "sepolia"]) {
    const output = shadowRuntimeConfig({ ...env, VITE_PUBLIC_CHAIN: network });
    assert.equal(output.DATABASE_URL, env.DATABASE_URL);
    assert.equal(output.DNA_TOKEN, env.DNA_TOKEN);
    assert.equal(output.APIBARA_BRIDGE_STORAGE, "isolated");
    assert.equal(output.APIBARA_ALWAYS_REINDEX, "false");
    assert.equal(output.APIBARA_STORAGE_SCHEMA, `airfoil_l2_bridge_${network}`);
    assert.equal(output.NODE_ENV, "production");
  }
});
test("rejects legacy/missing storage, unsupported networks and absent credentials", () => {
  for (const patch of [
    { APIBARA_BRIDGE_STORAGE: undefined },
    { APIBARA_BRIDGE_STORAGE: "legacy" },
    { VITE_PUBLIC_CHAIN: "local" },
    { VITE_PUBLIC_CHAIN: undefined },
    { APIBARA_ALWAYS_REINDEX: "true" },
    { APIBARA_STORAGE_SCHEMA: "airfoil" },
    { APIBARA_STORAGE_SCHEMA: "airfoil_l2_bridge_sepolia" },
    { APIBARA_STORAGE_SCHEMA: "injected; DROP SCHEMA public" },
    { DNA_TOKEN: " " },
    { DATABASE_URL: undefined },
    { DATABASE_URL: "https://example.com/database" },
  ])
    assert.throws(() => shadowRuntimeConfig({ ...env, ...patch }));
});
