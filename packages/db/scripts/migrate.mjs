import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run database migrations");
}

const migrationsDirectory = new URL("../migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query(
    "SELECT pg_advisory_lock(hashtext('account-portal-db-migrations'))",
  );
  await client.query(`
    CREATE TABLE IF NOT EXISTS account_portal_migrations (
      name text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of migrationFiles) {
    const sql = await readFile(new URL(file, migrationsDirectory), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const result = await client.query(
      "SELECT checksum FROM account_portal_migrations WHERE name = $1",
      [file],
    );
    const appliedChecksum = result.rows[0]?.checksum;

    if (appliedChecksum && appliedChecksum !== checksum) {
      throw new Error(`Applied migration ${file} has changed`);
    }
    if (appliedChecksum) continue;

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO account_portal_migrations (name, checksum) VALUES ($1, $2)",
        [file, checksum],
      );
      await client.query("COMMIT");
      process.stdout.write(`Applied ${file}\n`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client
    .query(
      "SELECT pg_advisory_unlock(hashtext('account-portal-db-migrations'))",
    )
    .catch(() => undefined);
  await client.end();
}
