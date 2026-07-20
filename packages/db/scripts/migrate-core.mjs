import { createHash } from "node:crypto";

export const MIGRATION_LOCK_NAME = "account-portal-db-migrations";

export function checksumMigration(sql) {
  return createHash("sha256").update(sql).digest("hex");
}

export async function runMigrations({
  client,
  migrations,
  onApplied = () => undefined,
}) {
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [
    MIGRATION_LOCK_NAME,
  ]);

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS account_portal_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const { name, sql } of migrations) {
      const checksum = checksumMigration(sql);
      const result = await client.query(
        "SELECT checksum FROM account_portal_migrations WHERE name = $1",
        [name],
      );
      const appliedChecksum = result.rows[0]?.checksum;

      if (appliedChecksum && appliedChecksum !== checksum) {
        throw new Error(`Applied migration ${name} has changed`);
      }
      if (appliedChecksum) continue;

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO account_portal_migrations (name, checksum) VALUES ($1, $2)",
          [name, checksum],
        );
        await client.query("COMMIT");
        await onApplied(name);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client
      .query("SELECT pg_advisory_unlock(hashtext($1))", [MIGRATION_LOCK_NAME])
      .catch(() => undefined);
  }
}
