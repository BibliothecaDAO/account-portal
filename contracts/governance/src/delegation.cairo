use starknet::ContractAddress;
use super::types::Mandate;

#[starknet::interface]
pub trait IDelegationRegistry<TContractState> {
    fn delegate(
        ref self: TContractState,
        scope: ContractAddress,
        delegate: ContractAddress,
        expires_at: u64,
    );
    fn revoke(ref self: TContractState, scope: ContractAddress);
    fn revision(self: @TContractState) -> u64;
    fn mandate_at(
        self: @TContractState, owner: ContractAddress, scope: ContractAddress, revision: u64,
    ) -> Mandate;
}

#[starknet::contract]
pub mod DelegationRegistry {
    use core::num::traits::Zero;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};
    use super::super::types::{MAX_MANDATE_SECONDS, Mandate};

    #[storage]
    struct Storage {
        revision: u64,
        counts: Map<(ContractAddress, ContractAddress), u64>,
        checkpoints: Map<(ContractAddress, ContractAddress, u64), Mandate>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        MandateChanged: MandateChanged,
    }

    #[derive(Drop, starknet::Event)]
    pub struct MandateChanged {
        #[key]
        pub owner: ContractAddress,
        #[key]
        pub scope: ContractAddress,
        pub mandate: Mandate,
    }

    #[abi(embed_v0)]
    impl Registry of super::IDelegationRegistry<ContractState> {
        fn delegate(
            ref self: ContractState,
            scope: ContractAddress,
            delegate: ContractAddress,
            expires_at: u64,
        ) {
            let now = get_block_timestamp();
            assert(scope.is_non_zero() && delegate.is_non_zero(), 'ZERO_ADDRESS');
            assert(delegate != get_caller_address(), 'SELF_DELEGATION');
            assert(expires_at > now, 'MANDATE_ALREADY_EXPIRED');
            assert(expires_at - now <= MAX_MANDATE_SECONDS, 'MANDATE_TOO_LONG');
            self.append(scope, delegate, expires_at);
        }

        fn revoke(ref self: ContractState, scope: ContractAddress) {
            assert(scope.is_non_zero(), 'ZERO_ADDRESS');
            self.append(scope, 0.try_into().unwrap(), get_block_timestamp());
        }

        fn revision(self: @ContractState) -> u64 {
            self.revision.read()
        }

        fn mandate_at(
            self: @ContractState, owner: ContractAddress, scope: ContractAddress, revision: u64,
        ) -> Mandate {
            assert(revision <= self.revision.read(), 'FUTURE_REVISION');
            // Upper bound search: precise transaction ordering even within one block.
            let mut low: u64 = 0;
            let mut high = self.counts.read((owner, scope));
            while low < high {
                let mid = low + (high - low + 1) / 2;
                if self.checkpoints.read((owner, scope, mid)).revision <= revision {
                    low = mid;
                } else {
                    high = mid - 1;
                }
            }
            self.checkpoints.read((owner, scope, low))
        }
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        fn append(
            ref self: ContractState,
            scope: ContractAddress,
            delegate: ContractAddress,
            expires_at: u64,
        ) {
            let owner = get_caller_address();
            assert(owner.is_non_zero(), 'ZERO_CALLER');
            let revision = self.revision.read() + 1;
            let index = self.counts.read((owner, scope)) + 1;
            let mandate = Mandate {
                revision, starts_at: get_block_timestamp(), expires_at, delegate,
            };
            self.revision.write(revision);
            self.counts.write((owner, scope), index);
            self.checkpoints.write((owner, scope, index), mandate);
            self.emit(MandateChanged { owner, scope, mandate });
        }
    }
}
