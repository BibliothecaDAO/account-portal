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
- Apply checked-in migrations: `pnpm db:migrate`

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
- Keep the entire Reown adapter/AppKit import graph dynamic in `providers/ethereum.tsx`; static imports can evaluate Lit browser globals during SSR.

## Dependency and Build Discipline

- When bumping package versions, build the app immediately after.
- Verify postbuild behavior when touching app packaging/deploy logic.
- Keep `packages/db/migrations/*.sql` checked in; production deploys must run `pnpm db:migrate` before application rollout.
- The account portal build enforces gzip chunk and total-JavaScript budgets in `apps/account-portal/scripts/bundle-budget.js`.
- Run `pnpm smoke` after production builds so SSR-only failures are caught against `.output/server/index.mjs`.
- Regenerate Snapshot types with `pnpm --filter @realms-world/account-portal codegen:snapshot` when its schema or documents change.
- Keep shared dependency versions aligned with `pnpm-workspace.yaml` catalog and root overrides.
- Keep pnpm lockfile settings aligned with repo config (for example `.npmrc` has `auto-install-peers=false` to match lockfile and avoid Vercel frozen-install failures).
- Prefer portable shell tools in CI/CD scripts (`cp`, `find`) and avoid non-guaranteed binaries like `rsync` unless the environment explicitly provides them.

## Change Workflow

- Read related files before edits.
- Implement minimal safe changes first.
- Validate with lint/build.
- Summarize behavior changes, risks, and follow-ups in PR description.

## Learning (Always Update When Useful)

- If you discover a new repo convention, recurring failure mode, or workflow improvement, update this `agents.md` in the same branch when it makes sense.
- Add short, actionable notes rather than long prose.
- Prefer concrete guidance tied to paths/commands in this repo.
