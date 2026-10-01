# Isolated Starknet bridge bootstrap

`20260930_isolated_l2_bridge.sql` creates only the new application-owned L2
request, physical-event and progress tables. Apply it once with a PostgreSQL
client to an isolated test database first, then apply the reviewed SQL to the
intended application database before starting the isolated replay. It is
transactional and deliberately fails if the tables already exist. Never use
HyperIndex reset or development commands against the shared database.

Set `APIBARA_BRIDGE_STORAGE=isolated` on the Starknet bridge worker to use these
tables and the distinct `starknet-realms-bridge-isolated-<network>-v1` checkpoint
identity. The default `legacy` target remains unchanged. Mainnet and Sepolia
replay from the original cursors. Run one isolated bridge writer per database;
mainnet and Sepolia must use separate databases. The pinned Apibara plugin uses
table-wide rollback triggers, so network columns and different checkpoint names
do not establish safe concurrent writes to the same L2 tables. Legacy and isolated
workers may coexist because they own different tables. Other
Starknet indexers do not change storage targets.

All three tables participate in the Apibara Drizzle rollback transaction. Every
block header updates progress, including empty bridge-event blocks. `production`
is DNA's reported live/backfill state; `observed_at` records processing time and
`block_timestamp` records chain time. Pending headers without hashes have
explicit temporary `pending:<height>` provenance and IDs; the framework rolls
back their evidence before replacing that batch.

`buildBridgeHistorySnapshotQuery` reads both isolated sources plus progress in
one database snapshot. It permits `hyperindex_l1_mainnet` for mainnet and
`hyperindex_l1_sepolia` for Sepolia, optionally followed by one underscore and a
lowercase alphanumeric rebuild suffix (maximum total length 63). Set the
server-only `BRIDGE_HISTORY_L1_SCHEMA` to the validated replacement schema after
replay acceptance; omission selects the network's base schema. Cross-network
names and arbitrary SQL identifiers are rejected. These external schemas are never included in
Drizzle DDL. Its `envio_chains.progress_block_time` is a chain timestamp, **not**
a worker heartbeat. Readers must reject old chain timestamps, source lag and
missing readiness rather than treating `/healthz` or the latest matching bridge
event as proof of freshness.

