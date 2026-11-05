import type { Network } from "../config";

// Versioned DDL for one isolated generation schema. The worker never touches
// legacy Apibara, HyperIndex or shared bridge tables; readers select an
// explicit generation. Amounts, token IDs and heights are NUMERIC so nothing
// passes through JavaScript floating point.

const SCHEMA_PATTERN = /^rpc_indexer_(mainnet|sepolia)_v[1-9][0-9]*$/;

export function validateSchemaName(schema: string, network: Network): string {
  const match = SCHEMA_PATTERN.exec(schema);
  if (!match) {
    throw new Error(
      `Invalid schema name ${JSON.stringify(schema)}; expected rpc_indexer_<network>_v<n>`,
    );
  }
  if (match[1] !== network) {
    throw new Error(`Schema ${schema} does not belong to network ${network}`);
  }
  return schema;
}

const MIGRATIONS: ((schema: string) => string)[] = [
  (s) => `
CREATE TABLE ${s}.streams (
  id text PRIMARY KEY,
  network text NOT NULL,
  chain_id text NOT NULL,
  fingerprint text NOT NULL,
  start_block numeric(20, 0) NOT NULL,
  processed_height numeric(20, 0) NOT NULL,
  processed_hash text,
  processed_timestamp timestamptz,
  processed_at_head boolean NOT NULL DEFAULT false,
  head_height numeric(20, 0),
  head_seen_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  last_error_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Recent committed cursors; range reads start at one of these hashes.
CREATE TABLE ${s}.checkpoints (
  stream_id text NOT NULL REFERENCES ${s}.streams (id) ON DELETE CASCADE,
  height numeric(20, 0) NOT NULL,
  hash text NOT NULL,
  block_timestamp timestamptz NOT NULL,
  at_head boolean NOT NULL,
  PRIMARY KEY (stream_id, height)
);

-- Only event-bearing blocks get rows; deleting one cascades to its events
-- and their typed history.
CREATE TABLE ${s}.event_blocks (
  stream_id text NOT NULL REFERENCES ${s}.streams (id) ON DELETE CASCADE,
  block_number numeric(20, 0) NOT NULL,
  block_hash text NOT NULL,
  block_timestamp timestamptz NOT NULL,
  event_count integer NOT NULL,
  PRIMARY KEY (stream_id, block_number)
);

CREATE TABLE ${s}.events (
  id bigserial PRIMARY KEY,
  stream_id text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  block_hash text NOT NULL,
  transaction_hash text NOT NULL,
  transaction_index integer NOT NULL,
  event_index_in_transaction integer NOT NULL,
  from_address text NOT NULL,
  keys text[] NOT NULL,
  data text[] NOT NULL,
  kind text NOT NULL,
  FOREIGN KEY (stream_id, block_number)
    REFERENCES ${s}.event_blocks (stream_id, block_number) ON DELETE CASCADE,
  UNIQUE (stream_id, block_hash, transaction_hash, event_index_in_transaction)
);
CREATE INDEX events_stream_position
  ON ${s}.events (stream_id, block_number, transaction_index, event_index_in_transaction);

CREATE TABLE ${s}.realm_transfers (
  event_id bigint PRIMARY KEY REFERENCES ${s}.events (id) ON DELETE CASCADE,
  token_id numeric(78, 0) NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  transaction_hash text NOT NULL,
  transaction_index integer NOT NULL,
  event_index_in_transaction integer NOT NULL
);
CREATE INDEX realm_transfers_token ON ${s}.realm_transfers (token_id);

-- Current owner per token, recomputed from surviving transfers.
CREATE TABLE ${s}.realm_owners (
  token_id numeric(78, 0) PRIMARY KEY,
  owner text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  transaction_hash text NOT NULL,
  transaction_index integer NOT NULL,
  event_index_in_transaction integer NOT NULL
);
CREATE INDEX realm_owners_owner ON ${s}.realm_owners (owner);

CREATE TABLE ${s}.realms_lords_claims (
  event_id bigint PRIMARY KEY REFERENCES ${s}.events (id) ON DELETE CASCADE,
  recipient text NOT NULL,
  amount numeric(78, 0) NOT NULL,
  transaction_hash text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  block_timestamp timestamptz NOT NULL
);
CREATE INDEX realms_lords_claims_recipient
  ON ${s}.realms_lords_claims (recipient, block_timestamp);

CREATE TABLE ${s}.velords_locks (
  event_id bigint PRIMARY KEY REFERENCES ${s}.events (id) ON DELETE CASCADE,
  caller text NOT NULL,
  owner text NOT NULL,
  amount numeric(78, 0) NOT NULL,
  end_time numeric(20, 0) NOT NULL,
  transaction_hash text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  block_timestamp timestamptz NOT NULL
);
CREATE INDEX velords_locks_owner ON ${s}.velords_locks (owner, block_timestamp);

CREATE TABLE ${s}.velords_rewards (
  event_id bigint PRIMARY KEY REFERENCES ${s}.events (id) ON DELETE CASCADE,
  sender text NOT NULL,
  amount numeric(78, 0) NOT NULL,
  transaction_hash text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  block_timestamp timestamptz NOT NULL
);
CREATE INDEX velords_rewards_time ON ${s}.velords_rewards (block_timestamp);

CREATE TABLE ${s}.l2_bridge_events (
  event_id bigint PRIMARY KEY REFERENCES ${s}.events (id) ON DELETE CASCADE,
  request_key text NOT NULL,
  network text NOT NULL,
  direction text NOT NULL,
  req_hash text NOT NULL,
  owner_l1 text NOT NULL,
  owner_l2 text NOT NULL,
  token_ids text[] NOT NULL,
  payload text[] NOT NULL,
  event_name text NOT NULL,
  type text NOT NULL,
  block_number numeric(20, 0) NOT NULL,
  block_hash text NOT NULL,
  transaction_hash text NOT NULL,
  transaction_index integer NOT NULL,
  event_index_in_transaction integer NOT NULL,
  block_timestamp timestamptz NOT NULL
);
CREATE INDEX l2_bridge_events_request ON ${s}.l2_bridge_events (request_key);
CREATE INDEX l2_bridge_events_owner_l1 ON ${s}.l2_bridge_events (network, owner_l1);
CREATE INDEX l2_bridge_events_owner_l2 ON ${s}.l2_bridge_events (network, owner_l2);
`,
];

