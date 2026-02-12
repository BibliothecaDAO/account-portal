# Product Requirements Document (PRD)

## Initiative
`veLords Dashboard Enrichment and Shareability`

## Document Control
- Status: Execution-ready
- Owner: Account Portal Engineering
- Product Lead: Account Portal Product
- Design Lead: TBD
- Stakeholders: Frontend, Data/Indexer, QA, Growth, Community
- Last Updated: February 12, 2026
- Target Release Window: February 13, 2026 to March 27, 2026
- Version: v1.0

## 1. Executive Summary
The current `/velords` page supports stake and claim flows, but does not yet operate as a rich, shareable dashboard. We already have enough onchain and indexed data to deliver a substantial experience upgrade without introducing new protocol contracts.

This PRD defines an execution-ready plan to:
- increase analytics depth,
- preserve and improve data trust,
- add deterministic URL-based share states,
- and ship a more communicative veLords surface for users and external sharing.

## 2. Problem Statement
The current implementation has these core product gaps:

1. Insight depth is limited to a small KPI set plus one chart.
2. Users cannot quickly answer "how is veLords doing right now" and "what is my position."
3. Views are not reliably sharable because dashboard state is not URL-driven.
4. Precision-risky indexer writes (`Number(...)`) are a blocker for trusted expanded analytics.
5. Existing indexed tables and contract reads are under-leveraged.

## 3. Goals

### 3.1 Primary Goals
- Deliver a rich veLords dashboard using available data first.
- Make dashboard views durable and sharable via canonical URL search state.
- Preserve numerical correctness across indexer, API, and UI paths.
- Keep implementation aligned with existing TanStack Router + React Query architecture.

### 3.2 Success Metrics
- `Engagement`: +30% increase in average `/velords` session duration.
- `Traffic`: +20% increase in weekly unique visitors to `/velords`.
- `Action rate`: +10% increase in stake and/or claim initiation from `/velords`.
- `Shareability`: >=20% of `/velords` sessions contain non-default search params.
- `Reliability`: 0 Sev-1/Sev-2 incidents related to veLords dashboard data correctness.

### 3.3 Guardrail Metrics
- p75 route data-ready time regression must remain within +10% max.
- p95 client error rate on `/velords` must not increase.
- No increase in wallet-flow failure rate (stake/claim/withdraw entrypoints).

## 4. Non-Goals
- No contract or tokenomics changes.
- No redesign of stake/claim transaction flows.
- No migration of app routing/query architecture.
- No dynamic OG image generation backend in MVP.

## 5. Users and Jobs-To-Be-Done
- Existing stakers: understand performance and optimize actions.
- Prospective stakers: evaluate protocol traction and reward dynamics.
- Community ambassadors: share concise, credible snapshots.
- Internal team: use consistent KPI definitions for comms.

## 6. Current State Summary

### 6.1 Existing UI
- veLords route with:
  - summary cards,
  - rewards chart,
  - stake module,
  - claim module.

### 6.2 Available Data Inputs
- Onchain reads:
  - total veLORDS supply,
  - LORDS locked in veLords,
  - user veLORDS balance,
  - user lock data,
  - simulated claimable rewards.
- Indexed tables:
  - `velords_rewards_received`,
  - `velords_lords_locked`,
  - `velords_burner_transfers`.

### 6.3 Critical Gaps
- Only rewards table is used in analytics display today.
- No route-level search state schema on `/velords`.
- No route-specific share metadata.
- Indexers cast large amounts with `Number(...)`.

## 7. Product Scope

### 7.1 In Scope (MVP)
- Precision hardening for veLords-related amount writes in indexers.
- New analytics server functions for overview, trends, and breakdowns.
- Expanded dashboard modules and richer KPI set.
- URL-driven state for period/view/source.
- Copy-link and copy-summary user actions.
- veLords-specific meta tags and static share image wiring.

### 7.2 Out of Scope (MVP)
- New indexer pipelines for additional event types beyond existing outputs.
- Contract-level protocol instrumentation changes.
- Public image-render service for wallet-specific snapshots.

## 8. Functional Requirements

### 8.1 Rich Analytics
- `FR-RA-1`: Dashboard must display:
  - total veLORDS supply,
  - total LORDS locked,
  - TVL (USD),
  - 7d rewards,
  - 30d rewards,
  - trailing APY.
- `FR-RA-2`: Dashboard must show weekly rewards trend for periods `3m`, `6m`, `1y`.
- `FR-RA-3`: Dashboard must show reward source composition (chart + table with amount/share/tx count).
- `FR-RA-4`: Dashboard must include lock activity trend view:
  - lock updates per week,
  - unique wallets per week.
