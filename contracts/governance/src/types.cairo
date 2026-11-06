use starknet::ContractAddress;

pub const BPS: u256 = 10_000;
pub const POWER_SCALE: u256 = 1_000_000_000_000_000_000;
pub const MAX_MANDATE_SECONDS: u64 = 90 * 24 * 60 * 60;
pub const MAX_BATCH: u32 = 100;

#[derive(Copy, Drop, Serde, Debug, Default, PartialEq, starknet::Store)]
pub enum Choice {
    #[default]
    None,
    Against,
    For,
    Abstain,
}

#[derive(Copy, Drop, Serde, Debug, Default, PartialEq, starknet::Store)]
pub enum Stage {
    #[default]
    Missing,
    Enrollment,
    Scoring,
    Ready,
    Passed,
    Defeated,
    Queued,
    Executed,
    Cancelled,
}

#[derive(Copy, Drop, Serde, Debug, Default, PartialEq, starknet::Store)]
pub struct Components {
    pub realms: u256,
    pub velords: u256,
    pub xp: u256,
}

// Inputs are raw base units, aggregated per attested participant BEFORE weighting.
#[derive(Copy, Drop, Serde, Debug)]
pub struct Enrollment {
    pub participant: felt252,
    pub controller: ContractAddress,
    pub realms: u128,
    pub velords: u128,
    pub xp: u128,
}

#[derive(Copy, Drop, Serde, Debug, starknet::Store)]
pub struct Policy {
    pub version: felt252,
    pub realm_bps: u16,
    pub velords_bps: u16,
    pub xp_bps: u16,
    pub quorum_bps: u16,
    pub minimum_yes_bps: u16,
    pub approval_bps: u16,
    pub minimum_supporters: u32,
    pub voting_delay: u64,
    pub voting_period: u64,
    pub execution_delay: u64,
    pub execution_window: u64,
    pub maximum_payment: u128,
    pub total_budget: u128,
}

#[derive(Copy, Drop, Serde, Debug, starknet::Store)]
pub struct Mandate {
    pub revision: u64,
    pub starts_at: u64,
    pub expires_at: u64,
    pub delegate: ContractAddress,
}

#[derive(Copy, Drop, Serde, Debug, starknet::Store)]
pub struct Member {
    pub controller: ContractAddress,
    pub delegate: ContractAddress,
    pub roots: Components,
    pub weight: u256,
    pub scored: bool,
    pub tallied: bool,
}

#[derive(Copy, Drop, Serde, Debug, Default, starknet::Store)]
pub struct DirectBallot {
    pub overridden: bool,
    pub choice: Choice,
}

#[derive(Copy, Drop, Serde, Debug, Default, starknet::Store)]
pub struct Tally {
    pub for_votes: u256,
    pub against_votes: u256,
    pub abstain_votes: u256,
    pub supporters: u32,
}

#[derive(Copy, Drop, Serde, Debug, starknet::Store)]
pub struct Proposal {
    pub stage: Stage,
    pub manifest_hash: felt252,
    pub cutoff_time: u64,
    pub delegation_revision: u64,
    pub starts_at: u64,
    pub ends_at: u64,
    pub execute_after: u64,
    pub recipient: ContractAddress,
    pub amount: u128,
    pub member_count: u32,
    pub scored_count: u32,
    pub tallied_count: u32,
    pub roots: Components,
    pub total_power: u256,
    pub tally: Tally,
}
