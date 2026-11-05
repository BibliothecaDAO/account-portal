use realms_governance::delegation::IDelegationRegistryDispatcherTrait;
use realms_governance::governor::{
    IRealmsGovernorDispatcherTrait, IRealmsGovernorSafeDispatcher,
    IRealmsGovernorSafeDispatcherTrait,
};
use realms_governance::types::{Choice, Enrollment, POWER_SCALE, Stage};
use snforge_std::start_cheat_block_timestamp_global;
use super::helpers::{
    addr, as_voter, assert_error, enrollment, finish, grant, policy, publish, setup,
    setup_with_policy,
};
use super::mocks::IMockTokenDispatcherTrait;

#[test]
fn owner_override_and_withdrawal_survive_delegate_revotes() {
    let f = setup();
    grant(f, 10, 50, 2_000);
    grant(f, 20, 50, 2_000);
    grant(f, 30, 50, 2_000);
    let id = publish(f, array![enrollment(10, 1), enrollment(20, 1), enrollment(30, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 50);
    f.governor.vote_as_delegate(id, Choice::For);
    as_voter(f, 10);
    f.governor.vote(id, Choice::Against);
    as_voter(f, 20);
    f.governor.withdraw_representation(id);
    as_voter(f, 50);
    f.governor.vote_as_delegate(id, Choice::Abstain);
    assert(f.governor.effective_choice(id, 10) == Choice::Against, 'OWNER_OVERRIDE');
    assert(f.governor.effective_choice(id, 20) == Choice::None, 'WITHDRAWAL_PERSISTS');
    assert(f.governor.effective_choice(id, 30) == Choice::Abstain, 'DELEGATE_REVOTE');
    finish(f, id);
    let p = f.governor.proposal(id);
    let weight = f.governor.member(id, 10).weight;
    assert(p.tally.against_votes == weight && p.tally.abstain_votes == weight, 'COUNT_ONCE');
    assert(p.total_power == weight * 3, 'FIXED_DENOMINATOR');
    assert(p.tally.for_votes == 0 && p.stage == Stage::Defeated, 'NO_APPROVAL');
}

#[test]
fn direct_vote_before_delegate_and_after_withdrawal() {
    let f = setup();
    grant(f, 10, 50, 2_000);
    let id = publish(f, array![enrollment(10, 100)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::Abstain);
    as_voter(f, 50);
    f.governor.vote_as_delegate(id, Choice::For);
    assert(f.governor.effective_choice(id, 10) == Choice::Abstain, 'DIRECT_FIRST');
    as_voter(f, 10);
    f.governor.withdraw_representation(id);
    assert(f.governor.effective_choice(id, 10) == Choice::None, 'WITHDRAW_DIRECT');
    f.governor.vote(id, Choice::For);
    finish(f, id);
    assert(f.governor.proposal(id).tally.for_votes == POWER_SCALE, 'LATEST_DIRECT');
    assert(f.governor.proposal(id).tally.supporters == 1, 'ONE_SUPPORTER');
}

#[test]
fn delegation_must_last_through_close_and_never_redelegates() {
    let f = setup();
    grant(f, 10, 50, 1_299);
    grant(f, 20, 50, 1_300);
    grant(f, 50, 60, 2_000);
    let id = publish(f, array![enrollment(10, 1), enrollment(20, 1), enrollment(50, 1)].span());
    assert(f.governor.member(id, 10).delegate == addr(0), 'SHORT_MANDATE_EXCLUDED');
    assert(f.governor.member(id, 20).delegate == addr(50), 'EXACT_CLOSE_ALLOWED');
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 60);
    f.governor.vote_as_delegate(id, Choice::For);
    assert(f.governor.effective_choice(id, 20) == Choice::None, 'NO_TRANSITIVE_DELEGATION');
    assert(f.governor.effective_choice(id, 50) == Choice::For, 'ONLY_OWN_MANDATE');
    as_voter(f, 50);
    f.governor.vote_as_delegate(id, Choice::Against);
    assert(f.governor.effective_choice(id, 20) == Choice::Against, 'SINGLE_HOP');
    as_voter(f, 10);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    let p = f.governor.proposal(id);
    assert(p.tally.supporters == 2, 'DIRECT_RETAINS_RIGHT');
}

#[test]
fn enrollment_uses_creation_revision_despite_same_block_renewal() {
    let f = setup();
    grant(f, 10, 50, 2_000);
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    grant(f, 10, 60, 2_000);
    f.governor.enroll(id, array![enrollment(10, 1)].span());
    assert(f.governor.member(id, 10).delegate == addr(50), 'FROZEN_MANDATE');
    f.registry.revoke(f.governor.contract_address);
    assert(f.governor.member(id, 10).delegate == addr(50), 'REVOCATION_FOR_FUTURE');
    let next = f.governor.create_proposal('next_manifest', addr(999), 100);
    f.governor.enroll(next, array![enrollment(10, 1)].span());
    assert(f.governor.member(next, 10).delegate == addr(0), 'NEXT_SNAPSHOT_REVOKED');
}

#[test]
#[feature("safe_dispatcher")]
fn duplicate_identity_or_controller_cannot_enter_snapshot() {
    let f = setup();
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    f.governor.enroll(id, array![enrollment(10, 1)].span());
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    assert_error(safe.enroll(id, array![enrollment(10, 100)].span()), 'DUPLICATE_PARTICIPANT');
    let duplicate = Enrollment {
        participant: 20, controller: addr(10), realms: 1, velords: 0, xp: 0,
    };
    assert_error(safe.enroll(id, array![duplicate].span()), 'DUPLICATE_CONTROLLER');
    assert_error(safe.enroll(id, array![enrollment(30, 0)].span()), 'NO_ELIGIBLE_ASSETS');
    assert(f.governor.proposal(id).member_count == 1, 'FAILED_ENROLLMENT_ATOMIC');
}

#[test]
#[feature("safe_dispatcher")]
fn immutable_snapshot_and_complete_scoring_are_required() {
    let f = setup();
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    assert_error(safe.freeze_snapshot(id), 'EMPTY_SNAPSHOT');
    f.governor.enroll(id, array![enrollment(10, 1), enrollment(20, 4)].span());
    f.governor.freeze_snapshot(id);
    assert_error(safe.enroll(id, array![enrollment(30, 1)].span()), 'SNAPSHOT_FROZEN');
    assert_error(safe.open_voting(id), 'INCOMPLETE_SNAPSHOT');
    f.governor.score_batch(id, 1);
    assert_error(safe.open_voting(id), 'INCOMPLETE_SNAPSHOT');
    f.governor.score_batch(id, 100);
    assert_error(safe.score_batch(id, 1), 'SCORING_COMPLETE');
    assert(f.governor.member(id, 20).weight == 666_666_666_666_666_666, 'ROOT_BEFORE_AGGREGATION');
    assert(f.governor.proposal(id).total_power == 999_999_999_999_999_999, 'EXACT_ROUNDED_SUPPLY');
    f.governor.open_voting(id);
}

#[test]
#[feature("safe_dispatcher")]
fn boundary_times_and_incomplete_tally_cannot_be_bypassed() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1), enrollment(20, 1)].span());
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    as_voter(f, 10);
    assert_error(safe.vote(id, Choice::For), 'VOTING_CLOSED');
    start_cheat_block_timestamp_global(1_100);
    f.governor.vote(id, Choice::For);
    assert_error(safe.tally_batch(id, 1), 'VOTING_NOT_ENDED');
    start_cheat_block_timestamp_global(1_300);
    assert_error(safe.vote(id, Choice::Against), 'VOTING_CLOSED');
    assert_error(safe.finalize(id), 'INCOMPLETE_TALLY');
    f.governor.tally_batch(id, 1);
    assert_error(safe.finalize(id), 'INCOMPLETE_TALLY');
    f.governor.tally_batch(id, 1);
    assert_error(safe.tally_batch(id, 1), 'TALLY_COMPLETE');
    f.governor.finalize(id);
    assert(f.governor.proposal(id).tally.for_votes == POWER_SCALE / 2, 'BATCH_NO_DOUBLE_COUNT');
}

