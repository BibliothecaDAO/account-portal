use starknet::ContractAddress;

#[starknet::interface]
pub trait IMockToken<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn balance_of(self: @TContractState, owner: ContractAddress) -> u256;
    fn set_failure(ref self: TContractState, fail: bool);
    fn set_reentry(ref self: TContractState, governor: ContractAddress, proposal: u64);
    fn reentry_failed(self: @TContractState) -> bool;
}

#[starknet::contract]
pub mod MockToken {
    use realms_governance::governor::{
        IERC20, IRealmsGovernorSafeDispatcher, IRealmsGovernorSafeDispatcherTrait,
    };
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
        fail: bool,
        reentry_governor: ContractAddress,
        reentry_proposal: u64,
        reentry_failed: bool,
    }

    #[abi(embed_v0)]
    impl Token of IERC20<ContractState> {
        #[feature("safe_dispatcher")]
        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            if self.fail.read() {
                return false;
            }
            if self.reentry_proposal.read() != 0 {
                let governor = IRealmsGovernorSafeDispatcher {
                    contract_address: self.reentry_governor.read(),
                };
                let proposal = self.reentry_proposal.read();
                self.reentry_proposal.write(0);
                self.reentry_failed.write(governor.execute(proposal).is_err());
            }
            let sender = get_caller_address();
            let balance = self.balances.read(sender);
            assert(balance >= amount, 'INSUFFICIENT_FUNDS');
            self.balances.write(sender, balance - amount);
            self.balances.write(recipient, self.balances.read(recipient) + amount);
            true
        }
    }

    #[abi(embed_v0)]
    impl Mock of super::IMockToken<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            self.balances.write(to, self.balances.read(to) + amount);
        }
        fn balance_of(self: @ContractState, owner: ContractAddress) -> u256 {
            self.balances.read(owner)
        }
        fn set_failure(ref self: ContractState, fail: bool) {
            self.fail.write(fail);
        }
        fn set_reentry(ref self: ContractState, governor: ContractAddress, proposal: u64) {
            self.reentry_governor.write(governor);
            self.reentry_proposal.write(proposal);
        }
        fn reentry_failed(self: @ContractState) -> bool {
            self.reentry_failed.read()
        }
    }
}