The PGlite integration tests in `packages/apibara/indexers` run the real Apibara
runtime and rollback plugin against this SQL. They cover restart/invalidation,
pending replacement, transactional failure and quiet-block progress, and ensure
L1/legacy evidence survives L2 rollback. Mainnet live replay and the restricted PostgreSQL 15 role were subsequently
verified in the [deployment acceptance record](../../../docs/l1-hyperindex-railway-migration-plan.md#deployed-shadow-acceptance--30-september-2026).

## Railway isolated L2 shadow worker

Build from repository root using `packages/apibara/Dockerfile.bridge-shadow`.
`packages/apibara/railway-settings.json` records the flat settings to apply
directly through Railway service settings or `serviceInstanceUpdate`; it is not
an automatically loaded config-as-code file. Set
`RAILWAY_DOCKERFILE_PATH=packages/apibara/Dockerfile.bridge-shadow` and the matching
service Dockerfile path. New legacy config-as-code linkage was rejected by the
deployment API; do not register this file as a Railway config path or pass
`builder: DOCKERFILE` to GraphQL. See [Railway infrastructure as code](https://docs.railway.com/infrastructure-as-code).
Use a Railway CLI upload from repository root; no GitHub automatic deployment or
project-wide infrastructure management is configured. This is a separate worker
service from HyperIndex. The image
uses Node 22 as a non-root user and builds only the `strk-realms-bridge` entrypoint
through the dedicated `packages/apibara/bridge-shadow` Apibara project. No other
Starknet worker or legacy L1 indexer starts. No migration, reset, seed or table
cleanup command runs during build or startup.

Required service variables:

- `APIBARA_BRIDGE_STORAGE=isolated` (the image default; startup rejects overrides).
- `VITE_PUBLIC_CHAIN=mainnet` or `sepolia`.
- `DATABASE_URL`: the existing Neon-compatible application database for that
  network. It must contain the reviewed L2 bootstrap tables and retain Apibara's
  persisted checkpoints. This worker still uses the application's Neon pool;
  do not point it at arbitrary Railway PostgreSQL without a separate client
  migration. A filesystem volume is not required for checkpoints.
- `DNA_TOKEN`: a service secret. The pinned Apibara runtime calls
  `createAuthenticatedClient`, and pinned `@apibara/protocol` reads this variable
  to send `Authorization: Bearer ...` on DNA requests. The launcher preserves
  this environment value; it never prints it.

The bootstrap runs the compiled standalone Apibara `start --indexer
strk-realms-bridge` entrypoint directly. The pinned outer `apibara start` CLI
spawns that entry but does not propagate child failure status or termination
signals. Our launcher forwards SIGTERM/SIGINT to the worker process group,
allows 20 seconds before SIGKILL, and preserves nonzero exits for Railway
restart handling. Ordinary database transactions provide crash rollback.

**Stop before start is mandatory for replacement deployments.** Disable
automatic deploys for this shadow service. Stop the existing deployment and
verify the worker has terminated before starting its replacement. One replica
and `overlapSeconds=0` are configured, but they do not prove writer exclusion
during rollout; the pinned Apibara plugin has no process-lifetime writer lock.
Never start a second isolated bridge worker against these same L2 tables.
Keep the same database and checkpoint identity on restart. Mainnet and Sepolia
need separate databases, as noted above. Legacy workers can continue against
their legacy tables throughout shadow replay.

This worker has no HTTP health endpoint. Process liveness is not indexing
freshness: monitor `l2_bridge_progress` production mode, observed time and chain
time, including ranges with no matching bridge events. The portal remains on
`BRIDGE_HISTORY_SOURCE=legacy` until replay and acceptance checks pass.

Offline validation (no credentials or remote connections):

```sh
pnpm --filter @realms-world/apibara exec apibara build --dir bridge-shadow
pnpm --filter @realms-world/apibara test:shadow
node packages/apibara/bridge-shadow/check-runtime.mjs
```

The import smoke check uses dummy credentials and installs a network-denying
preload before loading the built native Node entrypoint for both networks.

### Isolated Apibara metadata and role permissions

The version-pinned pnpm patch at
`patches/@apibara__plugin-drizzle@2.1.0-beta.53.patch` adds
`APIBARA_STORAGE_SCHEMA` to the plugin's ESM, CommonJS and source implementations.
When absent, legacy workers retain the original `airfoil` behavior. The only
allowed explicit values are `airfoil_l2_bridge_mainnet` and
`airfoil_l2_bridge_sepolia`; invalid identifiers fail before any SQL runs. The
shadow launcher selects the value for `VITE_PUBLIC_CHAIN` and rejects overrides
that do not match. It also rejects destructive `APIBARA_ALWAYS_REINDEX=true`.

For the explicit namespaces, the metadata schema **must already exist**. The
patch skips `CREATE SCHEMA IF NOT EXISTS` for these schemas: PostgreSQL otherwise
requires database-level CREATE even when that schema is already owned by the
worker. Startup still creates/maintains only its own metadata tables and
`reorg_checkpoint()` function. The shared legacy `airfoil` objects are untouched.
The namespace is selected at module initialization, so never multiplex networks
inside one process.

After applying the L2 table SQL, provision a restricted worker role and execute
the following as an administrator (replace role/database names as appropriate;
set its login credential separately through the secret-provisioning workflow):

```sql
BEGIN;
CREATE SCHEMA airfoil_l2_bridge_mainnet AUTHORIZATION l2_bridge_shadow;
GRANT CONNECT ON DATABASE your_database TO l2_bridge_shadow;
GRANT USAGE, CREATE ON SCHEMA public TO l2_bridge_shadow;
ALTER TABLE public.l2_bridge_requests OWNER TO l2_bridge_shadow;
ALTER TABLE public.l2_bridge_events OWNER TO l2_bridge_shadow;
ALTER TABLE public.l2_bridge_progress OWNER TO l2_bridge_shadow;
REVOKE CREATE ON SCHEMA public FROM l2_bridge_shadow;
GRANT SELECT ON public.l2_bridge_requests, public.l2_bridge_events,
  public.l2_bridge_progress TO portal_reader;
COMMIT;
```

With a non-superuser provisioning administrator, PostgreSQL requires the new
owner to have `CREATE` on the containing schema for `ALTER TABLE ... OWNER`.
The recipe grants this permission temporarily and revokes it in the **same
transaction before commit**; never leave public-schema CREATE as a worker runtime
grant. The administrator must also be authorized to transfer ownership to the new
role. Audit effective PUBLIC grants: revoking the direct grant does not cancel a
CREATE privilege inherited from PUBLIC.

Use the Sepolia namespace for its separate database. The worker owns the new
L2 tables because the plugin creates and drops rollback triggers every batch;
ordinary DML grants alone cannot authorize DROP TRIGGER. The metadata schema
ownership lets the worker create its own tables, sequences, indexes and function.
It needs no database CREATE, no ownership/membership/grants on legacy `airfoil`,
no write grants on other application tables and no access to HyperIndex schemas.
Audit effective PUBLIC/inherited permissions as well as direct grants. The portal
reader needs SELECT on the new L2 tables plus the HyperIndex read objects.

The local PostgreSQL role integration test is opt-in, uses only an explicitly
supplied loopback `BRIDGE_SHADOW_TEST_DATABASE_URL` ending in `_test`, and proves
startup/checkpoint/restart/rollback without database CREATE or access to legacy
`airfoil`. It intentionally does not use `DATABASE_URL`. Run it only against a
fresh disposable database:

```sh
node packages/apibara/bridge-shadow/metadata-role.integration.mjs
```

Any Apibara plugin upgrade requires reviewing/rebasing this patch, testing both
ESM and CommonJS selectors, rerunning the actual rollback/legacy-isolation tests,
and rebuilding the worker. Do not remove the patch or change metadata namespace
on a running deployment: either would point at a different checkpoint history.
Docker's root context includes `patches/`, and frozen pnpm installation verifies
the registered patch hash before building.

The deployed mainnet metadata namespace is `airfoil_l2_bridge_mainnet`. Its Railway service is `Starknet Realms Bridge Shadow` (`3d127746-c4a5-4e03-8693-9573e333b8ec`) in RW_Indexer/main. A stop-before-start redeployment passed with unchanged event counts and live progress restored. Check `deploymentStopped`, not historical deployment `status` alone, when confirming shutdown. The existing legacy bridge worker remains separate and unchanged.