export interface Queryable {
  query<R = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: R[] }>;
}

/** Apply pending migrations in one transaction. Run before starting workers. */
export async function migrate(db: Queryable, schema: string) {
  await db.query("BEGIN");
  try {
    await db.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await db.query(
      `CREATE TABLE IF NOT EXISTS ${schema}.schema_migrations (
        version integer PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`,
    );
    // Serialize concurrent migration runs on the same schema.
    await db.query(`LOCK TABLE ${schema}.schema_migrations IN EXCLUSIVE MODE`);
    const { rows } = await db.query<{ version: number }>(
      `SELECT coalesce(max(version), 0)::int AS version FROM ${schema}.schema_migrations`,
    );
    const current = rows[0]?.version ?? 0;
    const applied: number[] = [];
    for (let version = current + 1; version <= MIGRATIONS.length; version++) {
      const migration = MIGRATIONS[version - 1] as (schema: string) => string;
      // One statement per query: extended-protocol clients reject batches.
      for (const statement of migration(schema).split(/;\s*\n/)) {
        if (statement.trim()) await db.query(statement);
      }
      await db.query(
        `INSERT INTO ${schema}.schema_migrations (version) VALUES ($1)`,
        [version],
      );
      applied.push(version);
    }
    await db.query("COMMIT");
    return applied;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export const LATEST_MIGRATION = MIGRATIONS.length;
