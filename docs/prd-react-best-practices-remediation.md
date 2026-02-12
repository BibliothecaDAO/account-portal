# Product Requirements Document (PRD)

## Initiative
`Account Portal React Best-Practices Remediation`

## Document Control
- Status: Draft for execution
- Owner: Account Portal Engineering
- Stakeholders: Product, Frontend, Platform, QA
- Last Updated: February 11, 2026
- Target Release Window: February 12, 2026 to March 20, 2026

## 1. Executive Summary
The Account Portal has grown quickly across wallet integrations, governance views, bridge flows, and veLords dashboards. A deep React-focused review identified critical issues in query architecture, data-fetching flow, runtime safety, and bundle strategy.

This initiative hardens the frontend platform so feature teams can ship faster with lower regression risk and better user performance. The work is primarily technical product debt with direct user impact on reliability, navigation speed, and UI responsiveness.

## 2. Problem Statement
Current frontend architecture has four major pain points:

1. Reliability risk from correctness bugs and state architecture fragmentation.
2. Performance degradation from data waterfalls and unnecessary refetching.
3. Bundle and startup inefficiency from eager loading and always-on dev tooling.
4. Missing quality gates for preventing recurrence.

Without a structured remediation plan, new product development will continue to absorb avoidable cost through slower debugging, inconsistent behavior, and regressions.

## 3. Goals

### 3.1 Primary Goals
- Eliminate known critical runtime/correctness issues in governance and data layers.
- Reduce user-perceived latency for high-traffic routes (`/`, `/proposal/list`, `/proposal/$id`, `/delegate/list`).
- Reduce initial client JavaScript and unnecessary client work.
- Establish enforceable engineering guardrails for React best practices.

### 3.2 Success Metrics
- `Critical bugs`: 0 open critical frontend correctness issues.
- `Initial JS payload`: reduce by at least 20% on first-load route.
- `Route data latency`: reduce p75 route data-ready time by at least 25% for top 4 routes.
- `Network efficiency`: reduce duplicate/avoidable API calls per navigation by at least 30%.
- `Stability`: no Sev-1 frontend incident for 30 days after rollout.

## 4. Non-Goals
- No feature redesign of governance, bridge, or veLords product UX.
- No visual overhaul of component library or design system.
- No migration away from TanStack Router/React Query/Starknet stack.
- No backend schema redesign unless blocking critical frontend correctness.

## 5. Users and Beneficiaries
- Wallet-connected account users who need fast dashboard and governance flows.
- Governance users who need reliable voting state and proposal detail behavior.
- Internal engineers who need predictable query behavior and safe defaults.

## 6. Current State Summary
The audit identified the following root-cause categories:

- Query architecture split between router query client and provider-local query client.
- Sequential suspense calls in high-traffic pages causing waterfalls.
- Critical runtime bug in proposal detail vote display path.
- Static/eager route loading with heavy dependency routes.
- Unconditional client devtools and excessive debug logs in hot paths.
- Inconsistent edge-safe and SSR-safe behavior around theme/bootstrap and external links.
- Missing or weak CI enforcement for lint/build/test quality.

## 7. Product Requirements

### 7.1 Functional Requirements

#### Data Fetching and Caching
- `FR-DF-1`: App must use a single shared React Query client for router and UI.
- `FR-DF-2`: Route-level data prefetch must run in parallel where dependencies allow.
- `FR-DF-3`: Query options must use `enabled` guards for disconnected wallet states and optional inputs.
- `FR-DF-4`: Delegate search must use debounced or deferred query input to avoid per-keystroke churn.
- `FR-DF-5`: Governance vote queries must send correct GraphQL variable names and return deterministic data.
- `FR-DF-6`: Repeated poll-based queries must have explicit ownership and justified intervals.

#### Reliability and Correctness
- `FR-RC-1`: Proposal detail must render user vote state without runtime errors.
- `FR-RC-2`: All externally opened links must be safe (`rel="noopener noreferrer"`).
- `FR-RC-3`: External URLs must not use router-only navigation components in unsupported ways.
- `FR-RC-4`: Theme bootstrap must use a single, consistent storage key to prevent flicker/mismatch.

#### Rendering and Startup
- `FR-RS-1`: App shell must render even if optional Ethereum provider dependencies are still loading.
- `FR-RS-2`: Devtools components must render only in development builds.
- `FR-RS-3`: Heavy route modules must be lazy-loaded where practical to reduce initial bundle cost.
- `FR-RS-4`: Debug logging in render/hot paths must be removed or gated behind development checks.

#### Quality and Maintainability
- `FR-QM-1`: Any usage in core data hooks/routes should be reduced with typed response helpers.
- `FR-QM-2`: Dead imports and commented legacy blocks in production paths should be removed.
- `FR-QM-3`: CI must enforce lint, typecheck, and build before merge.
- `FR-QM-4`: Critical route behaviors must be covered by automated tests.

### 7.2 Non-Functional Requirements
- `NFR-1` Performance: No increase in p75 route interactive time during rollout.
- `NFR-2` Availability: No route should blank entire app shell due to optional integration init.
- `NFR-3` Security: No reverse-tabnabbing risk via external links.
- `NFR-4` Observability: Core route navigation and data-load timings must be measurable.
- `NFR-5` Developer Experience: CI feedback on React regressions within 10 minutes.

