# @realms-world/rpc-indexer

Direct JSON-RPC replacement for the Apibara indexers. The design, phases and
acceptance gates are in
[the migration plan](../../docs/direct-rpc-indexer-migration-plan.md).

The package holds the capability probe and the Starknet worker (Phases 0–2).
The worker writes only to its own generation schema; no portal reader uses it
yet.

| Path                       | Contents                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/rpc/json-rpc.ts`      | JSON-RPC transport: deadlines, bounded retries with jitter, throttling inside HTTP 200, URL-free errors                    |
| `src/chains/starknet.ts`   | Starknet v0.10 reader: hash-pinned ranges, verified pagination, explicit transaction-local positions, typed failures       |
| `src/decoders/starknet.ts` | Pure decoders for `Transfer`, `RewardClaimed`, `ModifyLock`, `RewardReceived` and both bridge request events               |
| `src/decoders/legacy.ts`   | The value formats the current Apibara tables use (padded felts for claims and veLORDS, unpadded owners), for parity checks |
| `src/config.ts`            | Network manifest, inclusive start blocks, Starknet grouping, env schemas, filter/decoder fingerprint                       |
| `src/store/`               | Versioned migrations and the PostgreSQL store: atomic commits with an expected cursor, reorg repair, owner recomputation   |
| `src/stream/processor.ts`  | One polling group: hash-pinned reads, overlap reread and repair, orphaned-checkpoint recovery, adaptive backfill ranges    |
| `src/main.ts`              | `migrate` and `run` commands, session advisory writer lock, one loop per group, backoff, graceful `SIGTERM`                |
| `scripts/probe.ts`         | Bounded, read-only capability probe                                                                                        |

## How the worker reads

Each poll reads the head, then queries events from a stored checkpoint hash
to the head hash. A reorged checkpoint fails the query; the worker drops it
and retries from an older one. After a commit made at the head, the next poll
rereads at least `STARKNET_OVERLAP_BLOCKS` below the cursor and compares
stored events in both directions; any difference is repaired in the same
transaction that advances the cursor, and Realm owners are recomputed from the
surviving transfers. If no canonical checkpoint is left in the retained
window, the stream stops and reports the error rather than guessing a fork
point. Decoder failures block their stream without advancing it.

Tables in the generation schema: `streams` (progress and errors per group),
`checkpoints`, `event_blocks`, `events`, `realm_transfers`, `realm_owners`,
`realms_lords_claims`, `velords_locks`, `velords_rewards`, `l2_bridge_events`.
Addresses are stored as unpadded lowercase hex; use `src/decoders/legacy.ts`
when a reader needs the old padded format.

## Deploying to Railway (shadow)

Create one new service from this repository. Keep the existing Apibara
services running; nothing reads this schema yet.

| Setting        | Value                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| Root directory | repository root                                                                       |
| Build command  | `pnpm install --frozen-lockfile && pnpm --filter @realms-world/rpc-indexer build`     |
| Start command  | `node --enable-source-maps packages/rpc-indexer/dist/main.mjs`                        |
| Replicas       | 1, with no deploy overlap (a second worker waits on the lock, but overlap wastes RPC) |

Variables:

| Variable              | Value                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `RPC_INDEXER_NETWORK` | `mainnet` or `sepolia` (required; there is no default)                                   |
| `RPC_INDEXER_SCHEMA`  | `rpc_indexer_mainnet_v1` (must match the network)                                        |
| `DATABASE_URL`        | A direct, session-capable Postgres URL, not a transaction pooler                         |
| `STARKNET_RPC_URL`    | Alchemy Starknet `v0_10` URL                                                             |
| `STARKNET_RPC_LABEL`  | Optional non-secret name for logs, e.g. `alchemy-starknet`                               |
| `STARKNET_QUERY_MODE` | `individual` (default) until the probe's `addressListParity` passes, then `address-list` |

Optional tuning: `STARKNET_FAST_INTERVAL_MS` (30000), `STARKNET_SLOW_INTERVAL_MS`
(300000, individual mode only), `STARKNET_OVERLAP_BLOCKS` (64),
`STARKNET_INITIAL_RANGE_BLOCKS` (10000), `STARKNET_MAX_RANGE_BLOCKS` (500000),
`STARKNET_CHUNK_SIZE` (1000), `STARKNET_MAX_PAGES` (20), `RPC_TIMEOUT_MS`,
`RPC_MAX_RETRIES`.

Before the first start, run the migration once with the same variables, for
example as a Railway one-off command or locally:

```sh
node packages/rpc-indexer/dist/main.mjs migrate
```

The database role needs `CREATE` on the database for the migration; the
running worker only needs DML on the generation schema. Changing filters,
start blocks or decoders changes the stream fingerprint, and the worker
refuses to start until you choose a new schema generation.

Watch progress with:

```sql
SELECT id, processed_height, processed_at_head, head_height, last_success_at, last_error
FROM rpc_indexer_mainnet_v1.streams;
```

Logs are one JSON line per non-idle poll. Backfill from block 664,162 runs
without waiting between ranges and then settles into the polling interval.

## Not built yet

- Finality tracking and the finalized-history rollback guard (the retained
  checkpoint window currently bounds automatic repair).
- Reader adapters and source selection in the portal, and the parity tools.
- Kill/restart subprocess tests at transaction boundaries.
- The Ethereum group.

## Capability probe

The probe checks spec version, chain ID, accepted and `l1_accepted` heads,
block cadence, whether a query pinned to an unknown block hash fails, real
event positions for every filter (checked against the transaction receipt),
pagination, address-list parity and whether the endpoint caps block ranges.
It stops after `PROBE_MAX_CALLS` attempts (default 250) and prints JSON
without the endpoint URL.

```sh
pnpm --filter @realms-world/rpc-indexer build
RPC_INDEXER_NETWORK=mainnet STARKNET_RPC_URL=<alchemy v0_10 url> \
  pnpm --filter @realms-world/rpc-indexer probe
```

Record the results in the plan's Phase 0 section. They decide the Starknet
query mode (`address-list` or `individual`), and therefore the grouping, and
whether the hash-pinned read cycle can be used.

## Development

```sh
pnpm --filter @realms-world/rpc-indexer test
pnpm --filter @realms-world/rpc-indexer typecheck
pnpm --filter @realms-world/rpc-indexer lint
```

No Ekubo source has been copied. If any is adapted later, add its MIT notice
and pinned revision in `THIRD_PARTY_NOTICES.md`.
