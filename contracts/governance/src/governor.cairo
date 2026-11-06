use starknet::ContractAddress;
use super::types::{Choice, Enrollment, Member, Policy, Proposal};

#[starknet::interface]
pub trait IRealmsGovernor<TContractState> {
    fn create_proposal(
        ref self: TContractState, manifest_hash: felt252, recipient: ContractAddress, amount: u128,
    ) -> u64;
    fn enroll(ref self: TContractState, proposal_id: u64, members: Span<Enrollment>);
    fn freeze_snapshot(ref self: TContractState, proposal_id: u64);
    fn score_batch(ref self: TContractState, proposal_id: u64, count: u32);
    fn open_voting(ref self: TContractState, proposal_id: u64);
    fn vote(ref self: TContractState, proposal_id: u64, choice: Choice);
    fn withdraw_representation(ref self: TContractState, proposal_id: u64);
    fn vote_as_delegate(ref self: TContractState, proposal_id: u64, choice: Choice);
    fn tally_batch(ref self: TContractState, proposal_id: u64, count: u32);
    fn finalize(ref self: TContractState, proposal_id: u64);
    fn queue(ref self: TContractState, proposal_id: u64);
    fn execute(ref self: TContractState, proposal_id: u64);
    fn cancel(ref self: TContractState, proposal_id: u64, reason_hash: felt252);
    fn expire_queue(ref self: TContractState, proposal_id: u64);
    fn policy(self: @TContractState) -> Policy;
    fn proposal(self: @TContractState, proposal_id: u64) -> Proposal;
    fn member(self: @TContractState, proposal_id: u64, participant: felt252) -> Member;
    fn participant_at(self: @TContractState, proposal_id: u64, index: u32) -> felt252;
    fn effective_choice(self: @TContractState, proposal_id: u64, participant: felt252) -> Choice;
    fn budget_usage(self: @TContractState) -> (u128, u128);
    fn configuration(
        self: @TContractState,
    ) -> (ContractAddress, ContractAddress, ContractAddress, ContractAddress);
}

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::contract]
pub mod RealmsGovernor {
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::super::delegation::{
        IDelegationRegistryDispatcher, IDelegationRegistryDispatcherTrait,
    };
    use super::super::power::{
        passes, scaled_sqrt, validate_denominators, validate_policy, voting_power,
    };
    use super::super::types::{
        Choice, Components, DirectBallot, Enrollment, MAX_BATCH, Member, Policy, Proposal, Stage,
    };
    use super::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        policy: Policy,
        publisher: ContractAddress,
        guardian: ContractAddress,
        delegation_registry: ContractAddress,
        payment_token: ContractAddress,
        proposal_count: u64,
        proposals: Map<u64, Proposal>,
        members: Map<(u64, felt252), Member>,
        participant_ids: Map<(u64, u32), felt252>,
        controllers: Map<(u64, ContractAddress), felt252>,
        direct_ballots: Map<(u64, felt252), DirectBallot>,
        delegate_ballots: Map<(u64, ContractAddress), Choice>,
        reserved: u128,
        spent: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ProposalCreated: ProposalCreated,
        MemberEnrolled: MemberEnrolled,
        MemberScored: MemberScored,
        BallotCast: BallotCast,
        StageChanged: StageChanged,
        Cancelled: Cancelled,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProposalCreated {
        #[key]
        pub proposal_id: u64,
        pub proposal: Proposal,
    }