## 8. Scope

### 8.1 In Scope
- React Query architecture consolidation.
- Route loader/query parallelization.
- Critical bug fixes and correctness hardening.
- Bundle/startup optimization in app shell and route loading.
- Guardrail setup in lint/typecheck/test/CI.

### 8.2 Out of Scope
- Wallet provider vendor changes.
- Major API contract changes.
- UI redesign unrelated to performance/reliability.

## 9. Proposed Solution

### 9.1 Workstream A: Query Architecture Consolidation
- Consolidate to one query client source of truth.
- Align router prefetch and component consumption.
- Remove duplicate cache boundaries.

### 9.2 Workstream B: Waterfall Elimination
- Move fetch orchestration into loaders where feasible.
- Use `Promise.all` for independent requests.
- Keep Suspense boundaries focused on route sections, not serial hook chains.

### 9.3 Workstream C: Bundle and Startup Optimization
- Gate devtools with environment checks.
- Apply route/component lazy loading for heavy surfaces.
- Remove dead imports and non-production logging.

### 9.4 Workstream D: Correctness and Security Fixes
- Fix proposal vote render bug.
- Correct GraphQL variables for user votes.
- Enforce secure external link patterns.
- Normalize theme bootstrap key handling.

### 9.5 Workstream E: Quality Gates
- Add/enable lint + typecheck + build in CI.
- Add route-level regression tests for core flows.
- Add performance budgets and reporting.

## 10. Milestones and Timeline

### Milestone 1: Critical Stabilization
- Dates: February 12, 2026 to February 18, 2026
- Deliverables:
- Fix critical runtime issues.
- Consolidate query-client architecture.
- Ensure app shell no longer blocks on optional provider init.

### Milestone 2: Data and Rendering Performance
- Dates: February 19, 2026 to March 3, 2026
- Deliverables:
- Remove top-route waterfalls.
- Add search query deferral/debounce.
- Fix polling and query guards.

### Milestone 3: Bundle and Loading Improvements
- Dates: March 4, 2026 to March 12, 2026
- Deliverables:
- Devtools gated to development.
- Route/component lazy loading for heavy paths.
- Dead-code and logging cleanup.

### Milestone 4: Hardening and Rollout
- Dates: March 13, 2026 to March 20, 2026
- Deliverables:
- CI gates active.
- Automated regression checks added.
- Staged rollout and post-release monitoring complete.

## 11. Acceptance Criteria
- Proposal detail route renders without runtime exception in vote section.
- Router prefetch cache is reused by UI queries without duplicate client partitions.
- Home/proposal/delegate routes demonstrate parallelized data load patterns.
- Devtools are absent in production bundles.
- External links pass security checks.
- CI enforces lint/typecheck/build with no bypass on protected branches.
- Baseline and post-change performance report is captured and shared.

## 12. Measurement Plan

### 12.1 Baseline (Week 1)
- Capture route-level page-load timings for:
- `/`
- `/proposal/list`
- `/proposal/$id`
- `/delegate/list`
- Capture initial JS bundle sizes and chunk graph.
- Capture per-route network request counts and duplicates.

### 12.2 Post-Implementation
- Re-run identical benchmarks.
- Compare p50/p75/p95 latency and request counts.
- Record incident count and error logs for 30-day window.

## 13. Risks and Mitigations
- Risk: Cache unification creates subtle behavior changes in wallet-dependent queries.
- Mitigation: Add targeted regression tests and rollout behind feature flag if needed.

- Risk: Lazy-loading introduces route-level loading regressions.
- Mitigation: Add explicit fallbacks and verify with navigation test matrix.

- Risk: Missing local dependencies in CI-like checks slows validation.
- Mitigation: Ensure deterministic install + lint/typecheck/build steps in pipeline.

- Risk: Performance baseline cannot be trusted without consistent environment.
- Mitigation: Use fixed test environment and repeatable scripts.

## 14. Dependencies
- Stable CI environment with Node and pnpm versions aligned to repo.
- Access to runtime telemetry and frontend logs.
- Engineering bandwidth across frontend and platform reviewers.

## 15. Rollout Strategy
- Phase rollout by route group.
- Start with low-risk correctness fixes.
- Follow with data-flow and bundle optimization.
- Monitor errors and route timings after each milestone.
- Keep rollback path by isolated PRs per workstream.

## 16. Open Questions
- Should Ethereum provider initialization be fully decoupled from initial shell render, or gate only Ethereum-specific UI islands?
- What bundle size budget should be enforced per route and globally?
- Which telemetry source is canonical for p75 route readiness and network duplication?
- Do we want hard lint enforcement on `console.log` for all production source files?

## 17. Implementation Backlog (Initial)
- `P0` Fix proposal vote reference bug and governance query variable mismatch.
- `P0` Unify React Query client architecture.
- `P0` Prevent app shell blanking during client-only provider bootstrap.
- `P1` Refactor top route data loading to parallelized loaders.
- `P1` Gate devtools and remove hot-path debug logs.
- `P1` Add secure external link policy and cleanup usages.
- `P2` Introduce route-level lazy loading for heavy features.
- `P2` Add CI checks and targeted route regression tests.

## 18. Definition of Done
- All acceptance criteria met.
- Success metrics measured and reported.
- No open P0/P1 findings from final code review.
- Runbook for future React best-practice checks documented in repo.
