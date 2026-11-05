use realms_governance::delegation::{
    IDelegationRegistryDispatcher, IDelegationRegistryDispatcherTrait,
};
use realms_governance::governor::{IRealmsGovernorDispatcher, IRealmsGovernorDispatcherTrait};
use realms_governance::types::{Enrollment, Policy};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp_global,
    start_cheat_caller_address,
};
use starknet::{ContractAddress, SyscallResultTrait};
use super::mocks::IMockTokenDispatcher;

pub fn addr(value: felt252) -> ContractAddress {
    value.try_into().unwrap()
}

pub fn policy() -> Policy {
    Policy {
        version: 'test_v1',
        realm_bps: 10_000,
        velords_bps: 0,
        xp_bps: 0,
        quorum_bps: 2_000,
        minimum_yes_bps: 1_000,
        approval_bps: 5_000,
        minimum_supporters: 1,
        voting_delay: 100,
        voting_period: 200,
        execution_delay: 50,
        execution_window: 100,
        maximum_payment: 100,
        total_budget: 150,
    }
}

pub fn deploy_registry() -> IDelegationRegistryDispatcher {
    let class = declare("DelegationRegistry").unwrap_syscall().contract_class();
    let (contract_address, _) = class.deploy(@array![]).unwrap_syscall();
    IDelegationRegistryDispatcher { contract_address }
}

#[derive(Copy, Drop)]
pub struct Fixture {
    pub governor: IRealmsGovernorDispatcher,
    pub registry: IDelegationRegistryDispatcher,
    pub token: IMockTokenDispatcher,
}

pub fn setup_with_policy(policy: Policy) -> Fixture {
    start_cheat_block_timestamp_global(1_000);
    let registry = deploy_registry();
    let token_class = declare("MockToken").unwrap_syscall().contract_class();
    let (token, _) = token_class.deploy(@array![]).unwrap_syscall();
    let class = declare("RealmsGovernor").unwrap_syscall().contract_class();
    let mut calldata = array![];
    addr(1).serialize(ref calldata);
    addr(2).serialize(ref calldata);
    registry.contract_address.serialize(ref calldata);
    token.serialize(ref calldata);
    policy.serialize(ref calldata);
    let (contract_address, _) = class.deploy(@calldata).unwrap_syscall();
    start_cheat_caller_address(contract_address, addr(1));
    Fixture {
        governor: IRealmsGovernorDispatcher { contract_address },
        registry,
        token: IMockTokenDispatcher { contract_address: token },
    }
}

pub fn setup() -> Fixture {
    setup_with_policy(policy())
}

pub fn enrollment(id: felt252, realms: u128) -> Enrollment {
    Enrollment { participant: id, controller: addr(id), realms, velords: 0, xp: 0 }
}

pub fn publish(f: Fixture, members: Span<Enrollment>) -> u64 {
    start_cheat_caller_address(f.governor.contract_address, addr(1));
    let id = f.governor.create_proposal('manifest', addr(999), 100);
    f.governor.enroll(id, members);
    f.governor.freeze_snapshot(id);
    f.governor.score_batch(id, 100);
    f.governor.open_voting(id);
    id
}

pub fn as_voter(f: Fixture, id: felt252) {
    start_cheat_caller_address(f.governor.contract_address, addr(id));
}

pub fn grant(f: Fixture, owner: felt252, delegate: felt252, expires: u64) {
    start_cheat_caller_address(f.registry.contract_address, addr(owner));
    f.registry.delegate(f.governor.contract_address, addr(delegate), expires);
}

pub fn finish(f: Fixture, id: u64) {
    start_cheat_block_timestamp_global(1_300);
    f.governor.tally_batch(id, 100);
    f.governor.finalize(id);
}

pub fn assert_error<T, +Drop<T>>(result: Result<T, Array<felt252>>, expected: felt252) {
    match result {
        Result::Ok(_) => panic!("Expected rejection"),
        Result::Err(data) => assert(*data.at(0) == expected, *data.at(0)),
    }
}
