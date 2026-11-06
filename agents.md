cp ~/.secrets/rw-account/.env .env

Do this before beginning to get the proper env.

# Account Portal Agent Guide

## Purpose
Use this file as the operating guide for keeping this repo healthy, maintainable, and fast.

## Repo Map (Where Things Are)
- `apps/account-portal`: Main TanStack Start + React app.
- `apps/account-portal/src/routes`: Route entrypoints and route-level data loading.
- `apps/account-portal/src/components`: UI components and feature modules.
- `apps/account-portal/src/lib`: Server functions, API clients, and data helpers.
- `apps/account-portal/src/hooks`: React hooks for wallet/data behavior.
- `apps/account-portal/src/providers`: App-level providers and runtime wiring.
- `packages/constants`: Shared chain IDs, addresses, and reusable constants.
- `packages/db`: Drizzle schema/client and DB integration.
- `packages/apibara`: Indexer pipeline and related tests.
- `docs/prd-react-best-practices-remediation.md`: React remediation plan and technical PRD.

## Core Commands
- Install: `pnpm i`
- Dev app: `pnpm dev`
- App build: `pnpm --filter @realms-world/account-portal build`
- App lint: `pnpm --filter @realms-world/account-portal lint`
- Monorepo lint: `pnpm lint`
- DB push: `pnpm db:push`
- DB pull: `pnpm db:pull`

## Keep The Repo In Good Standing
- Always run `pnpm --filter @realms-world/account-portal build` before finalizing frontend changes.
- Run targeted lint for changed files or `pnpm --filter @realms-world/account-portal lint` before commit.
- Prefer small, focused PRs with one clear purpose.
- Do not leave debug logs or commented legacy code in production paths.
- Keep query/input guards in place for optional wallet state (`enabled`, null-safe inputs).
- Treat server function validation as strict by default; return safe fallbacks when inputs are optional.
- Keep external links safe with `rel="noopener noreferrer"` when using `target="_blank"`.
- Avoid introducing duplicate query clients or cache silos.
- Keep changes compatible with existing TanStack Router + React Query architecture.

## React and Data Best Practices (Project-Specific)
- Parallelize independent data fetches to avoid route waterfalls.
- Use `queryOptions` consistently and guard queries that depend on wallet address.
- Keep state local when possible; avoid unnecessary provider/global state expansion.
- Prevent runtime warnings by clamping/sanitizing UI component inputs (for example progress/chart bounds).
- Prefer lazy loading for heavy routes/components when it improves initial bundle performance.
- Ensure client-only tooling and devtools are gated to development environments.
- For wallet SDKs (`@reown/*`, `@walletconnect/*`), avoid SSR externalization patterns that can reintroduce ESM/CJS runtime mismatches on Vercel.

## Dependency and Build Discipline
- When bumping package versions, build the app immediately after.
- After TanStack Router/Start bumps, also smoke-test SSR (`node .output/server/index.mjs` + `curl` a few routes): incompatible router integrations build fine but 500 at runtime. Keep `@tanstack/react-start` and `@tanstack/react-router` on the versions Start pins, and use `@tanstack/react-router-ssr-query` (`setupRouterSsrQueryIntegration`), not the deprecated `@tanstack/react-router-with-query`.
- Verify postbuild behavior when touching app packaging/deploy logic.
- Keep shared dependency versions aligned with `pnpm-workspace.yaml` catalog and root overrides.
- Keep pnpm lockfile settings aligned with repo config (for example `.npmrc` has `auto-install-peers=false` to match lockfile and avoid Vercel frozen-install failures).
- Prefer portable shell tools in CI/CD scripts (`cp`, `find`) and avoid non-guaranteed binaries like `rsync` unless the environment explicitly provides them.

## Cairo Governance
- Contracts live in `contracts/governance`; read its `README.md` for the snapshot trust model and lifecycle before changing voting behavior.
- From that directory run `scarb fmt --check`, `scarb lint --test --deny-warnings`, `scarb build`, `snforge test`, and `python3 -m unittest discover -s scripts -p 'test_*.py'`. Keep tool versions aligned with `Scarb.toml`, `.tool-versions`, and `.github/workflows/governance-cairo.yml`.
- Apply nonlinear weighting to aggregated participant inputs before delegation. Snapshot publisher attestations are not onchain proofs of unique people or historical asset ownership.

## Change Workflow
- Read related files before edits.
- Implement minimal safe changes first.
- Validate with lint/build.
- Summarize behavior changes, risks, and follow-ups in PR description.

## Learning (Always Update When Useful)
- If you discover a new repo convention, recurring failure mode, or workflow improvement, update this `agents.md` in the same branch when it makes sense.
- Add short, actionable notes rather than long prose.
- Prefer concrete guidance tied to paths/commands in this repo.

## Design Tokens and Storybook
- Tokens live in `apps/account-portal/src/styles.css` (ported from the marketplace `globals.css`; always dark via `<html class="dark">`; there is no light theme). Use semantic utilities only (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`, `text-trade-up`, `shadow-float`); never `bg-[#…]`, `text-[color:var(--…)]`, one-off `shadow-[…]`/radii. Add new color roles to `.dark` and `@theme inline`. `src/lib/theme.test.ts` enforces this.
- Type classes: `.realm-page-title`, `.realm-card-title`, `.realm-group-title`, `.realm-label`, `.realm-stat` (mono numbers), `.realm-kicker`. Page shell: `PageContainer` + `PageHeader`; sections: `SectionCard`; stats: `MetricCard`.
- Storybook: `pnpm --filter @realms-world/account-portal storybook` (:6006) and `storybook:build`. It uses `.storybook/vite.config.ts` (no TanStack Start/Nitro plugins). Keep dashboard sections presentational (props in, no wallet hooks) so they have fixture stories.

## Delegates Indexer
- `DELEGATES_INDEXER_READS` (server-only, read from `process.env`; only `"true"` enables it, default off) moves `findDelegateRecord` and `getDelegates` from the frozen `delegates` table to `starknet_delegates`. Non-`VITE_` variables never reach `import.meta.env`, so use `getServerEnv()` from `src/lib/server-env.server.ts`. Never write to or alter `delegates`.
- Deploy in this order: (1) review and apply `packages/db/sql/20261105_starknet_delegates.sql` with a PostgreSQL client, not `db:push`, whose diff could reach `delegates`; (2) `pnpm --filter @realms-world/apibara build`, then run one writer with `start --indexer strk-delegates`, with `DATABASE_URL`, `DNA_TOKEN` and `VITE_PUBLIC_CHAIN`; (3) wait for `SELECT has_reached_head, latest_block_number FROM starknet_delegates_status` to report true and compare a few delegates against `get_votes`; (4) set `DELEGATES_INDEXER_READS=true` and redeploy the portal. Roll back by unsetting the flag.
- With the flag off, a saved profile with no `delegates` row has unknown votes: `delegatedVotes` is `null`, rendered as a dash and sorted last. Never coerce it to 0.

## Realms LORDS Claims
- `public.realms_lords_claims` stopped in March 2026 with its Apibara indexer. `CLAIMS_RPC_READS` (server-only, same rules as `DELEGATES_INDEXER_READS`) moves mainnet past claims to `rpc_indexer_mainnet_v1.realms_lords_claims`, written by the `Starknet RPC Shadow` worker in `RW_Indexer` (source on the #400 branch). That table stores addresses and hashes without leading zeros; `findRealmsLordsClaims` converts them, so callers still get the legacy shape. Roll back by unsetting the flag.
