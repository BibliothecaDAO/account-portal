import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

import { runMigrations } from "./migrate-core.mjs";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run database migrations");
}

const migrationsDirectory = new URL("../migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const migrations = await Promise.all(
  migrationFiles.map(async (name) => ({
    name,
    sql: await readFile(new URL(name, migrationsDirectory), "utf8"),
  })),
);
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await runMigrations({
    client,
    migrations,
    onApplied: (name) => process.stdout.write(`Applied ${name}\n`),
  });
} finally {
  await client.end();
}
