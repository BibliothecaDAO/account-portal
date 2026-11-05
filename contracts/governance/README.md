# Realms governance contracts

An initial Cairo implementation of [the governance design](../../docs/governance-design.md). It implements square-root-weighted treasury resolutions and individual grants, with expiring representation and bounded onchain payments. It is a standalone protocol; it does not alter the existing Snapshot X space or its contracts.

**Readiness: locally tested, not audited or deployed.** Participant uniqueness and historical asset inputs are attested by a designated publisher. This implementation does not prove human uniqueness, aggregate linked wallets itself, or verify historical ownership against live Realm/veLORDS contracts. Those are explicit upstream responsibilities. XP can be enabled in the formula, but the initial deployment should assign it zero weight until an approved evidence source exists.

## Package

| File | Responsibility |
| --- | --- |
| `src/power.cairo` | Fixed-point square roots, component normalization, passage rules, quadratic credit-cost primitive |
| `src/delegation.cairo` | Permissionless, scoped mandates and historical revision lookup |
| `src/governor.cairo` | Snapshot enrollment, ballots, tally, timelock, and capped ERC-20 treasury |
| `src/types.cairo` | ABI types, immutable policy, lifecycle, and numeric limits |
| `scripts/snapshot.py` | Independent Python arithmetic, canonical manifest, calldata preparation, and tally reproduction |
| `tests/` | Foundry deployment, adversarial lifecycle, payment, and property tests |

The current ballot is For / Against / Abstain. Grant-round allocation using quadratic voice credits remains a later mechanism: `quadratic_cost` supplies the cost primitive, but this package does not yet run multi-option grant rounds. Each payment proposal can represent an individual grant or a separately approved milestone.

## Toolchain and verification

