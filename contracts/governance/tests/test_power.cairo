use realms_governance::power::{passes, quadratic_cost, scaled_sqrt, validate_policy, voting_power};
use realms_governance::types::{Components, POWER_SCALE, Tally};
use super::helpers::policy;

#[test]
fn sqrt_keeps_fractional_influence() {
    assert(scaled_sqrt(0) == 0, 'ZERO');
    assert(scaled_sqrt(1) == 1_000_000_000, 'ONE');
    assert(scaled_sqrt(2) == 1_414_213_562, 'FRACTIONAL');
    assert(scaled_sqrt(100) == 10_000_000_000, 'HUNDRED');
}

#[test]
#[fuzzer(runs: 128)]
fn sqrt_is_exact_floor(input: u128) {
    let root = scaled_sqrt(input);
    let value: u256 = input.into() * POWER_SCALE;
    assert(root * root <= value, 'ROOT_TOO_LARGE');
    assert((root + 1) * (root + 1) > value, 'ROOT_TOO_SMALL');
}

#[test]
fn whale_vs_distributed_participants() {
    let totals = Components { realms: 110_000_000_000, velords: 0, xp: 0 };
    let whale = voting_power(
        Components { realms: scaled_sqrt(100), velords: 0, xp: 0 }, totals, policy(),
    );
    let person = voting_power(
        Components { realms: scaled_sqrt(1), velords: 0, xp: 0 }, totals, policy(),
    );
    assert(whale == 90_909_090_909_090_909, 'WHALE_SHARE');
    assert(person * 100 > whale * 9, 'BREADTH');
    assert(whale + person * 100 <= POWER_SCALE, 'SUPPLY_BOUND');
}

#[test]
fn blend_preserves_component_allocations() {
    let mut p = policy();
    p.realm_bps = 6_000;
    p.velords_bps = 4_000;
    let totals = Components { realms: scaled_sqrt(100), velords: scaled_sqrt(9), xp: 0 };
    let realms = voting_power(Components { realms: totals.realms, velords: 0, xp: 0 }, totals, p);
    let stake = voting_power(Components { realms: 0, velords: totals.velords, xp: 0 }, totals, p);
    assert(realms == 600_000_000_000_000_000, 'REALM_ALLOCATION');
    assert(stake == 400_000_000_000_000_000, 'STAKE_ALLOCATION');
    assert(realms + stake == POWER_SCALE, 'BLEND_SUPPLY');
}

#[test]
#[should_panic(expected: 'EMPTY_XP_COMPONENT')]
fn positive_xp_allocation_requires_evidence() {
    let mut p = policy();
    p.realm_bps = 8_000;
    p.xp_bps = 2_000;
    voting_power(
        Components { realms: 1, velords: 0, xp: 0 }, Components { realms: 1, velords: 0, xp: 0 }, p,
    );
}

#[test]
fn approval_quorum_yes_floor_and_breadth_are_independent() {
    let mut p = policy();
    p.minimum_supporters = 2;
    let mut tally = Tally { for_votes: 11, against_votes: 0, abstain_votes: 9, supporters: 2 };
    assert(passes(tally, 100, p), 'SHOULD_PASS');
    tally.supporters = 1;
    assert(!passes(tally, 100, p), 'BREADTH_REQUIRED');
    tally.supporters = 2;
    tally.abstain_votes = 0;
    assert(!passes(tally, 100, p), 'QUORUM_REQUIRED');
    tally.for_votes = 9;
    tally.abstain_votes = 11;
    assert(!passes(tally, 100, p), 'YES_FLOOR_REQUIRED');
    tally.for_votes = 10;
    tally.against_votes = 10;
    assert(!passes(tally, 100, p), 'TIE_FAILS');
    tally.for_votes = 0;
    tally.against_votes = 0;
    tally.abstain_votes = 100;
    assert(!passes(tally, 100, p), 'ABSTAIN_NOT_APPROVAL');
}

#[test]
#[should_panic(expected: 'INVALID_BLEND')]
fn reject_invalid_policy() {
    let mut p = policy();
    p.realm_bps = 9_999;
    validate_policy(p);
}

#[test]
fn quadratic_grant_cost_is_per_participant() {
    assert(quadratic_cost(array![3, 4].span()) == 25, 'SQUARE_COST');
    assert(quadratic_cost(array![1].span()) * 10 == 10, 'TEN_PEOPLE');
    assert(quadratic_cost(array![10].span()) == 100, 'POOLED_COST_DIFFERS');
}