#[test]
#[feature("safe_dispatcher")]
fn authority_and_batch_guards() {
    let f = setup();
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    as_voter(f, 10);
    assert_error(safe.create_proposal('manifest', addr(999), 100), 'ONLY_PUBLISHER');
    as_voter(f, 1);
    assert_error(safe.create_proposal(0, addr(999), 100), 'MISSING_MANIFEST');
    assert_error(safe.create_proposal('manifest', addr(999), 101), 'INVALID_PAYMENT');
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    assert_error(safe.enroll(id, array![].span()), 'INVALID_BATCH_SIZE');
    assert_error(safe.score_batch(id, 101), 'INVALID_BATCH_SIZE');
    assert_error(safe.cancel(id, 'reason'), 'ONLY_GUARDIAN');
    as_voter(f, 10);
    assert_error(safe.freeze_snapshot(id), 'ONLY_PUBLISHER');
    assert_error(safe.enroll(id, array![enrollment(10, 1)].span()), 'ONLY_PUBLISHER');
}

#[test]
#[feature("safe_dispatcher")]
fn voting_requires_snapshot_membership_and_valid_choice() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1)].span());
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 20);
    assert_error(safe.vote(id, Choice::For), 'NOT_A_PARTICIPANT');
    assert_error(safe.withdraw_representation(id), 'NOT_A_PARTICIPANT');
    as_voter(f, 10);
    assert_error(safe.vote(id, Choice::None), 'INVALID_CHOICE');
}

