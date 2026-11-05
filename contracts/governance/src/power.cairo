use super::types::{BPS, Components, POWER_SCALE, Policy, Tally};

// The u128 input bound makes input * 10^18 and all Newton intermediates fit u256.
// Nine fractional square-root digits avoid floor(sqrt(2)) == floor(sqrt(1)).
pub fn scaled_sqrt(input: u128) -> u256 {
    let n: u256 = input.into() * POWER_SCALE;
    if n == 0 {
        return 0;
    }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x
}

pub fn validate_policy(policy: Policy) {
    assert(policy.version != 0, 'ZERO_POLICY_VERSION');
    let sum: u32 = policy.realm_bps.into() + policy.velords_bps.into() + policy.xp_bps.into();
    assert(sum == 10_000, 'INVALID_BLEND');
    assert(policy.quorum_bps > 0 && policy.quorum_bps <= 10_000, 'INVALID_QUORUM');
    assert(policy.minimum_yes_bps > 0 && policy.minimum_yes_bps <= 10_000, 'INVALID_YES_FLOOR');
    assert(policy.approval_bps >= 5_000 && policy.approval_bps < 10_000, 'INVALID_APPROVAL');
    assert(policy.minimum_supporters > 0, 'ZERO_SUPPORTERS');
    assert(policy.voting_delay > 0 && policy.voting_period > 0, 'INVALID_VOTING_TIME');
    assert(policy.execution_delay > 0 && policy.execution_window > 0, 'INVALID_EXECUTION_TIME');
    assert(policy.maximum_payment > 0, 'ZERO_PAYMENT_LIMIT');
    assert(policy.total_budget >= policy.maximum_payment, 'INVALID_BUDGET');
}

pub fn validate_denominators(policy: Policy, totals: Components) {
    assert(policy.realm_bps == 0 || totals.realms > 0, 'EMPTY_REALM_COMPONENT');
    assert(policy.velords_bps == 0 || totals.velords > 0, 'EMPTY_VELORDS_COMPONENT');
    assert(policy.xp_bps == 0 || totals.xp > 0, 'EMPTY_XP_COMPONENT');
}

fn component_weight(root: u256, total: u256, bps: u16) -> u256 {
    if bps == 0 {
        return 0;
    }
    // Component allocations are exact integers because POWER_SCALE is divisible by BPS.
    root * (POWER_SCALE / BPS) * bps.into() / total
}

pub fn voting_power(roots: Components, totals: Components, policy: Policy) -> u256 {
    validate_denominators(policy, totals);
    component_weight(roots.realms, totals.realms, policy.realm_bps)
        + component_weight(roots.velords, totals.velords, policy.velords_bps)
        + component_weight(roots.xp, totals.xp, policy.xp_bps)
}

pub fn passes(tally: Tally, total_power: u256, policy: Policy) -> bool {
    if total_power == 0 || tally.for_votes + tally.against_votes == 0 {
        return false;
    }
    let participation = tally.for_votes + tally.against_votes + tally.abstain_votes;
    participation
        * BPS >= total_power
        * policy.quorum_bps.into() && tally.for_votes
        * BPS >= total_power
        * policy.minimum_yes_bps.into() && tally.for_votes
        * BPS > (tally.for_votes + tally.against_votes)
        * policy.approval_bps.into() && tally.supporters >= policy.minimum_supporters
}

// A pure helper for the later grant-round ballot. Budgets remain per participant.
pub fn quadratic_cost(votes: Span<u64>) -> u256 {
    assert(votes.len() <= 100, 'TOO_MANY_OPTIONS');
    let mut cost: u256 = 0;
    for vote in votes {
        let value: u256 = (*vote).into();
        cost += value * value;
    }
    cost
}
