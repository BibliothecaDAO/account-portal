# Realms L1 worker on Railway

This service uses Envio **3.12.1**, Node **22.18.0**, pnpm **10.30.3**, and HyperSync **Free**. It indexes only Ethereum messaging events for the Realms bridge. Starknet remains on Apibara. Keep `BRIDGE_HISTORY_SOURCE=legacy` until the migration acceptance gates pass. Local tests, live samples and the completed mainnet Railway shadow rollout are recorded below. The portal still uses its existing reader; the short observation window does not establish sustained Free capacity.

## Build and start

Build from the **repository root**:

```sh
docker build -f packages/hyperindex/Dockerfile -t realms-hyperindex .
pnpm --filter @realms-world/hyperindex codegen
pnpm --filter @realms-world/hyperindex typecheck
node --test packages/hyperindex/scripts/*.test.mjs
pnpm --filter @realms-world/hyperindex start
```

In Railway, keep the root directory at the repository root. `packages/hyperindex/railway-settings.json` records the flat service settings to apply directly through Railway service settings or `serviceInstanceUpdate`; it is a reviewed reference file, not an automatically loaded config-as-code file. Set `RAILWAY_DOCKERFILE_PATH=packages/hyperindex/Dockerfile` and the matching service Dockerfile path. The deployment API rejected new legacy config-as-code linkage, so do not register this JSON as a Railway config path or send a `builder: DOCKERFILE` GraphQL value. See [Railway infrastructure as code](https://docs.railway.com/infrastructure-as-code) for the platform transition. Deploy with a Railway CLI upload from the repository root; this setup does not establish GitHub automatic deployments or manage other project services. Do not expose a public service domain: the indexer's HTTP endpoint also exposes operational information. Railway injects `PORT`; bootstrap copies it to `ENVIO_INDEXER_PORT` and rejects conflicting values. A single replica and zero configured deployment overlap are defense in depth; the database lock is the writer gate. A replacement can fail while its predecessor holds the lock and should retry after the old deployment drains.

The image runs as the `node` user. Dependencies, source, configs and writable generated output remain in the image because `envio start` performs code generation. PostgreSQL stores checkpoints, entity history and rollback state; no data volume is required. Do not add a pre-deploy migration command. The bootstrap runs only `envio start`, never restart/reset/development commands. Native startup initializes an empty schema or resumes a compatible existing schema; incompatible configuration must fail and be reviewed.

The image retains the monorepo workspace rather than using `pnpm deploy`. Shared bridge/constants packages export TypeScript, which the pinned Envio handler loader imports through its `tsx/esm` hook. The build generates both network configs, typechecks, and runs `scripts/check-handler-loading.mjs` offline through that same loader to catch missing workspace exports or esbuild binaries. Do not replace this with bare Node imports or a pruned copy of the package without verifying startup code generation and handler loading again.

## Required Railway variables

| Variable                                              | Value                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `ENVIO_CONFIG`                                        | `config.mainnet.yaml` or `config.sepolia.yaml`                                        |
| `ENVIO_API_TOKEN`                                     | HyperSync Free secret; no paid upgrade or RPC fallback                                |
| `ENVIO_PG_HOST`, `ENVIO_PG_PORT`, `ENVIO_PG_DATABASE` | Direct, session-preserving PostgreSQL endpoint and database                           |
| `ENVIO_PG_USER`, `ENVIO_PG_PASSWORD`                  | Dedicated worker role and secret                                                      |
| `ENVIO_PG_SCHEMA`                                     | `hyperindex_l1_mainnet` or `hyperindex_l1_sepolia`; optional `_rebuild1` style suffix |
| `ENVIO_PG_SSL_MODE`                                   | Prefer `verify-full`; `require` encrypts without certificate verification             |
| `ENVIO_HASURA`, `ENVIO_TUI`                           | `false` (enforced)                                                                    |
| `ENVIO_INDEXER_PORT`                                  | Omit when Railway provides `PORT`, or set to the same port                            |

Do not use a transaction-pooling endpoint: the advisory lock must remain attached to one server session for the complete worker lifetime. Neon commonly offers both pooled and direct endpoints; use the direct endpoint. Supply private CA trust through `NODE_EXTRA_CA_CERTS` when needed. Do not disable TLS verification globally. Never print secrets or bake an environment file into the image.

Envio 3.12.1 eagerly parses Hasura settings even when disabled, and omits several defaults under `NODE_ENV=production`. Bootstrap therefore supplies an inert `http://127.0.0.1:1/v1/metadata` endpoint and unused role/secret placeholders while enforcing `ENVIO_HASURA=false`; it never forwards real Hasura credentials. It also supplies `ENVIO_THROTTLE_CHAIN_METADATA_INTERVAL_MILLIS=500` and `ENVIO_THROTTLE_PRUNE_STALE_DATA_INTERVAL_MILLIS=30000`, matching upstream development defaults. Positive integer overrides are supported for those two intervals. No Hasura service is required.

Use a separate restricted role/schema per network. Provision the dedicated schema and ownership with a database administrator; grant only the permissions actually required after the isolated startup trial. Bootstrap rejects superuser/create-role/create-database privileges, ownership of relations outside the selected schema, and an unrecognized nonempty schema. Check inherited grants and `public` schema privileges as well as direct grants; the preflight does not prove absence of every inherited permission. Verify that startup can create its tables and sequence functions without modifying any application/Apibara objects before permitting access to the shared database.

Pinned source inspection shows `PgStorage` qualifies internal tables and entity state with `ENVIO_PG_SCHEMA`, and `Persistence.init` resumes existing `envio_chains` state without requesting reset. Disposable PostgreSQL tests cover isolation from a sibling sentinel schema; the intended provider's permissions and existing application grants still need validation. Back up and compare the application schema before/after a start/restart on an isolated copy.

### Restricted-role first start

Envio 3.12.1's native initialization **drops and recreates the selected dedicated schema**, even if an administrator precreated it empty, and grants `ALL ON SCHEMA` to `PUBLIC`. It does not drop application schemas. First start therefore requires temporary database-level `CREATE` permission in addition to ownership of the dedicated schema. `NOCREATEDB` should remain set: the ability to create a schema inside an existing database is distinct from the role's ability to create databases.

`role.integration.test.mjs` verified the following sequence against disposable PostgreSQL 18.4: initialization fails without database `CREATE`, succeeds after that grant, ordinary storage reopen and checkpoint writes succeed after revocation, and the worker cannot insert/drop/create objects in an unrelated application schema. The test also confirms that native initialization adds the `PUBLIC` schema grant and that reopening does not restore it after revocation. This is a privilege trial of the actual native persistence APIs, not a full deployed process trial.

An administrator can adapt this psql recipe to the approved database/network. Use a new role with no role memberships and a new schema; these example identifiers are mainnet-specific. Set its password interactively or through the provider's secret workflow, never in a checked-in SQL file:

```sql
SELECT current_database() AS database \gset
CREATE ROLE realms_l1_worker LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
\password realms_l1_worker
GRANT CONNECT, CREATE ON DATABASE :"database" TO realms_l1_worker;
CREATE SCHEMA hyperindex_l1_mainnet AUTHORIZATION realms_l1_worker;
```

Before initial startup, check the new role's effective privileges on **every existing application schema/table**, including grants inherited from `PUBLIC`. It must lack schema `CREATE`, table mutation privileges, object ownership and membership in privileged roles there. A new role can still inherit `PUBLIC` privileges despite `NOINHERIT`. Do not blindly revoke shared application grants to make this pass; review their consumers or use a separate database instead. The bootstrap's preflight checks role flags and ownership but cannot prove this complete permission inventory.

Perform a supervised first `start` using the normal bootstrap and fresh schema. Once native initialization has committed, stop the worker, then have the administrator remove the temporary grants before restarting:

```sql
REVOKE CREATE ON DATABASE :"database" FROM realms_l1_worker;
REVOKE ALL ON SCHEMA hyperindex_l1_mainnet FROM PUBLIC;
-- Substitute the separately provisioned portal read role:
GRANT USAGE ON SCHEMA hyperindex_l1_mainnet TO portal_reader;
GRANT SELECT ON hyperindex_l1_mainnet."L1BridgeEvent",
  hyperindex_l1_mainnet.envio_chains TO portal_reader;
```

Leave the worker as owner of its dedicated schema and objects so its normal indexing/index maintenance can continue. Do not give it an application/admin credential. The brief native `PUBLIC CREATE` grant exists between initialization and administrator revocation; if other database users make that exposure unacceptable, use a dedicated database for the first deployment. Every fresh-schema rebuild repeats this supervised grant/revoke procedure. Incompatible upgrades must fail for review; do not add automatic resets or broad permanent privileges.

## Writer ownership and shutdown

`scripts/start.mjs` holds a session advisory lock scoped to the current database plus a SHA-256-derived schema key before starting Envio. A second cooperative bootstrap exits before starting a child. Never bypass bootstrap with a direct production CLI invocation. The lock session has a five-second query timeout and two-second heartbeat. Session error, closure, or heartbeat failure immediately kills the complete child process group; it never reconnects and silently assumes ownership. SIGTERM/SIGINT allow twenty seconds to stop, then kill the group. The lock is released only after child exit.

This protects cooperating deployments; a database administrator terminating the lock session or a network partition can leave a short detection interval. It is not a database-enforced fencing token on every framework write. Keep stop-before-start deployment behavior and do not manually start a replacement until the former worker is confirmed stopped after a lock incident. A lock incident must be investigated, not treated as healthy indexing.

Use the supplied container command in production: the supervisor is PID 1, so container termination also removes its descendants after an uncatchable supervisor crash. Running the supervisor under an arbitrary shell/process manager does not provide this property; killing only that supervisor with SIGKILL can orphan its child. Local CLI commands above are for controlled validation, not a substitute for container lifecycle management.

## Health, freshness, and Free access

`/healthz` is process liveness, **not** evidence of current bridge data. Keep `/metrics` private and scrape at least `envio_progress_block`, `envio_progress_ready`, `envio_indexing_known_height`, `envio_source_known_height`, `envio_progress_block_time_seconds`, source request/error counts and process memory. Record observation time in the monitoring system. Missing samples, stale scrapes, missing block time during backfill, or no recent successful source observation are unknown/unavailable, never fresh.

After initial synchronization, alert when processed block age exceeds five minutes for ten minutes, or processed height trails known source height beyond the agreed threshold. Separately alert on absent scrapes and source observation failures: a frozen source height can make height lag look falsely zero. Use block timestamp age as a conservative signal even when a source returns an old head. Do not base freshness on the last bridge event; quiet bridge ranges are normal. Railway's healthcheck alone is insufficient; connect these alerts before cutover. The app reader must fail closed for stale/unavailable status.

On 429, preserve checkpoints and observe framework retry behavior; on sustained 401/403, repair the secret/access issue. Never fall back to RPC, purchase capacity, or reset the schema automatically. A successful Free request does not establish production capacity or account terms. Measure historical replay, then monitor head progress and throttling beyond the initial burst and perform one real deployed restart. Use sustained acceptable lag and correct records to decide cutover. A fixed 48-hour soak and injected source failures are optional additional assurance.

## Isolated validation and rollout gates

`production-cli.test.mjs` runs the real native CLI with `NODE_ENV=production`, a fresh temporary directory and synthetic configuration. It confirms production imports and `start --help` succeed, then an actual `start` reaches a deliberately denied database socket rather than failing eager environment parsing. Node TCP sockets are blocked before opening, source endpoints are loopback-only, and no environment files or real credentials are loaded. This regression covers production bootstrap defaults; it does not substitute for a deployed successful start.

Offline bootstrap tests run with `node --test scripts/*.test.mjs` from this package. For the optional PostgreSQL integration tests, start a disposable local PostgreSQL instance, create database `hyperindex_test`, and set `HYPERINDEX_TEST_DATABASE_URL` to its local URL. The tests reject remote hosts and database names outside `hyperindex_test` or `hyperindex_test_<lowercase alphanumeric suffix>`, use random schemas, and clean up those schemas. `lock.integration.test.mjs` terminates only its own lock backend and verifies writer exclusion/reacquisition and a durable probe row. `storage.integration.test.mjs` calls the real pinned Envio 3.12.1 internal PostgreSQL storage APIs to initialize the schema, write entity checkpoints, roll back branch evidence, write replacement evidence, persist eventless-batch progress, and reopen storage. It verifies an unrelated L2 sentinel schema survives. `role.integration.test.mjs` verifies the restricted-role first-start and grant-revocation sequence described above. These internal API calls are version-specific and must be reviewed on an Envio upgrade.

On 30 September 2026, all three integration tests passed against disposable PostgreSQL 18.4 on loopback, supplied by `embedded-postgres@18.4.0-beta.17` in a temporary directory outside the repository. The server was shut down after the test. No live database or production credentials were used. The persistence test proves database write/rollback and storage-reopen behavior; it does not exercise source fork detection, a process crash/restart, or live empty-range fetching. Railway image execution and ordinary deployed restart were subsequently verified below; controlled source-fork and exhaustive failure scenarios remain unverified.

Required cutover checks are real Free-token access for the selected network, deployed image startup with restricted database grants, completed L1/L2 shadow replay and current progress, representative chain samples and merged bridge-history comparisons, one real deployed worker restart with checkpoint continuation, and monitored healthy operation beyond the initial burst. Verify acceptable lag/throttling and stale-data handling; confirm application/Apibara objects remain unaffected and only one writer owns each indexing destination. Keep the existing persistence and source-isolation tests passing.

A custom source-fork/reorg harness, exhaustive crash/database/source-failure injection, and an exact 48-hour soak are optional additional assurance. They do not block initial shadow deployment or a cutover supported by the required evidence and measured stability. Their absence must remain explicit in validation records; framework rollback stays enabled, and local persistence tests do not establish full source-driven recovery across process downtime.

Replay into the fresh L1 schema and new L2-only tables while keeping the legacy reader. Record heights/hashes, event counts, raw-event comparisons, Free restrictions and resource use. Switch the reader only when both sources are current and acceptance passes. Retain the old image/tables for rollback; a legacy-reader rollback may still have stale L1 data. For incompatible config/schema changes or a reorg beyond 200 blocks, create a fresh suffixed schema and validate it before changing the reader. Never reset the shared database or transplant Apibara cursors into HyperIndex.

### Bounded read-only HyperSync smoke

Run from `packages/hyperindex` with `ENVIO_API_TOKEN` already in the process environment. The script itself does not load dotenv files. If the authorized token is in the repository root `.env`, Node 22 can load it without printing it:

```sh
node --env-file=../../.env scripts/hypersync-smoke.mjs --network mainnet --from 20433152 --to 20463151 --max-calls 3 --max-events 10 --chunk-blocks 10000 --timeout-seconds 60
node --env-file=../../.env scripts/hypersync-smoke.mjs --network sepolia --recent 2000 --max-calls 3 --max-events 10 --timeout-seconds 60
```

`--to` is inclusive. Pinned ranges require both endpoints; `--recent` instead spends one call reading the source height. Limits are enforced for client calls, sampled events, block range and wall time; Envio's native client may retry an individual call internally, so `max-calls` is not a count of HTTP attempts. The script constructs the same four production registrations, verifies their exact indexed topics before querying, and queries only the configured messaging emitter through HyperSync. It uses shared lossless payload decoding and emits public chain evidence as JSON, including transaction hashes, request keys, owners, token IDs and payloads. It performs no database writes, RPC fallback or plan changes. Errors are sanitized and never print the token. `complete: false` means a bounded sample, not proof of full range coverage; when events were truncated, the native `nextBlock` can be beyond unsampled logs and must not be treated as a replay checkpoint.

Offline guards and native registration construction are tested by `node --test scripts/hypersync-smoke.test.mjs`; these tests make no source calls. On 30 September 2026, the first mainnet command completed three client calls and decoded ten `LogMessageToL2` logs, stopping at the event limit (`nextBlock: 20455890`). One observed sample was transaction `0x2ae1974e7fd92e0f35551402902a189667655685e7c986eda6e6ab7455f80046`, block `20445580`, log `182`, request hash `52828012133468767671961931212800978924836545826442810396023971952195813150833`, token `1038`. This proves bounded historical access and decoding with the supplied token, not independent verification of all four event types, Sepolia access, account plan terms, reorg behavior or sustained Free capacity.

### Additional mainnet event evidence (30 September 2026)

A subsequent read-only comparison selected candidates from `public.realms_bridge_events`/`realms_bridge_requests` using a PostgreSQL session forced read-only with certificate verification. Three HyperSync native calls then completed these inclusive windows (no RPC, database writes or transactions):

| Blocks            | LogMessageToL2 | ConsumedMessageToL2 | LogMessageToL1 | ConsumedMessageToL1 |
| ----------------- | -------------: | ------------------: | -------------: | ------------------: |
| 20648463–20696463 |             30 |                  30 |              1 |                   0 |
| 20675576–20723576 |             13 |                  13 |              1 |                   1 |
| 21843709–21891709 |              1 |                   1 |              0 |                   1 |

The windows overlap; counts are per window and must not be summed as unique events. The full batch took approximately 5.5 seconds, below its nine-call/60-second bound. The following exact legacy transaction candidates were found and decoded:

| Event               | Block / log    | Transaction hash                                                     | Token IDs  |
| ------------------- | -------------- | -------------------------------------------------------------------- | ---------- |
| LogMessageToL1      | 20675395 / 289 | `0xb39c81ae4b468d9f4478a4e2ff00d87391ee65984d5aa08b39cf60b6452bb1cc` | 4359, 6182 |
| ConsumedMessageToL1 | 20702529 / 263 | `0x52ad62001062dd9abdc354af02e51f73447791fe7869a9271df96ff54c797bc0` | 4359, 6182 |
| ConsumedMessageToL2 | 21870568 / 313 | `0x994b03811aec3e4227525a250458c947e9fb20de7e7e2ffc0c4c5704eb3fb148` | 2882       |

The first two share withdrawal request hash `54791199933491509964875943345871337432075955016689061667230179885922624958606`, L1 owner `0x917a7277903148cda75c4e761ed7f483470ea28c`, and L2 owner `0x527416a24aeaa9edc3f8554a6bf580543f77e651dd58aee69b85c1bbec4da12`. Legacy `from_address` is this L2 owner and `to_address` is the L1 owner, while payload positions remain L1 then L2. The completion-to-L2 sample has deposit request hash `76742651702398925704723583972643603752457524023147958599247290491948074551166`, L1 owner `0x44124705c708d39247fc9c6fb29209006e4d9ae6` and L2 owner `0x2948e869499bfdbc187b02e1f5325d1a936e85a453616b2f0da0b54aadca94`. Request hashes, token IDs and owners agree after direction and leading-zero normalization. Legacy timestamps queried as SQL text/epoch agree exactly with HyperSync UTC: `2024-09-04 06:22:35`, `2024-09-08 01:12:23`, and `2025-02-18 03:27:11`. Parsing legacy timezone-free timestamps through a Sydney-local `pg` client shifts the resulting `Date` by 10/11 hours; this is a driver interpretation difference, not evidence of corrupted persisted timestamps.

A concrete provenance mismatch was also found for deposit request `56578820090941965754315281132088208843113301581921184757344264969203520155086`, token `4855`: HyperSync returns L1 `ConsumedMessageToL2` transaction `0x9295f4ed4b99f1c842bf89e63f4ecec74429b56f483357c0c6b30f29ac01500b` at block `20651970`, log `278`, but the legacy request has only one `withdraw_completed_l2` row with hash `0x0320349d5e0a22f11d28473df1954ec1a3a4f53b011c20697ce60de2776d78e4` and an earlier timestamp. This is consistent with the shared legacy primary key suppressing separate L1/L2 completion evidence; the other hash has not been independently verified against Starknet in this check. Preserve physical source/event identities instead of expecting legacy rows to match one-for-one.

Together with the earlier deposit sample, all four mainnet L1 event types have now been observed through the configured HyperSync filters and shared decoding. This remains bounded source evidence: independent L2 fixture verification, Sepolia reads, account-plan terms, source reorg/restart tests and the sustained Free-tier soak are separate gates.

### Controlled live L1 trial — 30 September 2026

A local Node 22.18 production process using this bootstrap and the supplied Free token completed mainnet replay into `hyperindex_l1_mainnet` on the existing Neon PostgreSQL 15.19 database. It reached source head block 26,087,215 and stored 839 deposits, 99 withdrawal-available events, 94 L1 withdrawal completions and 687 L2-consumed-message completions (1,719 physical events). A separately started process resumed that saved checkpoint and advanced through eventless blocks to 26,087,223, without changing event counts. Both completed runs returned HTTP 200 from `/healthz` and operated after database CREATE had been revoked.

The supervised first initialization required the temporary grant described above. Its PUBLIC schema grants were then removed. A final permission audit confirmed no elevated role flags, no database CREATE, no PUBLIC grants on the dedicated schema and no remaining worker connections. The `public` and legacy `airfoil` column inventories matched the pretrial snapshot; this is a scoped structure check, not an audit of every object or concurrent legacy write. The trial process is stopped and its checkpoint is retained for Railway.

This validates live access, replay, durable native process restart and quiet-range progress. It does not validate the Docker image on Railway, deployed lifecycle behavior, a source-driven reorg, sustained Free capacity, L2 live replay or the combined portal reader. The subsequent Railway rollout is recorded below. The existing reader remains unchanged.

### Railway shadow rollout

Both mainnet workers now run in [RW_Indexer/main](https://railway.com/project/1f3d9330-57e5-4631-8914-d7664cbf3e85). The [deployment acceptance record](../../docs/l1-hyperindex-railway-migration-plan.md#deployed-shadow-acceptance--30-september-2026) contains service/deployment IDs, measured heights, resource samples and the legacy comparison. Both Docker builds, live catch-up and deployed restart checks passed. At 02:36 UTC on 30 September 2026, the combined reader returned `ready`; 2,505 physical events formed 938 requests, with every legacy event represented. The production portal was not switched.

Use these service IDs explicitly for future CLI uploads: L1 `b46c9411-abe2-4fef-a913-196db55afd0d`, L2 `3d127746-c4a5-4e03-8693-9573e333b8ec`; environment `2c428197-5f7e-4268-b587-d40421c7940f`. No GitHub automatic deployments or public domains were configured. For L2 replacement, verify Railway's explicit `deploymentStopped` flag and completed container shutdown before starting the replacement: its historical `status` can remain `SUCCESS` while stopped.