#[test]
#[feature("safe_dispatcher")]
fn payment_is_delayed_exact_and_cannot_repeat_or_reenter() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1)].span());
    f.token.mint(f.governor.contract_address, 150);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    f.governor.queue(id);
    assert(f.governor.budget_usage() == (100, 0), 'RESERVATION');
    assert_error(safe.execute(id), 'TIMELOCK_ACTIVE');
    start_cheat_block_timestamp_global(1_350);
    f.token.set_reentry(f.governor.contract_address, id);
    f.governor.execute(id);
    assert(f.token.reentry_failed(), 'REENTRY_REJECTED');
    assert(f.token.balance_of(addr(999)) == 100, 'EXACT_RECIPIENT_AMOUNT');
    assert(f.token.balance_of(f.governor.contract_address) == 50, 'TREASURY_BALANCE');
    assert(f.governor.budget_usage() == (0, 100), 'SPENT_ACCOUNTING');
    assert_error(safe.execute(id), 'NOT_QUEUED');
    assert_error(safe.queue(id), 'PROPOSAL_NOT_PASSED');
    as_voter(f, 2);
    assert_error(safe.cancel(id, 'reason'), 'TERMINAL_PROPOSAL');
}

#[test]
#[feature("safe_dispatcher")]
fn failed_payment_rolls_back_reservation_and_status() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1)].span());
    f.token.mint(f.governor.contract_address, 100);
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    f.governor.queue(id);
    start_cheat_block_timestamp_global(1_350);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    f.token.set_failure(true);
    assert_error(safe.execute(id), 'TRANSFER_FAILED');
    assert(f.governor.proposal(id).stage == Stage::Queued, 'STATUS_ROLLED_BACK');
    assert(f.governor.budget_usage() == (100, 0), 'BUDGET_ROLLED_BACK');
    f.token.set_failure(false);
    f.governor.execute(id);
    assert(f.token.balance_of(addr(999)) == 100, 'RETRY_SUCCEEDS');
}

