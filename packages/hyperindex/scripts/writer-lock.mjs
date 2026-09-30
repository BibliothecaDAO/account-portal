import { createHash } from "node:crypto";

export function lockKey(schema) {
  // Advisory locks are already scoped to the connected PostgreSQL database.
  return createHash("sha256")
    .update(`realms-hyperindex:${schema}`)
    .digest()
    .readBigInt64BE()
    .toString();
}

export async function acquireWriterLock(
  client,
  schema,
  onLost,
  intervalMs = 2000,
) {
  let closing = false;
  let lost = false;
  let pending = false;
  let timer;
  const fail = () => {
    if (closing || lost) return;
    lost = true;
    clearInterval(timer);
    onLost();
  };
  client.on("error", fail);
  client.on("end", fail);
  try {
    await client.connect();
    const result = await client.query(
      "SELECT pg_try_advisory_lock($1::bigint) AS acquired",
      [lockKey(schema)],
    );
    if (!result.rows[0]?.acquired)
      throw new Error("Another worker owns this database and schema");
    if (lost)
      throw new Error("Writer lock connection was lost during acquisition");
    timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        await client.query("SELECT 1");
      } catch {
        fail();
      } finally {
        pending = false;
      }
    }, intervalMs);
    return async () => {
      closing = true;
      clearInterval(timer);
      await client.end();
    };
  } catch (error) {
    closing = true;
    clearInterval(timer);
    await client.end().catch(() => {});
    throw error;
  }
}
