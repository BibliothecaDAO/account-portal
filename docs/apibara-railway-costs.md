# Apibara Railway runtime costs

## Finding (28 October 2026 UTC)

The supplied monthly bill totals approximately **$14.05**, including **$12.73
for RAM (91%)**, $0.36 CPU and $0.98 egress. Service labels in the screenshot
are truncated, so the live service names below were verified separately.

Read-only inspection of `RW_Indexer/main` found three active services using
`pnpm run apibara:start --indexer …`. Each keeps three pnpm processes, dotenv,
the Apibara CLI and three shells resident alongside the actual indexer.

| Service                   | Indexer process RSS | Launcher RSS, including shells | Total process RSS |
| ------------------------- | ------------------: | -----------------------------: | ----------------: |
| Starknet Realms Bridge    |              80 MiB |                        246 MiB |           326 MiB |
| Starknet Velords Rewards  |             128 MiB |                        282 MiB |           410 MiB |
| Starknet Realms Ownership |             142 MiB |                        311 MiB |           453 MiB |

These are instantaneous process samples, not Railway billing measurements.
Summed RSS can double-count shared pages. The bridge container's sampled
`memory.current` was 347,910,144 bytes. The initial estimate from launcher memory was **$7–9/month across these three
services**. Use the provider measurements below for the rollout result. This estimate assumes continuous operation and approximately
[$10 per GB-month of memory](https://docs.railway.com/pricing/plans).

## Applied rollout

The three production services were replaced sequentially on 28 October 2026
UTC, retaining commit `1227d40b3918e8e49e5011f892e44c336aeab56a`. Only their
Railway start commands changed. Each previous deployment was confirmed stopped
before its replacement was started.

Railway `MEMORY_USAGE_GB` measurements show:

| Service                   |       Before |      After |
| ------------------------- | -----------: | ---------: |
| Starknet Realms Bridge    |       354 MB |     148 MB |
| Starknet Velords Rewards  |       374 MB |     105 MB |
| Starknet Realms Ownership |       385 MB |     121 MB |
| **Combined**              | **1,113 MB** | **375 MB** |

The baseline is the mean of 30 samples from 21:30–21:45 UTC. The after column
is the mean of two 30-second samples at 22:00:30 and 22:01:00 UTC, after the
diagnostic processes exited. These early observations show **66% less combined
RAM** and imply approximately **$7.40/month less RAM usage** at $10/GB-month if
sustained. They are not a full billing-period result; allow for traffic, garbage
collection, reconnects and catch-up work before treating this as a forecast.

| Service                   | Replacement deployment                 |
| ------------------------- | -------------------------------------- |
| Starknet Realms Bridge    | `3d48720d-b2f3-4867-bf3b-eca71febdc39` |
| Starknet Velords Rewards  | `dd1d5ea3-2fb5-4993-b0f2-8985e52895f2` |
| Starknet Realms Ownership | `f9b1c1d0-24cb-43b9-8156-c2218c8eefbf` |

All three report `SUCCESS` and run a single Node worker. A read-only database
check at 21:59:56 UTC found all three checkpoints at block **17,094,917**.
Ownership reported `has_reached_head=true`, a latest block timestamp of
21:59:50 UTC and a last processed timestamp of 21:59:54 UTC. The shadow workers
and the two already-stopped services retain their original deployment IDs.

Local validation: production build passed; all 38 Apibara tests passed; the
standalone runtime loaded offline for mainnet and Sepolia and returned exit
code `1` for an invalid indexer on both networks. No application code was
changed by the rollout.

## Production start commands

Keep the repository root directory and existing build command
`pnpm apibara:build`. Run the compiled worker directly in Railway's Start
Command setting:

| Service                   | Start command                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Starknet Realms Bridge    | `node --enable-source-maps packages/apibara/.apibara/build/start.mjs start --indexer strk-realms-bridge`    |
| Starknet Velords Rewards  | `node --enable-source-maps packages/apibara/.apibara/build/start.mjs start --indexer strk-velords`          |
| Starknet Realms Ownership | `node --enable-source-maps packages/apibara/.apibara/build/start.mjs start --indexer strk-realms-ownership` |

This is Apibara's [supported standalone production entrypoint](https://apibara.com/docs/getting-started/installation).
The pinned CLI launches the same file after loading its configuration. The
standalone entrypoint embeds the build configuration and supports runtime
`APIBARA_RUNTIME_CONFIG` overrides. These indexers read their database, chain,
storage mode and DNA credentials from the environment. Keep those Railway
variables and all indexer identities unchanged. Source maps remain enabled.

The root `apibara:start:production` script provides the same entrypoint for
manual use, with environment variables already supplied. Railway should use
the literal `node` commands above to avoid keeping even one pnpm process alive.
The existing local start script continues to load `.env` as before.

The direct entrypoint also lets Railway observe the worker's exit status.
In the pinned Apibara CLI, a failed child is logged but its exit code is not
propagated. Railway's restart policy cannot reliably recover that failure
through the old launcher chain.

## Rollout and verification

No database migration, replay, dependency upgrade or change to event filters,
finality, checkpoint IDs or storage schemas is required.

1. Save each service's current settings and deployment ID. Update one service
   first, using its existing source/build and variables.
2. Keep one replica and prevent two writers from overlapping. Stop the old
   deployment before starting its replacement; an overlap setting alone is
   not evidence that the previous writer has stopped.
3. Verify startup, checkpoint resume, advancing source progress and absence of
   database/stream errors. The ownership smoke command can additionally verify
   freshness using the correct environment.
4. Inspect the process tree: there should be one Node worker, with no pnpm,
   dotenv or outer Apibara process. Compare Railway memory metrics over a
   representative period, including reconnects, before estimating savings.
5. Repeat for the other two services after the first replacement is healthy.
   Roll back by restoring `pnpm run apibara:start --indexer <same-name>` and
   replacing the worker without overlapping writers.

The active bridge shadow and HyperIndex shadow already use different runtime
bootstraps. Do not apply these commands to them. Retiring shadow/legacy bridge
services requires confirming the portal's selected reader and completing the
[bridge cutover](l1-hyperindex-railway-migration-plan.md).

`Starknet Realms Lords Claims` and `delegates-checkpoint` were stopped at
inspection. Claims logs show `Cannot convert undefined or null to object`
during Drizzle plugin initialization, followed by the CLI reporting child exit
code `1`. Repairing/restarting that service is separate from this cost reduction.

Lower memory limits do not by themselves reduce Railway's measured usage.
Keep continuous streaming and current freshness behavior for this first change.