#[test]
#[feature("safe_dispatcher")]
fn concurrent_proposals_share_budget_and_cancel_releases_it() {
    let f = setup();
    let first = publish(f, array![enrollment(10, 1)].span());
    let second = publish(f, array![enrollment(10, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(first, Choice::For);
    f.governor.vote(second, Choice::For);
    finish(f, first);
    finish(f, second);
    f.governor.queue(first);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    assert_error(safe.queue(second), 'BUDGET_EXCEEDED');
    as_voter(f, 2);
    assert_error(safe.cancel(first, 0), 'MISSING_REASON');
    f.governor.cancel(first, 'disputed_snapshot');
    assert(f.governor.budget_usage() == (0, 0), 'RELEASED');
    f.governor.queue(second);
    assert(f.governor.budget_usage() == (100, 0), 'NEW_RESERVATION');
    assert_error(safe.execute(first), 'NOT_QUEUED');
}

#[test]
#[feature("safe_dispatcher")]
fn expired_queue_is_permissionlessly_released() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    f.governor.queue(id);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    start_cheat_block_timestamp_global(1_449);
    assert_error(safe.expire_queue(id), 'NOT_EXPIRED');
    start_cheat_block_timestamp_global(1_450);
    assert_error(safe.execute(id), 'EXECUTION_EXPIRED');
    f.governor.expire_queue(id);
    assert(f.governor.proposal(id).stage == Stage::Cancelled, 'EXPIRED_STAGE');
    assert(f.governor.budget_usage() == (0, 0), 'BUDGET_RELEASED');
}

#[test]
fn abstention_and_nonparticipation_cannot_manufacture_approval() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 100), enrollment(20, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::Abstain);
    as_voter(f, 20);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    // 9.09% For is below the 10% eligible-supply floor despite full participation.
    assert(f.governor.proposal(id).stage == Stage::Defeated, 'YES_FLOOR_ENFORCED');
}

#[test]
fn breadth_counts_represented_participants_not_delegate_transactions() {
    let mut p = policy();
    p.minimum_supporters = 2;
    let f = setup_with_policy(p);
    grant(f, 10, 50, 2_000);
    grant(f, 20, 50, 2_000);
    let id = publish(f, array![enrollment(10, 1), enrollment(20, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 50);
    f.governor.vote_as_delegate(id, Choice::For);
    f.governor.vote_as_delegate(id, Choice::For);
    finish(f, id);
    let proposal = f.governor.proposal(id);
    assert(proposal.tally.supporters == 2, 'TWO_PARTICIPANTS');
    assert(proposal.tally.for_votes == POWER_SCALE, 'ONE_COUNT_PER_MEMBER');
    assert(proposal.stage == Stage::Passed, 'BREADTH_PASSED');
}

#[test]
#[feature("safe_dispatcher")]
fn snapshots_cannot_open_after_the_published_start() {
    let f = setup();
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    f.governor.enroll(id, array![enrollment(10, 1)].span());
    f.governor.freeze_snapshot(id);
    f.governor.score_batch(id, 1);
    start_cheat_block_timestamp_global(1_100);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    assert_error(safe.open_voting(id), 'SNAPSHOT_TOO_LATE');
}

#[test]
#[feature("safe_dispatcher")]
fn stale_approved_proposal_cannot_reserve_new_funds() {
    let f = setup();
    let id = publish(f, array![enrollment(10, 1)].span());
    start_cheat_block_timestamp_global(1_100);
    as_voter(f, 10);
    f.governor.vote(id, Choice::For);
    finish(f, id);
    start_cheat_block_timestamp_global(1_400);
    let safe = IRealmsGovernorSafeDispatcher { contract_address: f.governor.contract_address };
    assert_error(safe.queue(id), 'QUEUE_EXPIRED');
    assert(f.governor.budget_usage() == (0, 0), 'NO_RESERVATION');
}