- `FR-RA-5`: All KPI and chart values must come from documented formulas in Section 11.

### 8.2 User Position
- `FR-UP-1`: Connected users must see:
  - veLORDS balance,
  - share of total supply,
  - current lock amount,
  - lock end date/time-to-unlock,
  - claimable rewards.
- `FR-UP-2`: Dashboard must show estimated next-week rewards using user share and latest weekly rewards (labeled estimate).
- `FR-UP-3`: Stake/claim/withdraw entrypoints remain present with no behavior regression.

### 8.3 Shareability
- `FR-SH-1`: Dashboard state must be URL-driven with validated search params:
  - `period`: `3m|6m|1y`,
  - `view`: `overview|sources|locks`,
  - `source`: optional normalized address.
- `FR-SH-2`: Copy link action must copy canonical URL with active search state.
- `FR-SH-3`: Copy summary action must copy text summary reflecting current state.
- `FR-SH-4`: Route metadata must be veLords-specific for title/description/image.

### 8.4 Data/API
- `FR-DL-1`: Introduce aggregate server functions with strict `zod` validation.
- `FR-DL-2`: Query options must use stable keys and safe guards.
- `FR-DL-3`: Period and timestamp handling must be UTC-consistent.
- `FR-DL-4`: Responses must be chart-ready to minimize client-heavy transforms.

## 9. Non-Functional Requirements
- `NFR-1` Correctness: no JS float casting for high-precision token amounts before final display formatting.
- `NFR-2` Performance: p75 data-ready time for `/velords` must not regress >10%.
- `NFR-3` Stability: wallet-dependent queries must use `enabled` and null-safe args.
- `NFR-4` Accessibility: all new controls keyboard-navigable and screen-reader labeled.
- `NFR-5` Maintainability: KPI formulas and transforms centralized and test-covered.

## 10. UX Requirements

### 10.1 Layout Hierarchy
- Row 1: KPI band + period control + share actions.
- Row 2: rewards trend + source composition.
- Row 3: lock activity + user position/action panel.

### 10.2 Content Standards
- Use precise labeling for estimated values.
- Keep token naming consistent: `LORDS`, `veLORDS`.
- Provide clear empty/error states.

### 10.3 Share Summary Template
`veLords Dashboard ({period}) | TVL: ${tvl} | Locked: {locked} LORDS | 30d Rewards: {rewards30d} LORDS | APY: {apy}% | Updated: {date}`

## 11. Metric Definitions (Source of Truth)

All formula implementations must be shared between KPI and chart usage paths.

- `totalLordsLocked`:
  - from LORDS `balance_of(veLordsAddress)` raw wei,
  - formatted at render.

- `tvlUsd`:
  - `totalLordsLocked * lordsUsdPrice`.

- `weeklyRewards[week]`:
  - sum of `velords_rewards_received.amount` for timestamps in `[weekStart, weekEnd)`.

- `rewards7d`:
  - sum of rewards in last 7 * 24h from `asOf`.

- `rewards30d`:
  - sum of rewards in last 30 * 24h from `asOf`.

- `trailingApy` (resolved decision):
  - `((sumRewardsLast4Weeks / 4) * 52) / avgVeSupplyLast4Weeks * 100`.
  - if denominator is `0`, APY is `0`.

- `userSharePercent`:
  - `userVeBalance / totalVeSupply * 100`.

- `estimatedWeeklyUserRewards`:
  - `latestCompleteWeekRewards * userSharePercent / 100`.
  - display with `~` prefix.

### 11.1 Precision Rules
- Keep token arithmetic in bigint-compatible form until display.
- Avoid `Number(...)` on raw token amounts.
- Only convert to number for presentation after scaling/formatting.

## 12. Technical Design

### 12.1 Route Search-State Contract
- Route: `/velords`.
- Search schema:
  - `period` default `3m`,
  - `view` default `overview`,
  - `source` optional.
- Invalid values normalize to defaults.

### 12.2 Proposed Server Functions
- `getVelordsOverview(input)`:
  - returns KPI snapshot and latest week values.
- `getVelordsRewardsSeries(input)`:
  - returns weekly totals + source split for selected period.
- `getVelordsLockActivity(input)`:
  - returns weekly lock updates + unique owners.

### 12.3 Query Keys (Draft)
- `["velordsOverview", { period }]`
- `["velordsRewardsSeries", { period, source? }]`
- `["velordsLockActivity", { period }]`