    #[derive(Drop, starknet::Event)]
    pub struct MemberEnrolled {
        #[key]
        pub proposal_id: u64,
        pub enrollment: Enrollment,
        pub delegate: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct MemberScored {
        #[key]
        pub proposal_id: u64,
        #[key]
        pub participant: felt252,
        pub weight: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BallotCast {
        #[key]
        pub proposal_id: u64,
        #[key]
        pub caller: ContractAddress,
        pub as_delegate: bool,
        // None is an explicit withdrawal; it is never participation or support.
        pub choice: Choice,
    }

    #[derive(Drop, starknet::Event)]
    pub struct StageChanged {
        #[key]
        pub proposal_id: u64,
        pub stage: Stage,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Cancelled {
        #[key]
        pub proposal_id: u64,
        pub reason_hash: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        publisher: ContractAddress,
        guardian: ContractAddress,
        delegation_registry: ContractAddress,
        payment_token: ContractAddress,
        policy: Policy,
    ) {
        assert(publisher.is_non_zero() && guardian.is_non_zero(), 'ZERO_AUTHORITY');
        assert(delegation_registry.is_non_zero() && payment_token.is_non_zero(), 'ZERO_DEPENDENCY');
        validate_policy(policy);
        self.publisher.write(publisher);
        self.guardian.write(guardian);
        self.delegation_registry.write(delegation_registry);
        self.payment_token.write(payment_token);
        self.policy.write(policy);
    }

    #[abi(embed_v0)]
    impl Governor of super::IRealmsGovernor<ContractState> {
        fn create_proposal(
            ref self: ContractState,
            manifest_hash: felt252,
            recipient: ContractAddress,
            amount: u128,
        ) -> u64 {
            self.only_publisher();
            assert(manifest_hash != 0, 'MISSING_MANIFEST');
            assert(
                recipient.is_non_zero() && recipient != get_contract_address(), 'INVALID_RECIPIENT',
            );
            let policy = self.policy.read();
            assert(amount > 0 && amount <= policy.maximum_payment, 'INVALID_PAYMENT');
            let now = get_block_timestamp();
            let starts_at = now + policy.voting_delay;
            let registry = IDelegationRegistryDispatcher {
                contract_address: self.delegation_registry.read(),
            };
            let proposal = Proposal {
                stage: Stage::Enrollment,
                manifest_hash,
                cutoff_time: now,
                delegation_revision: registry.revision(),
                starts_at,
                ends_at: starts_at + policy.voting_period,
                recipient,
                amount,
                execute_after: 0,
                member_count: 0,
                scored_count: 0,
                tallied_count: 0,
                roots: Default::default(),
                total_power: 0,
                tally: Default::default(),
            };
            let proposal_id = self.proposal_count.read() + 1;
            self.proposal_count.write(proposal_id);
            self.proposals.write(proposal_id, proposal);
            self.emit(ProposalCreated { proposal_id, proposal });
            proposal_id
        }

        fn enroll(ref self: ContractState, proposal_id: u64, members: Span<Enrollment>) {
            self.only_publisher();
            self.valid_batch(members.len());
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Enrollment, 'SNAPSHOT_FROZEN');
            assert(get_block_timestamp() < proposal.starts_at, 'SNAPSHOT_TOO_LATE');
            let policy = self.policy.read();
            let registry = IDelegationRegistryDispatcher {
                contract_address: self.delegation_registry.read(),
            };
            for input in members {
                let input = *input;
                assert(
                    input.participant != 0 && input.controller.is_non_zero(), 'INVALID_PARTICIPANT',
                );
                assert(
                    self.members.read((proposal_id, input.participant)).controller.is_zero(),
                    'DUPLICATE_PARTICIPANT',
                );
                assert(
                    self.controllers.read((proposal_id, input.controller)) == 0,
                    'DUPLICATE_CONTROLLER',
                );
                assert(
                    (policy.realm_bps > 0 && input.realms > 0)
                        || (policy.velords_bps > 0 && input.velords > 0)
                        || (policy.xp_bps > 0 && input.xp > 0),
                    'NO_ELIGIBLE_ASSETS',
                );
                let roots = Components {
                    realms: scaled_sqrt(input.realms),
                    velords: scaled_sqrt(input.velords),
                    xp: scaled_sqrt(input.xp),
                };
                // Lookup the creation revision, never the latest mandate during enrollment.
                let mandate = registry
                    .mandate_at(
                        input.controller, get_contract_address(), proposal.delegation_revision,
                    );
                let delegate = if mandate.starts_at <= proposal.cutoff_time
                    && mandate.expires_at >= proposal.ends_at {
                    mandate.delegate
                } else {
                    0.try_into().unwrap()
                };
                self
                    .members
                    .write(
                        (proposal_id, input.participant),
                        Member {
                            controller: input.controller,
                            delegate,
                            roots,
                            weight: 0,
                            scored: false,
                            tallied: false,
                        },
                    );
                self.controllers.write((proposal_id, input.controller), input.participant);
                self.participant_ids.write((proposal_id, proposal.member_count), input.participant);
                proposal.member_count += 1;
                proposal.roots.realms += roots.realms;
                proposal.roots.velords += roots.velords;
                proposal.roots.xp += roots.xp;
                self.emit(MemberEnrolled { proposal_id, enrollment: input, delegate });
            }
            self.proposals.write(proposal_id, proposal);
        }

        fn freeze_snapshot(ref self: ContractState, proposal_id: u64) {
            self.only_publisher();
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Enrollment, 'SNAPSHOT_FROZEN');
            assert(get_block_timestamp() < proposal.starts_at, 'SNAPSHOT_TOO_LATE');
            assert(proposal.member_count > 0, 'EMPTY_SNAPSHOT');
            validate_denominators(self.policy.read(), proposal.roots);
            proposal.stage = Stage::Scoring;
            self.save_stage(proposal_id, proposal);
        }

        fn score_batch(ref self: ContractState, proposal_id: u64, count: u32) {
            self.valid_batch(count);
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Scoring, 'NOT_SCORING');
            assert(get_block_timestamp() < proposal.starts_at, 'SNAPSHOT_TOO_LATE');
            assert(proposal.scored_count < proposal.member_count, 'SCORING_COMPLETE');
            let end = proposal.scored_count
                + core::cmp::min(count, proposal.member_count - proposal.scored_count);
            let policy = self.policy.read();
            while proposal.scored_count < end {
                let participant = self.participant_ids.read((proposal_id, proposal.scored_count));
                let mut member = self.members.read((proposal_id, participant));
                member.weight = voting_power(member.roots, proposal.roots, policy);
                member.scored = true;
                proposal.total_power += member.weight;
                proposal.scored_count += 1;
                self.members.write((proposal_id, participant), member);
                self.emit(MemberScored { proposal_id, participant, weight: member.weight });
            }
            self.proposals.write(proposal_id, proposal);
        }

