import type { Abi } from "starknet";

/** The ERC721Votes events from REALMS_ABI, without importing that indexer and its database client. */
export const DELEGATE_CHANGED_EVENT =
  "strealm::components::erc721::extensions::erc721_votes::ERC721VotesComponent::DelegateChanged";
export const DELEGATE_VOTES_CHANGED_EVENT =
  "strealm::components::erc721::extensions::erc721_votes::ERC721VotesComponent::DelegateVotesChanged";

export const REALMS_DELEGATES_ABI = [
  {
    kind: "struct",
    name: DELEGATE_CHANGED_EVENT,
    type: "event",
    members: [
      {
        kind: "key",
        name: "delegator",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "from_delegate",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        kind: "key",
        name: "to_delegate",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    kind: "struct",
    name: DELEGATE_VOTES_CHANGED_EVENT,
    type: "event",
    members: [
      {
        kind: "key",
        name: "delegate",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { kind: "data", name: "previous_votes", type: "core::integer::u256" },
      { kind: "data", name: "new_votes", type: "core::integer::u256" },
    ],
  },
  {
    kind: "enum",
    name: "strealm::components::erc721::extensions::erc721_votes::ERC721VotesComponent::Event",
    type: "event",
    variants: [
      { kind: "nested", name: "DelegateChanged", type: DELEGATE_CHANGED_EVENT },
      {
        kind: "nested",
        name: "DelegateVotesChanged",
        type: DELEGATE_VOTES_CHANGED_EVENT,
      },
    ],
  },
  {
    kind: "enum",
    name: "strealm::contracts::strealm::StRealm::Event",
    type: "event",
    variants: [
      {
        kind: "flat",
        name: "ERC721VotesEvent",
        type: "strealm::components::erc721::extensions::erc721_votes::ERC721VotesComponent::Event",
      },
    ],
  },
] as const satisfies Abi;
