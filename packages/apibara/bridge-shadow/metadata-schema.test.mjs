import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const shared = resolve(
  dirname(require.resolve("@apibara/plugin-drizzle")),
  "shared",
);
const original = process.env.APIBARA_STORAGE_SCHEMA;
for (const extension of [".mjs", ".cjs"]) {
  test(`pinned ${extension} metadata selector preserves legacy and rejects arbitrary SQL identifiers`, async () => {
    const file = readdirSync(shared).find((name) => name.endsWith(extension));
    assert.ok(file);
    const path = resolve(shared, file);
    let counter = 0;
    async function load(value) {
      if (value === undefined) delete process.env.APIBARA_STORAGE_SCHEMA;
      else process.env.APIBARA_STORAGE_SCHEMA = value;
      if (extension === ".cjs") {
        delete require.cache[require.resolve(path)];
        return require(path).SCHEMA_NAME;
      }
      const module = await import(
        `${pathToFileURL(path).href}?schema-test=${counter++}`
      );
      return module.S;
    }
    try {
      assert.equal(await load(undefined), "airfoil");
      for (const network of ["mainnet", "sepolia"]) {
        assert.equal(
          await load(`airfoil_l2_bridge_${network}`),
          `airfoil_l2_bridge_${network}`,
        );
      }
      for (const value of [
        "airfoil",
        "",
        "public",
        "airfoil_l2_bridge_mainnet;DROP SCHEMA public",
        "airfoil_l2_bridge_other",
      ]) {
        await assert.rejects(load(value), /Invalid APIBARA_STORAGE_SCHEMA/);
      }
    } finally {
      if (original === undefined) delete process.env.APIBARA_STORAGE_SCHEMA;
      else process.env.APIBARA_STORAGE_SCHEMA = original;
    }
  });
}