        fn open_voting(ref self: ContractState, proposal_id: u64) {
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Scoring, 'NOT_SCORING');
            assert(get_block_timestamp() < proposal.starts_at, 'SNAPSHOT_TOO_LATE');
            assert(
                proposal.scored_count == proposal.member_count && proposal.total_power > 0,
                'INCOMPLETE_SNAPSHOT',
            );
            proposal.stage = Stage::Ready;
            self.save_stage(proposal_id, proposal);
        }

        fn vote(ref self: ContractState, proposal_id: u64, choice: Choice) {
            assert(choice != Choice::None, 'INVALID_CHOICE');
            self.write_direct(proposal_id, choice);
        }

        fn withdraw_representation(ref self: ContractState, proposal_id: u64) {
            self.write_direct(proposal_id, Choice::None);
        }

        fn vote_as_delegate(ref self: ContractState, proposal_id: u64, choice: Choice) {
            self.assert_voting(proposal_id);
            let caller = get_caller_address();
            assert(caller.is_non_zero(), 'ZERO_CALLER');
            // A delegate can withdraw their own ballot using None.
            self.delegate_ballots.write((proposal_id, caller), choice);
            self.emit(BallotCast { proposal_id, caller, as_delegate: true, choice });
        }

        fn tally_batch(ref self: ContractState, proposal_id: u64, count: u32) {
            self.valid_batch(count);
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Ready, 'NOT_READY');
            assert(get_block_timestamp() >= proposal.ends_at, 'VOTING_NOT_ENDED');
            assert(proposal.tallied_count < proposal.member_count, 'TALLY_COMPLETE');
            let end = proposal.tallied_count
                + core::cmp::min(count, proposal.member_count - proposal.tallied_count);
            while proposal.tallied_count < end {
                let participant = self.participant_ids.read((proposal_id, proposal.tallied_count));
                let mut member = self.members.read((proposal_id, participant));
                match self.resolve(proposal_id, participant, member) {
                    Choice::For => {
                        proposal.tally.for_votes += member.weight;
                        if member.weight > 0 {
                            proposal.tally.supporters += 1;
                        }
                    },
                    Choice::Against => { proposal.tally.against_votes += member.weight; },
                    Choice::Abstain => { proposal.tally.abstain_votes += member.weight; },
                    Choice::None => {},
                }
                member.tallied = true;
                self.members.write((proposal_id, participant), member);
                proposal.tallied_count += 1;
            }
            self.proposals.write(proposal_id, proposal);
        }

        fn finalize(ref self: ContractState, proposal_id: u64) {
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Ready, 'NOT_READY');
            assert(get_block_timestamp() >= proposal.ends_at, 'VOTING_NOT_ENDED');
            assert(proposal.tallied_count == proposal.member_count, 'INCOMPLETE_TALLY');
            proposal
                .stage =
                    if passes(proposal.tally, proposal.total_power, self.policy.read()) {
                        Stage::Passed
                    } else {
                        Stage::Defeated
                    };
            self.save_stage(proposal_id, proposal);
        }

        fn queue(ref self: ContractState, proposal_id: u64) {
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Passed, 'PROPOSAL_NOT_PASSED');
            let policy = self.policy.read();
            assert(
                get_block_timestamp() - proposal.ends_at < policy.execution_window, 'QUEUE_EXPIRED',
            );
            // Subtraction keeps bounds safe even when configured budgets approach u128::MAX.
            let remaining = policy.total_budget - self.spent.read() - self.reserved.read();
            assert(proposal.amount <= remaining, 'BUDGET_EXCEEDED');
            proposal.execute_after = get_block_timestamp() + policy.execution_delay;
            proposal.stage = Stage::Queued;
            self.reserved.write(self.reserved.read() + proposal.amount);
            self.save_stage(proposal_id, proposal);
        }

        fn execute(ref self: ContractState, proposal_id: u64) {
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Queued, 'NOT_QUEUED');
            let now = get_block_timestamp();
            assert(now >= proposal.execute_after, 'TIMELOCK_ACTIVE');
            assert(
                now - proposal.execute_after < self.policy.read().execution_window,
                'EXECUTION_EXPIRED',
            );
            // Effects precede the only external write. Failure rolls the transaction back.
            proposal.stage = Stage::Executed;
            self.reserved.write(self.reserved.read() - proposal.amount);
            self.spent.write(self.spent.read() + proposal.amount);
            self.save_stage(proposal_id, proposal);
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            assert(token.transfer(proposal.recipient, proposal.amount.into()), 'TRANSFER_FAILED');
        }

        fn cancel(ref self: ContractState, proposal_id: u64, reason_hash: felt252) {
            assert(get_caller_address() == self.guardian.read(), 'ONLY_GUARDIAN');
            assert(reason_hash != 0, 'MISSING_REASON');
            let mut proposal = self.read_proposal(proposal_id);
            assert(
                proposal.stage != Stage::Executed
                    && proposal.stage != Stage::Cancelled
                    && proposal.stage != Stage::Defeated,
                'TERMINAL_PROPOSAL',
            );
            if proposal.stage == Stage::Queued {
                self.reserved.write(self.reserved.read() - proposal.amount);
            }
            proposal.stage = Stage::Cancelled;
            self.save_stage(proposal_id, proposal);
            self.emit(Cancelled { proposal_id, reason_hash });
        }

        fn expire_queue(ref self: ContractState, proposal_id: u64) {
            let mut proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Queued, 'NOT_QUEUED');
            let now = get_block_timestamp();
            assert(now >= proposal.execute_after, 'TIMELOCK_ACTIVE');
            assert(
                now - proposal.execute_after >= self.policy.read().execution_window, 'NOT_EXPIRED',
            );
            self.reserved.write(self.reserved.read() - proposal.amount);
            proposal.stage = Stage::Cancelled;
            self.save_stage(proposal_id, proposal);
        }

        fn policy(self: @ContractState) -> Policy {
            self.policy.read()
        }
        fn proposal(self: @ContractState, proposal_id: u64) -> Proposal {
            self.read_proposal(proposal_id)
        }

        fn member(self: @ContractState, proposal_id: u64, participant: felt252) -> Member {
            let member = self.members.read((proposal_id, participant));
            assert(member.controller.is_non_zero(), 'UNKNOWN_PARTICIPANT');
            member
        }

        fn participant_at(self: @ContractState, proposal_id: u64, index: u32) -> felt252 {
            assert(index < self.read_proposal(proposal_id).member_count, 'INVALID_INDEX');
            self.participant_ids.read((proposal_id, index))
        }

        fn effective_choice(
            self: @ContractState, proposal_id: u64, participant: felt252,
        ) -> Choice {
            self.resolve(proposal_id, participant, self.member(proposal_id, participant))
        }

        fn budget_usage(self: @ContractState) -> (u128, u128) {
            (self.reserved.read(), self.spent.read())
        }

        fn configuration(
            self: @ContractState,
        ) -> (ContractAddress, ContractAddress, ContractAddress, ContractAddress) {
            (
                self.publisher.read(),
                self.guardian.read(),
                self.delegation_registry.read(),
                self.payment_token.read(),
            )
        }
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        fn only_publisher(self: @ContractState) {
            assert(get_caller_address() == self.publisher.read(), 'ONLY_PUBLISHER');
        }

        fn read_proposal(self: @ContractState, proposal_id: u64) -> Proposal {
            let proposal = self.proposals.read(proposal_id);
            assert(proposal.stage != Stage::Missing, 'UNKNOWN_PROPOSAL');
            proposal
        }

        fn valid_batch(self: @ContractState, count: u32) {
            assert(count > 0 && count <= MAX_BATCH, 'INVALID_BATCH_SIZE');
        }

        fn save_stage(ref self: ContractState, proposal_id: u64, proposal: Proposal) {
            self.proposals.write(proposal_id, proposal);
            self.emit(StageChanged { proposal_id, stage: proposal.stage });
        }

        fn assert_voting(self: @ContractState, proposal_id: u64) {
            let proposal = self.read_proposal(proposal_id);
            assert(proposal.stage == Stage::Ready, 'NOT_READY');
            let now = get_block_timestamp();
            assert(now >= proposal.starts_at && now < proposal.ends_at, 'VOTING_CLOSED');
        }

        fn write_direct(ref self: ContractState, proposal_id: u64, choice: Choice) {
            self.assert_voting(proposal_id);
            let caller = get_caller_address();
            let participant = self.controllers.read((proposal_id, caller));
            assert(participant != 0, 'NOT_A_PARTICIPANT');
            self
                .direct_ballots
                .write((proposal_id, participant), DirectBallot { overridden: true, choice });
            self.emit(BallotCast { proposal_id, caller, as_delegate: false, choice });
        }

        fn resolve(
            self: @ContractState, proposal_id: u64, participant: felt252, member: Member,
        ) -> Choice {
            let direct = self.direct_ballots.read((proposal_id, participant));
            if direct.overridden {
                return direct.choice;
            }
            if member.delegate.is_zero() {
                return Choice::None;
            }
            self.delegate_ballots.read((proposal_id, member.delegate))
        }
    }
}