### 12.4 Component Boundaries
- Route owns search state + query orchestration.
- Modules render data only and avoid hidden fetch logic where possible.
- Shared formatting and formula helpers live in `lib` with tests.

## 13. Detailed Delivery Plan

### Milestone 1: Data Trust + Foundations
- Dates: February 13, 2026 to February 19, 2026
- Outcomes:
  - precision-safe indexer writes,
  - analytics server functions,
  - formula utility tests.
- Exit Criteria:
  - fixture tests pass for large-value scenarios,
  - analytics endpoints available in staging.

### Milestone 2: Rich Dashboard Build
- Dates: February 20, 2026 to March 10, 2026
- Outcomes:
  - KPI expansion,
  - rewards/source modules,
  - lock activity module,
  - improved user position panel.
- Exit Criteria:
  - acceptance flows pass in QA matrix.

### Milestone 3: Shareability + Hardening
- Dates: March 11, 2026 to March 27, 2026
- Outcomes:
  - URL state hydration,
  - copy-link/summary actions,
  - route-level metadata,
  - regression checks.
- Exit Criteria:
  - share links are deterministic and rehydratable,
  - launch checklist complete.

## 14. Acceptance Criteria

1. `/velords` shows all new KPI cards with correct loading/error/empty behavior.
2. Period/view/source survives refresh and direct-link navigation.
3. Copy-link and copy-summary produce expected output.
4. Rewards source table and lock activity charts render from existing indexed tables.
5. Large token values pass precision tests and match expected formatted outputs.
6. Existing stake/claim/withdraw flows remain operational.
7. Account portal build and lint pass before merge.

## 15. QA Test Matrix

### 15.1 Functional
- Connected wallet vs disconnected wallet.
- Each period (`3m`, `6m`, `1y`) and each view (`overview`, `sources`, `locks`).
- Valid source filter and invalid source filter.
- Copy link and copy summary actions.

### 15.2 Data Integrity
- High-value reward rows.
- Weeks with zero rewards.
- Missing price data fallback.
- total supply = 0 fallback.

### 15.3 Regression
- stake dialog open/submit paths.
- unlock dialog open/submit paths.
- claim panel recipient override and claim path.

## 16. Risks and Mitigations

- Risk: formula mismatch across KPI/chart modules.
- Mitigation: centralize formula helpers and snapshot tests.

- Risk: DB numeric serialization changes affect downstream reads.
- Mitigation: validate indexer + server-function + UI end-to-end with seeded fixtures.

- Risk: increased dashboard density hurts mobile readability.
- Mitigation: responsive stacking with collapsible secondary panels.

- Risk: share links become unstable if defaults evolve.
- Mitigation: canonicalizer normalizes params and preserves backwards compatibility.

## 17. Dependencies
- veLords indexer health and table freshness.
- Engineering bandwidth across frontend and data.
- Product signoff on KPI wording and share-summary template.
- QA bandwidth for wallet and route-state matrix.

## 18. Decision Log (Resolved)

1. Burner transfers in MVP: included as an advanced data input only, not a primary KPI card.
2. APY default: trailing 4-week average annualized formula.
3. Shared view mode: URL-driven read-only behavior by default when wallet disconnected.
4. Source label mapping: move toward config-driven labels with fallback to address short form.

## 19. Implementation Backlog (Execution Order)

- `P0` Precision hardening in veLords-related indexers.
- `P0` Build shared metrics utility with test fixtures.
- `P0` Add aggregate server functions + query options.
- `P1` Add route search schema/state handling.
- `P1` Implement KPI band and enriched modules.
- `P1` Add copy-link/copy-summary UX.
- `P2` Add route-level SEO metadata and static share image.
- `P2` Final QA pass and rollout instrumentation.

## 20. Rollout Strategy

1. Ship behind feature flag where feasible.
2. Internal preview + QA validation.
3. Limited rollout (10-20% traffic if applicable).
4. Full rollout after 48h clean telemetry window.
5. Post-launch weekly review for 4 weeks.

## 21. Measurement Plan

### 21.1 Baseline
- `/velords` sessions/week.
- Average session duration.
- stake/claim initiation rate.
- deep-link usage rate.
- p75 data-ready time.

### 21.2 Post-Launch
- Compare baseline weekly for 4 weeks.
- Segment connected vs disconnected users.
- Track share-action usage and URL-state usage.
- Monitor errors by module and route-state parsing.

## 22. Definition of Done

- All functional and non-functional requirements satisfied.
- Acceptance criteria and QA matrix completed.
- Build/lint checks pass for the app.
- Metrics dashboard updated with post-launch monitoring.
- No unresolved P0/P1 findings from final review.
