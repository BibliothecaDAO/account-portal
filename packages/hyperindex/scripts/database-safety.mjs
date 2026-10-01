export async function validateDatabaseRole(client, schema) {
  const role = await client.query(
    "SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user",
  );
  if (!role.rows[0] || Object.values(role.rows[0]).some(Boolean)) {
    throw new Error(
      "Worker role must not have administrative database privileges",
    );
  }
  const ownership = await client.query(
    `SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
       AND n.nspname <> $1 AND n.nspname NOT LIKE 'pg_%'
       AND n.nspname <> 'information_schema' LIMIT 1`,
    [schema],
  );
  if (ownership.rowCount > 0) {
    throw new Error(
      "Worker role must not own objects outside its dedicated schema",
    );
  }
  // A nonempty unrecognized schema must never reach first-start initialization.
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = $1",
    [schema],
  );
  if (
    tables.rows.length &&
    !tables.rows.some((row) => row.table_name === "envio_chains")
  ) {
    throw new Error(
      "Selected schema contains objects without a HyperIndex checkpoint",
    );
  }
}
