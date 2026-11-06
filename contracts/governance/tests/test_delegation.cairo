use realms_governance::delegation::{
    IDelegationRegistryDispatcherTrait, IDelegationRegistrySafeDispatcher,
    IDelegationRegistrySafeDispatcherTrait,
};
use realms_governance::types::MAX_MANDATE_SECONDS;
use snforge_std::{start_cheat_block_timestamp_global, start_cheat_caller_address};
use super::helpers::{addr, assert_error, deploy_registry};

#[test]
fn revisions_preserve_same_block_history_and_scopes() {
    let registry = deploy_registry();
    start_cheat_block_timestamp_global(1_000);
    start_cheat_caller_address(registry.contract_address, addr(10));
    registry.delegate(addr(100), addr(20), 2_000);
    let first = registry.revision();
    registry.delegate(addr(101), addr(30), 3_000);
    registry.delegate(addr(100), addr(40), 4_000);
    let third = registry.revision();
    registry.revoke(addr(100));
    assert(registry.mandate_at(addr(10), addr(100), 0).revision == 0, 'NO_INITIAL_MANDATE');
    assert(
        registry.mandate_at(addr(10), addr(100), first).delegate == addr(20), 'FIRST_CHECKPOINT',
    );
    assert(
        registry.mandate_at(addr(10), addr(100), third).delegate == addr(40), 'REPLACED_CHECKPOINT',
    );
    assert(
        registry.mandate_at(addr(10), addr(100), registry.revision()).delegate == addr(0),
        'REVOKED',
    );
    assert(
        registry.mandate_at(addr(10), addr(101), registry.revision()).delegate == addr(30),
        'SCOPE_ISOLATED',
    );
}

#[test]
#[feature("safe_dispatcher")]
fn reject_invalid_mandates() {
    let registry = deploy_registry();
    let safe = IDelegationRegistrySafeDispatcher { contract_address: registry.contract_address };
    start_cheat_block_timestamp_global(1_000);
    start_cheat_caller_address(registry.contract_address, addr(10));
    assert_error(safe.delegate(addr(100), addr(10), 2_000), 'SELF_DELEGATION');
    assert_error(safe.delegate(addr(100), addr(20), 1_000), 'MANDATE_ALREADY_EXPIRED');
    assert_error(
        safe.delegate(addr(100), addr(20), 1_001 + MAX_MANDATE_SECONDS), 'MANDATE_TOO_LONG',
    );
    assert_error(safe.delegate(addr(0), addr(20), 2_000), 'ZERO_ADDRESS');
    assert_error(safe.mandate_at(addr(10), addr(100), 1), 'FUTURE_REVISION');
    registry.delegate(addr(100), addr(20), 1_000 + MAX_MANDATE_SECONDS);
    assert(registry.revision() == 1, 'MAX_DURATION_ACCEPTED');
}