Use Scarb/Cairo **2.13.1**, Starknet Foundry **0.64.1**, and Python **3.10+**. The directory-local `.tool-versions` selects Scarb under asdf without changing the user's global version. Foundry's `snforge_std` is exactly pinned; commit `Scarb.lock`. Installation instructions: [Scarb](https://docs.swmansion.com/scarb/download), [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/getting-started/installation.html).

From this directory:

```sh
scarb fmt --check
scarb lint --test --deny-warnings
scarb build
snforge test
python3 -m unittest discover -s scripts -p 'test_*.py'
```

The CI workflow runs these checks without production credentials. Sierra, CASM, and ABI artifacts are emitted under `target/dev/`; mock token contracts are confined to integration-test artifacts.

## Scoring and identity boundary

For each attested participant, the publisher first aggregates Realm, veLORDS, and XP inputs across all of that participant's eligible accounts. Each raw input is an unsigned 128-bit integer. Token amounts use raw token base units, consistently across the electorate. Treating token balances as display-unit floats is invalid.

```text
root_i,c = floor(sqrt(raw_i,c * 10^18))
component_total_c = sum(root_i,c)
weight_i = sum_c floor(root_i,c * 10^14 * coefficient_bps_c / component_total_c)
eligible_supply = sum(weight_i)
```

Coefficients sum to 10,000. Disabled components contribute zero. An enabled component with zero supply prevents freezing the snapshot. The supply used by quorum is the exact sum after rounding, not an assumed `10^18`. Root precision is nine fractional digits; output weights are scaled to approximately `10^18` total units.

The contract bounds inputs to `u128`, participants to the `u32` count range, and coefficients to 10,000 combined. Under these bounds, roots, sums, intermediate products, quorum comparisons, and credit-cost arithmetic fit `u256`. Checked arithmetic rejects counter overflow.

Each snapshot allows one record per participant ID and one per controller address. The publisher is trusted not to split one person across multiple IDs/controllers, exclude eligible people, fabricate balances, double-count bridged assets, or misstate the published evidence. Address uniqueness alone does not establish person uniqueness. Controllers are frozen per proposal; a recovery changes future snapshots, not active voting rights.

`minimum_supporters` counts positive-weight participants whose **effective** ballot is For, including representation through a delegate. It does not count delegate transactions, and it is not a requirement for independent direct signatures. If direct-only breadth is desired, it needs a different policy and tally rule.

## Mandates

Call `DelegationRegistry.delegate(governor_address, delegate_address, expires_at)` from the delegator's account. The governor's address is the scope, so delegation cannot spill into another deployment or future policy version. Duration must be positive and at most 90 days. Renewal is a fresh account transaction. Self-delegation is unnecessary; direct voting is always available.

Every mutation creates a monotonically increasing global revision. A proposal stores the registry revision at creation. Historical lookup uses binary search and preserves ordering even when delegation and proposal creation occur at the same block timestamp.

Only mandates active at proposal creation and lasting through the fixed close time are used. The voting interval is `[starts_at, ends_at)`; expiry exactly at `ends_at` is sufficient. Incoming mandates never propagate to another delegate.

`revoke(scope)` affects future proposals. For a current ballot, use `withdraw_representation(proposal_id)` to remove represented influence without adding an Abstain, or `vote` to override it with a direct ballot. An override remains effective through later delegate revotes. A direct vote after withdrawal restores participation. A delegate can withdraw their ballot using `vote_as_delegate(..., Choice::None)`.

A participant who is also a delegate uses separate methods for their own direct vote and their representative vote; a wallet may submit both in an account multicall.

## Proposal lifecycle

```text
Enrollment -> Scoring -> Ready -> Passed -> Queued -> Executed
                            \-> Defeated
Guardian may cancel any nonterminal proposal.
An expired queue can be cancelled permissionlessly.
```

1. **Create:** the publisher commits a nonzero evidence-manifest hash, recipient, and amount. The contract fixes the delegation revision, cutoff time, start, and close. Payment is bounded by the immutable per-proposal limit. All values are fixed; there is no edit function.
2. **Enroll:** the publisher submits aggregated participant inputs in batches. Mandates are resolved at the creation revision, not at enrollment time. Both enrollment and snapshot completion must happen before the fixed voting start.
3. **Freeze:** the publisher closes enrollment and validates component supply. After this call, inputs and denominators cannot change.
4. **Score:** anyone can advance `score_batch`, then call `open_voting` after all participants are scored. Partial snapshots cannot vote. A missed start requires cancellation and a new proposal.
5. **Vote:** account transactions authenticate callers; this version has no custom offchain-signature acceptance or relayer trust. The most recent direct action or delegate ballot is stored. Overrides are resolved per participant.
6. **Tally:** after close, anyone can advance `tally_batch`. Sequential cursors ensure each member is counted once. Ballots are closed before counting, making batching independent of ordering and concurrent callers.
7. **Finalize:** anyone can finalize after every participant is tallied. Quorum, minimum supporting weight, strict approval ratio, and minimum supporter count all must pass. Abstain contributes to quorum only; ties fail. Finalization does not reserve funds.
8. **Queue:** a passed proposal can reserve budget within `execution_window` seconds of voting close. Queueing starts a fresh `execution_delay`. Concurrent proposals share the same lifetime budget; reservations and already-spent amounts both consume it. If there is insufficient budget, a passed proposal cannot queue. When several approved proposals compete for remaining budget, successful queue transaction order determines reservation priority.
9. **Execute:** anyone can execute at or after the timelock and before `execute_after + execution_window`. The exact immutable recipient and amount are paid from this governor's ERC-20 balance. State and budget are updated before the token call; a failed transfer reverts them. Execution is single-use.
10. **Cancel/expire:** the guardian can cancel with a nonzero public reason hash, releasing any reservation. Anyone can release an expired queue. Cancelled proposals cannot be revived.

Enrollment, scoring, and tally calls accept batches of 1–100. The preparation script defaults to 10. Actual transaction gas and source sizes must be measured on the target network; the maximum batch size is a bound, not a guarantee that every batch of 100 fits a network's gas limit.

Tallies are final only after complete post-close counting. During voting, a client may calculate a provisional result from current ballots, but it must not display the stored partial tally as a finalized result.

## Roles, treasury, and policy

The constructor takes, in order: `publisher`, `guardian`, `delegation_registry`, `payment_token`, and `Policy` (field order in `types.cairo`). `configuration()` exposes those four addresses. `policy()` exposes all immutable settings.

- **Publisher:** attests the electorate and historical inputs, creates proposals, and freezes enrollment. Cannot change a frozen snapshot, submit another account's direct ballot, or bypass passage to spend.
- **Guardian:** can veto proposals with a public reason, including during the execution delay. Cannot rewrite votes, increase the budget, or transfer funds. This is an explicit censorship trust in the pilot; a malicious guardian can indefinitely block spending.
- **Participants/delegates:** transact from Starknet accounts, including smart accounts and multisigs. No private keys enter these tools.
- **Anyone:** can score, open a completed snapshot, tally, finalize, queue, execute, and expire a queue.

There are no upgrades, policy setters, role setters, generic arbitrary calls, or administrative withdrawals. Use appropriate multisig accounts for authorities; signer rotation belongs to those accounts. A policy change requires another deployment and fresh scoped mandates. Old proposals finish under the old deployment's rules.

The lifetime budget is denominated in the one configured token's raw units. Funding does not increase the budget. Fund only the intended capped allocation; excess funds cannot be swept by an admin. Repeated grants require explicit proposals. The contract does not escrow milestones, exchange assets, bridge execution, or discover a mainnet treasury. Use a known ERC-20 with standard boolean-returning transfer behavior; fee-on-transfer/rebasing behavior is outside this implementation's assumptions.

The publisher's manifest is an evidence commitment, not an onchain proof of its contents. The contract records submitted enrollment events and computes their weights; it does not compare those records against a decoded offchain manifest. An independent verifier must compare the submitted data against the committed evidence before voting and execution. A dispute currently goes to the guardian; there is no automatic fraud-proof adjudication.

## Offline preparation and independent verification

The files under `examples/` contain synthetic participants, balances, chain references, and policy values. They are runnable fixtures, not recommended live governance settings.

```sh
python3 scripts/snapshot.py examples/snapshot.json --output /tmp/snapshot-plan.json
python3 scripts/snapshot.py examples/snapshot.json \
  --ballots examples/ballots.json --output /tmp/expected-result.json
```

The builder emits a canonical manifest, its full SHA-256 digest, `manifest_hash = digest mod Starknet field prime`, exact per-participant weights and supply, `create_proposal` calldata, and enrollment calldata batches. Prefix each enrollment batch with the actual returned proposal ID. All large amounts are decimal strings; addresses and participant IDs use normalized hexadecimal strings. The full digest should be retained in the public archive.

To compare an independently obtained chain export:

```sh
python3 scripts/snapshot.py /path/to/source.json \
  --ballots /path/to/ballot-state.json \
  --verify /path/to/chain-export.json --output /tmp/verified-result.json
```

The export must contain `manifest_hash`, `weights` (participant-ID-to-decimal-weight mapping), `total_power`, and, when ballots are supplied, `tally` in the output schema. The ballot-state export contains the last direct actions and delegate ballots before close, plus each participant's historical active mandate at the stored creation revision. Omit a revoked mandate; a direct `"None"` means explicit withdrawal. Validate the export's scope against the governor and registry addresses before running the tool.

The script recomputes arithmetic, expiry, overrides, and passage, and rejects mismatches. It does **not** fetch RPC data, verify signatures, prove log completeness or canonicality, or verify identity/ownership attestations. Supply authentic complete finalized exports and independently check chain hashes. Missing ballots can only be detected by comparison against authoritative chain data.

## Deployment rehearsal

Deployment is intentionally a separate operation; nothing in CI or the preparation script submits transactions.

1. Run all local checks and review the compiled ABI, constructor policy, and compiler versions. Choose explicit coefficients and thresholds after analyzing actual distribution and turnout. Start with `xp_bps = 0`.
2. Declare and deploy `DelegationRegistry` on a local devnet or Sepolia using a test account. It has no constructor arguments. Declare `RealmsGovernor` and deploy with test authority accounts, that registry, a test token, and the reviewed `Policy`.
3. Read `configuration()` and `policy()` back, verify contract class hashes, and archive deployment receipts. No proxy or Snapshot X execution adapter is involved.
4. Register test mandates, prepare a finalized-source manifest, create and enroll a proposal, and complete scoring before its start. Verify every member and the exact total supply against the offline builder. Archive the input manifest and transaction/event receipts.
5. Exercise a delegate vote, direct override, withdrawal, and revote. After close, tally and compare independently, then finalize and queue. Fund only a small test allocation. Verify early execution rejects and a successful payment cannot replay.
6. Rehearse dispute cancellation and queue expiry. Measure batch gas, loss of publisher availability, key recovery, evidence archival and restore, RPC/indexer lag, and the client experience before connecting any real treasury.

The application still uses the existing Snapshot X hooks. Portal integration needs new ABIs/addresses and proposal lifecycle handling; the existing `authenticate_vote` and Realm `delegate` calls cannot operate these contracts. Production identity admission/appeals, historical ownership and stake verification, XP ingestion, indexers, notifications, a public evidence archive, and an operational dispute process remain integration work.
