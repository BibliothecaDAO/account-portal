/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimalVP: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Text: { input: any; output: any; }
};

/** Execution hash for tracking proposal execution status */
export type ExecutionHash = {
  __typename?: 'ExecutionHash';
  _indexer: Scalars['String']['output'];
  /** Unique identifier for the execution hash */
  id: Scalars['String']['output'];
  /** ID of the proposal this execution hash belongs to */
  proposal_id: Scalars['String']['output'];
};

export type ExecutionHash_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_id?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_id_not?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum ExecutionHash_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  ProposalId = 'proposal_id'
}

/** Execution strategy configuration for how proposals are executed onchain */
export type ExecutionStrategy = {
  __typename?: 'ExecutionStrategy';
  _indexer: Scalars['String']['output'];
  /** Contract address of the execution strategy */
  address: Scalars['String']['output'];
  /** Destination address for execution (optional) */
  destination_address?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the execution strategy */
  id: Scalars['String']['output'];
  /** Minimum voting power required for execution */
  quorum: Scalars['BigDecimalVP']['output'];
  /** Delay in blocks before timelock execution can proceed */
  timelock_delay: Scalars['BigInt']['output'];
  /** Guardian address that can veto timelock executions (optional) */
  timelock_veto_guardian?: Maybe<Scalars['String']['output']>;
  /** Treasury address for funding execution (optional) */
  treasury?: Maybe<Scalars['String']['output']>;
  /** Chain ID where the treasury is located (optional) */
  treasury_chain?: Maybe<Scalars['Int']['output']>;
  /** Type of execution strategy (e.g., 'SimpleQuorum', 'Timelock') */
  type: Scalars['String']['output'];
};

export type ExecutionStrategy_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destination_address?: InputMaybe<Scalars['String']['input']>;
  destination_address_contains?: InputMaybe<Scalars['String']['input']>;
  destination_address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  destination_address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destination_address_not?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_contains?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  timelock_delay?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_veto_guardian?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_veto_guardian_not?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  treasury?: InputMaybe<Scalars['String']['input']>;
  treasury_chain?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_gt?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_gte?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  treasury_chain_lt?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_lte?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_not?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  treasury_contains?: InputMaybe<Scalars['String']['input']>;
  treasury_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  treasury_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  treasury_not?: InputMaybe<Scalars['String']['input']>;
  treasury_not_contains?: InputMaybe<Scalars['String']['input']>;
  treasury_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  treasury_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum ExecutionStrategy_OrderBy {
  Indexer = '_indexer',
  Address = 'address',
  DestinationAddress = 'destination_address',
  Id = 'id',
  Quorum = 'quorum',
  TimelockDelay = 'timelock_delay',
  TimelockVetoGuardian = 'timelock_veto_guardian',
  Treasury = 'treasury',
  TreasuryChain = 'treasury_chain',
  Type = 'type'
}

/** Leaderboard tracks user participation statistics within a space */
export type Leaderboard = {
  __typename?: 'Leaderboard';
  _indexer: Scalars['String']['output'];
  /** Unique identifier for the leaderboard entry */
  id: Scalars['String']['output'];
  /** Number of proposals created by user in this space */
  proposal_count: Scalars['Int']['output'];
  /** Space this leaderboard entry belongs to */
  space: Space;
  /** User being tracked */
  user: User;
  /** Number of votes cast by user in this space */
  vote_count: Scalars['Int']['output'];
};

export type Leaderboard_Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Leaderboard_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_type?: InputMaybe<Scalars['Int']['input']>;
  address_type_gt?: InputMaybe<Scalars['Int']['input']>;
  address_type_gte?: InputMaybe<Scalars['Int']['input']>;
  address_type_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  address_type_lt?: InputMaybe<Scalars['Int']['input']>;
  address_type_lte?: InputMaybe<Scalars['Int']['input']>;
  address_type_not?: InputMaybe<Scalars['Int']['input']>;
  address_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Leaderboard_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_?: InputMaybe<Leaderboard_Space_Filter>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<Leaderboard_User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum Leaderboard_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  ProposalCount = 'proposal_count',
  Space = 'space',
  User = 'user',
  VoteCount = 'vote_count'
}

/** Network statistics for blockchain network activity */
export type Network = {
  __typename?: 'Network';
  _indexer: Scalars['String']['output'];
  /** Network identifier (e.g., 'sn', 'eth', 'sep') */
  id: Scalars['String']['output'];
  /** Total number of proposals on this network */
  proposal_count: Scalars['Int']['output'];
  /** Total number of spaces on this network */
  space_count: Scalars['Int']['output'];
  /** Total number of votes on this network */
  vote_count: Scalars['Int']['output'];
};

export type Network_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space_count?: InputMaybe<Scalars['Int']['input']>;
  space_count_gt?: InputMaybe<Scalars['Int']['input']>;
  space_count_gte?: InputMaybe<Scalars['Int']['input']>;
  space_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space_count_lt?: InputMaybe<Scalars['Int']['input']>;
  space_count_lte?: InputMaybe<Scalars['Int']['input']>;
  space_count_not?: InputMaybe<Scalars['Int']['input']>;
  space_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum Network_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  ProposalCount = 'proposal_count',
  SpaceCount = 'space_count',
  VoteCount = 'vote_count'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

/** Proposal represents a governance proposal within a space */
export type Proposal = {
  __typename?: 'Proposal';
  _indexer: Scalars['String']['output'];
  /** User who created the proposal */
  author: User;
  /** Whether proposal has been cancelled */
  cancelled: Scalars['Boolean']['output'];
  /** Whether proposal is completed (deprecated: use execution_settled) */
  completed: Scalars['Boolean']['output'];
  /** Timestamp when proposal was created */
  created: Scalars['Int']['output'];
  /** Timestamp when proposal was last edited (optional) */
  edited?: Maybe<Scalars['Int']['output']>;
  /** Whether proposal has been executed */
  executed: Scalars['Boolean']['output'];
  /** Timestamp when the proposal execution was finalized */
  executed_at?: Maybe<Scalars['BigInt']['output']>;
  /** Block number when the proposal execution was finalized (EVM only) */
  executed_at_block_number?: Maybe<Scalars['BigInt']['output']>;
  /** Destination address for proposal execution */
  execution_destination?: Maybe<Scalars['String']['output']>;
  /** Hash for tracking proposal execution. On OpenZeppelin it contains descriptionHash */
  execution_hash: Scalars['String']['output'];
  /** Whether proposal execution has been settled */
  execution_settled: Scalars['Boolean']['output'];
  /** Address of the execution strategy contract */
  execution_strategy: Scalars['String']['output'];
  /** Detailed execution strategy configuration */
  execution_strategy_details?: Maybe<ExecutionStrategy>;
  /** Type of execution strategy used */
  execution_strategy_type: Scalars['String']['output'];
  /** Timestamp when proposal can be executed */
  execution_time: Scalars['BigInt']['output'];
  /** Transaction hash of proposal execution (optional) */
  execution_tx?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the proposal */
  id: Scalars['String']['output'];
  /** UI link to proposal interface */
  link: Scalars['String']['output'];
  /** Maximum timestamp when voting must end */
  max_end: Scalars['BigInt']['output'];
  /** Maximum block number when voting must end (only defined on EVM) */
  max_end_block_number?: Maybe<Scalars['BigInt']['output']>;
  /** Proposal metadata containing title, body, and choices */
  metadata?: Maybe<ProposalMetadataItem>;
  /** Minimum timestamp when voting can end */
  min_end: Scalars['BigInt']['output'];
  /** Minimum block number when voting can end (only defined on EVM) */
  min_end_block_number?: Maybe<Scalars['BigInt']['output']>;
  /** ID of the proposal within the space */
  proposal_id: Scalars['String']['output'];
  /** Minimum voting power required for execution */
  quorum: Scalars['BigDecimalVP']['output'];
  /** Whether quorum has been read at the snapshot block (OZ governors read it once on first vote) */
  quorum_finalized: Scalars['Boolean']['output'];
  /** Quorum counting mode (e.g. for_only for Bravo-style where only For votes count) */
  quorum_type?: Maybe<Scalars['String']['output']>;
  /** Voting power for choice 1 */
  scores_1: Scalars['BigDecimalVP']['output'];
  /** Parsed voting power for choice 1 as float */
  scores_1_parsed: Scalars['Float']['output'];
  /** Voting power for choice 2 */
  scores_2: Scalars['BigDecimalVP']['output'];
  /** Parsed voting power for choice 2 as float */
  scores_2_parsed: Scalars['Float']['output'];
  /** Voting power for choice 3 */
  scores_3: Scalars['BigDecimalVP']['output'];
  /** Parsed voting power for choice 3 as float */
  scores_3_parsed: Scalars['Float']['output'];
  /** Historical scores */
  scores_ticks: Array<ScoresTick>;
  /** Total voting power cast */
  scores_total: Scalars['BigDecimalVP']['output'];
  /** Parsed total voting power as float */
  scores_total_parsed: Scalars['Float']['output'];
  /** Timepoint used for voting power calculation (blocks on EVM, seconds on Starknet) */
  snapshot: Scalars['BigInt']['output'];
  /** Space this proposal belongs to */
  space: Space;
  /** Timestamp when proposal starts */
  start: Scalars['BigInt']['output'];
  /** When voting starts (only defined on EVM) */
  start_block_number?: Maybe<Scalars['BigInt']['output']>;
  /** Array of strategy contract addresses */
  strategies: Array<Scalars['String']['output']>;
  /** Array of strategy indices used for voting */
  strategies_indices: Array<Scalars['Int']['output']>;
  /** Array of strategy parameters */
  strategies_params: Array<Scalars['String']['output']>;
  /** Delay in blocks before timelock execution */
  timelock_delay?: Maybe<Scalars['BigInt']['output']>;
  /** Guardian address that can veto timelock executions */
  timelock_veto_guardian?: Maybe<Scalars['String']['output']>;
  /** Array of treasury addresses involved in execution */
  treasuries: Array<Scalars['String']['output']>;
  /** Transaction hash of proposal creation */
  tx: Scalars['String']['output'];
  /** Type of proposal (e.g., 'basic', 'single-choice') */
  type: Scalars['String']['output'];
  /** Transaction hash of proposal veto (optional) */
  veto_tx?: Maybe<Scalars['String']['output']>;
  /** Whether proposal has been vetoed */
  vetoed: Scalars['Boolean']['output'];
  /** Number of votes cast on this proposal */
  vote_count: Scalars['Int']['output'];
  /** Number of decimal places for voting power display */
  vp_decimals: Scalars['Int']['output'];
};

/** Metadata for a proposal containing display content and voting options */
export type ProposalMetadataItem = {
  __typename?: 'ProposalMetadataItem';
  _indexer: Scalars['String']['output'];
  /** Main body text of the proposal */
  body?: Maybe<Scalars['Text']['output']>;
  /** Array of voting choices (e.g., ['For', 'Against', 'Abstain']) */
  choices: Array<Scalars['String']['output']>;
  /** Link to discussion forum or thread */
  discussion?: Maybe<Scalars['Text']['output']>;
  /** Execution details and parameters */
  execution?: Maybe<Scalars['Text']['output']>;
  /** Unique identifier for the metadata item */
  id: Scalars['String']['output'];
  /** Array of label tags for categorization */
  labels: Array<Scalars['String']['output']>;
  /** Title of the proposal */
  title?: Maybe<Scalars['Text']['output']>;
};

export type ProposalMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  body_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discussion_contains?: InputMaybe<Scalars['String']['input']>;
  discussion_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discussion_not_contains?: InputMaybe<Scalars['String']['input']>;
  discussion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_contains?: InputMaybe<Scalars['String']['input']>;
  execution_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum ProposalMetadataItem_OrderBy {
  Indexer = '_indexer',
  Body = 'body',
  Discussion = 'discussion',
  Execution = 'execution',
  Id = 'id',
  Title = 'title'
}

export type Proposal_ExecutionStrategy_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address?: InputMaybe<Scalars['String']['input']>;
  address_contains?: InputMaybe<Scalars['String']['input']>;
  address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_not?: InputMaybe<Scalars['String']['input']>;
  address_not_contains?: InputMaybe<Scalars['String']['input']>;
  address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destination_address?: InputMaybe<Scalars['String']['input']>;
  destination_address_contains?: InputMaybe<Scalars['String']['input']>;
  destination_address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  destination_address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  destination_address_not?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_contains?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  destination_address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  timelock_delay?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_veto_guardian?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_veto_guardian_not?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  treasury?: InputMaybe<Scalars['String']['input']>;
  treasury_chain?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_gt?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_gte?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  treasury_chain_lt?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_lte?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_not?: InputMaybe<Scalars['Int']['input']>;
  treasury_chain_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  treasury_contains?: InputMaybe<Scalars['String']['input']>;
  treasury_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  treasury_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  treasury_not?: InputMaybe<Scalars['String']['input']>;
  treasury_not_contains?: InputMaybe<Scalars['String']['input']>;
  treasury_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  treasury_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Proposal_ProposalMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  body_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discussion_contains?: InputMaybe<Scalars['String']['input']>;
  discussion_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discussion_not_contains?: InputMaybe<Scalars['String']['input']>;
  discussion_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_contains?: InputMaybe<Scalars['String']['input']>;
  execution_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type Proposal_Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Proposal_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_type?: InputMaybe<Scalars['Int']['input']>;
  address_type_gt?: InputMaybe<Scalars['Int']['input']>;
  address_type_gte?: InputMaybe<Scalars['Int']['input']>;
  address_type_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  address_type_lt?: InputMaybe<Scalars['Int']['input']>;
  address_type_lte?: InputMaybe<Scalars['Int']['input']>;
  address_type_not?: InputMaybe<Scalars['Int']['input']>;
  address_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Proposal_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  author?: InputMaybe<Scalars['String']['input']>;
  author_?: InputMaybe<Proposal_User_Filter>;
  author_contains?: InputMaybe<Scalars['String']['input']>;
  author_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  author_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  author_not?: InputMaybe<Scalars['String']['input']>;
  author_not_contains?: InputMaybe<Scalars['String']['input']>;
  author_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  author_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  cancelled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  cancelled_not?: InputMaybe<Scalars['Boolean']['input']>;
  cancelled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  completed_not?: InputMaybe<Scalars['Boolean']['input']>;
  completed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  edited?: InputMaybe<Scalars['Int']['input']>;
  edited_gt?: InputMaybe<Scalars['Int']['input']>;
  edited_gte?: InputMaybe<Scalars['Int']['input']>;
  edited_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  edited_lt?: InputMaybe<Scalars['Int']['input']>;
  edited_lte?: InputMaybe<Scalars['Int']['input']>;
  edited_not?: InputMaybe<Scalars['Int']['input']>;
  edited_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  executed?: InputMaybe<Scalars['Boolean']['input']>;
  executed_at?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_gt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_gte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_lt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_lte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_not?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  executed_not?: InputMaybe<Scalars['Boolean']['input']>;
  executed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_destination?: InputMaybe<Scalars['String']['input']>;
  execution_destination_contains?: InputMaybe<Scalars['String']['input']>;
  execution_destination_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_destination_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_destination_not?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_hash?: InputMaybe<Scalars['String']['input']>;
  execution_hash_contains?: InputMaybe<Scalars['String']['input']>;
  execution_hash_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_hash_not?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_settled?: InputMaybe<Scalars['Boolean']['input']>;
  execution_settled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_settled_not?: InputMaybe<Scalars['Boolean']['input']>;
  execution_settled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_strategy?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_?: InputMaybe<Proposal_ExecutionStrategy_Filter>;
  execution_strategy_details_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_details_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_type?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_type_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_time?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_gt?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_gte?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  execution_time_lt?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_lte?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_not?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  execution_tx?: InputMaybe<Scalars['String']['input']>;
  execution_tx_contains?: InputMaybe<Scalars['String']['input']>;
  execution_tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_tx_not?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_end?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_?: InputMaybe<Proposal_ProposalMetadataItem_Filter>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_end?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  proposal_id?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_id_not?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_finalized?: InputMaybe<Scalars['Boolean']['input']>;
  quorum_finalized_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  quorum_finalized_not?: InputMaybe<Scalars['Boolean']['input']>;
  quorum_finalized_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  quorum_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_type?: InputMaybe<Scalars['String']['input']>;
  quorum_type_contains?: InputMaybe<Scalars['String']['input']>;
  quorum_type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quorum_type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum_type_not?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_contains?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  scores_1?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_1_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_1_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_1_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_1_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_1_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_2?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_2_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_2_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_2_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_3?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_3_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_3_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_3_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_total?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_total_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_total_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_total_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_total_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_total_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  snapshot?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  snapshot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_not?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_?: InputMaybe<Proposal_Space_Filter>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  start?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_gt?: InputMaybe<Scalars['BigInt']['input']>;
  start_gte?: InputMaybe<Scalars['BigInt']['input']>;
  start_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_lt?: InputMaybe<Scalars['BigInt']['input']>;
  start_lte?: InputMaybe<Scalars['BigInt']['input']>;
  start_not?: InputMaybe<Scalars['BigInt']['input']>;
  start_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_veto_guardian?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_veto_guardian_not?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  veto_tx?: InputMaybe<Scalars['String']['input']>;
  veto_tx_contains?: InputMaybe<Scalars['String']['input']>;
  veto_tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  veto_tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  veto_tx_not?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vetoed?: InputMaybe<Scalars['Boolean']['input']>;
  vetoed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vetoed_not?: InputMaybe<Scalars['Boolean']['input']>;
  vetoed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum Proposal_OrderBy {
  Indexer = '_indexer',
  Author = 'author',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Created = 'created',
  Edited = 'edited',
  Executed = 'executed',
  ExecutedAt = 'executed_at',
  ExecutedAtBlockNumber = 'executed_at_block_number',
  ExecutionDestination = 'execution_destination',
  ExecutionHash = 'execution_hash',
  ExecutionSettled = 'execution_settled',
  ExecutionStrategy = 'execution_strategy',
  ExecutionStrategyDetails = 'execution_strategy_details',
  ExecutionStrategyType = 'execution_strategy_type',
  ExecutionTime = 'execution_time',
  ExecutionTx = 'execution_tx',
  Id = 'id',
  Link = 'link',
  MaxEnd = 'max_end',
  MaxEndBlockNumber = 'max_end_block_number',
  Metadata = 'metadata',
  MinEnd = 'min_end',
  MinEndBlockNumber = 'min_end_block_number',
  ProposalId = 'proposal_id',
  Quorum = 'quorum',
  QuorumFinalized = 'quorum_finalized',
  QuorumType = 'quorum_type',
  Scores_1 = 'scores_1',
  Scores_1Parsed = 'scores_1_parsed',
  Scores_2 = 'scores_2',
  Scores_2Parsed = 'scores_2_parsed',
  Scores_3 = 'scores_3',
  Scores_3Parsed = 'scores_3_parsed',
  ScoresTotal = 'scores_total',
  ScoresTotalParsed = 'scores_total_parsed',
  Snapshot = 'snapshot',
  Space = 'space',
  Start = 'start',
  StartBlockNumber = 'start_block_number',
  TimelockDelay = 'timelock_delay',
  TimelockVetoGuardian = 'timelock_veto_guardian',
  Tx = 'tx',
  Type = 'type',
  VetoTx = 'veto_tx',
  Vetoed = 'vetoed',
  VoteCount = 'vote_count',
  VpDecimals = 'vp_decimals'
}

export type Query = {
  __typename?: 'Query';
  _checkpoint?: Maybe<_Checkpoint>;
  _checkpoints: Array<_Checkpoint>;
  _metadata?: Maybe<_Metadata>;
  _metadatas: Array<_Metadata>;
  executionhash?: Maybe<ExecutionHash>;
  executionhashes: Array<ExecutionHash>;
  executionstrategies: Array<ExecutionStrategy>;
  executionstrategy?: Maybe<ExecutionStrategy>;
  leaderboard?: Maybe<Leaderboard>;
  leaderboards: Array<Leaderboard>;
  network?: Maybe<Network>;
  networks: Array<Network>;
  proposal?: Maybe<Proposal>;
  proposalmetadataitem?: Maybe<ProposalMetadataItem>;
  proposalmetadataitems: Array<ProposalMetadataItem>;
  proposals: Array<Proposal>;
  scorestick?: Maybe<ScoresTick>;
  scoresticks: Array<ScoresTick>;
  space?: Maybe<Space>;
  spacemetadataitem?: Maybe<SpaceMetadataItem>;
  spacemetadataitems: Array<SpaceMetadataItem>;
  spaces: Array<Space>;
  starknetl1execution?: Maybe<StarknetL1Execution>;
  starknetl1executions: Array<StarknetL1Execution>;
  strategiesparsedmetadatadataitem?: Maybe<StrategiesParsedMetadataDataItem>;
  strategiesparsedmetadatadataitems: Array<StrategiesParsedMetadataDataItem>;
  strategiesparsedmetadataitem?: Maybe<StrategiesParsedMetadataItem>;
  strategiesparsedmetadataitems: Array<StrategiesParsedMetadataItem>;
  user?: Maybe<User>;
  users: Array<User>;
  vote?: Maybe<Vote>;
  votemetadataitem?: Maybe<VoteMetadataItem>;
  votemetadataitems: Array<VoteMetadataItem>;
  votes: Array<Vote>;
  votingpowervalidationstrategiesparsedmetadataitem?: Maybe<VotingPowerValidationStrategiesParsedMetadataItem>;
  votingpowervalidationstrategiesparsedmetadataitems: Array<VotingPowerValidationStrategiesParsedMetadataItem>;
};


export type Query_CheckpointArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type Query_CheckpointsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<_Checkpoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<_Checkpoint_Filter>;
};


export type Query_MetadataArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type Query_MetadatasArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<_Metadata_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<_Metadata_Filter>;
};


export type QueryExecutionhashArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryExecutionhashesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<ExecutionHash_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ExecutionHash_Filter>;
};


export type QueryExecutionstrategiesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<ExecutionStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ExecutionStrategy_Filter>;
};


export type QueryExecutionstrategyArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLeaderboardArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLeaderboardsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Leaderboard_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Leaderboard_Filter>;
};


export type QueryNetworkArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNetworksArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Network_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Network_Filter>;
};


export type QueryProposalArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProposalmetadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProposalmetadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<ProposalMetadataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ProposalMetadataItem_Filter>;
};


export type QueryProposalsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Proposal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Proposal_Filter>;
};


export type QueryScorestickArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryScoresticksArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<ScoresTick_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<ScoresTick_Filter>;
};


export type QuerySpaceArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySpacemetadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySpacemetadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<SpaceMetadataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<SpaceMetadataItem_Filter>;
};


export type QuerySpacesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Space_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Space_Filter>;
};


export type QueryStarknetl1executionArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStarknetl1executionsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<StarknetL1Execution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StarknetL1Execution_Filter>;
};


export type QueryStrategiesparsedmetadatadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStrategiesparsedmetadatadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<StrategiesParsedMetadataDataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StrategiesParsedMetadataDataItem_Filter>;
};


export type QueryStrategiesparsedmetadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStrategiesparsedmetadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<StrategiesParsedMetadataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StrategiesParsedMetadataItem_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<User_Filter>;
};


export type QueryVoteArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVotemetadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVotemetadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<VoteMetadataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VoteMetadataItem_Filter>;
};


export type QueryVotesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Vote_Filter>;
};


export type QueryVotingpowervalidationstrategiesparsedmetadataitemArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVotingpowervalidationstrategiesparsedmetadataitemsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<VotingPowerValidationStrategiesParsedMetadataItem_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VotingPowerValidationStrategiesParsedMetadataItem_Filter>;
};

/** Historical scores for a proposal at a specific hour */
export type ScoresTick = {
  __typename?: 'ScoresTick';
  _indexer: Scalars['String']['output'];
  /** Unique identifier (proposalId/hourTimestamp) */
  id: Scalars['String']['output'];
  /** Proposal this tick belongs to */
  proposal: Proposal;
  /** Voting power for choice 1 at this timestamp */
  scores_1: Scalars['BigDecimalVP']['output'];
  /** Voting power for choice 2 at this timestamp */
  scores_2: Scalars['BigDecimalVP']['output'];
  /** Voting power for choice 3 at this timestamp */
  scores_3: Scalars['BigDecimalVP']['output'];
  /** Unix timestamp of when scores were recorded */
  timestamp: Scalars['Int']['output'];
};

export type ScoresTick_Proposal_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  author?: InputMaybe<Scalars['String']['input']>;
  author_contains?: InputMaybe<Scalars['String']['input']>;
  author_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  author_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  author_not?: InputMaybe<Scalars['String']['input']>;
  author_not_contains?: InputMaybe<Scalars['String']['input']>;
  author_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  author_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  cancelled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  cancelled_not?: InputMaybe<Scalars['Boolean']['input']>;
  cancelled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  completed_not?: InputMaybe<Scalars['Boolean']['input']>;
  completed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  edited?: InputMaybe<Scalars['Int']['input']>;
  edited_gt?: InputMaybe<Scalars['Int']['input']>;
  edited_gte?: InputMaybe<Scalars['Int']['input']>;
  edited_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  edited_lt?: InputMaybe<Scalars['Int']['input']>;
  edited_lte?: InputMaybe<Scalars['Int']['input']>;
  edited_not?: InputMaybe<Scalars['Int']['input']>;
  edited_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  executed?: InputMaybe<Scalars['Boolean']['input']>;
  executed_at?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_gt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_gte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_at_lt?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_lte?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_not?: InputMaybe<Scalars['BigInt']['input']>;
  executed_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  executed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  executed_not?: InputMaybe<Scalars['Boolean']['input']>;
  executed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_destination?: InputMaybe<Scalars['String']['input']>;
  execution_destination_contains?: InputMaybe<Scalars['String']['input']>;
  execution_destination_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_destination_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_destination_not?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_destination_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_hash?: InputMaybe<Scalars['String']['input']>;
  execution_hash_contains?: InputMaybe<Scalars['String']['input']>;
  execution_hash_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_hash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_hash_not?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_hash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_settled?: InputMaybe<Scalars['Boolean']['input']>;
  execution_settled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_settled_not?: InputMaybe<Scalars['Boolean']['input']>;
  execution_settled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  execution_strategy?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_details_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_details_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_type?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_strategy_type_not?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_strategy_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_time?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_gt?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_gte?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  execution_time_lt?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_lte?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_not?: InputMaybe<Scalars['BigInt']['input']>;
  execution_time_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  execution_tx?: InputMaybe<Scalars['String']['input']>;
  execution_tx_contains?: InputMaybe<Scalars['String']['input']>;
  execution_tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  execution_tx_not?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_end?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_end_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_end_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_end?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_end_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_end_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  proposal_id?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_id_not?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_finalized?: InputMaybe<Scalars['Boolean']['input']>;
  quorum_finalized_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  quorum_finalized_not?: InputMaybe<Scalars['Boolean']['input']>;
  quorum_finalized_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  quorum_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  quorum_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  quorum_type?: InputMaybe<Scalars['String']['input']>;
  quorum_type_contains?: InputMaybe<Scalars['String']['input']>;
  quorum_type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quorum_type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quorum_type_not?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_contains?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quorum_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  scores_1?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_1_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_1_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_1_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_1_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_1_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_2?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_2_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_2_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_2_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_3?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_3_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_3_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_3_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_total?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_total_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_total_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_total_parsed?: InputMaybe<Scalars['Float']['input']>;
  scores_total_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  scores_total_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  scores_total_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  snapshot?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  snapshot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_not?: InputMaybe<Scalars['BigInt']['input']>;
  snapshot_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  start?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_gt?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_gte?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_block_number_lt?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_lte?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_not?: InputMaybe<Scalars['BigInt']['input']>;
  start_block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_gt?: InputMaybe<Scalars['BigInt']['input']>;
  start_gte?: InputMaybe<Scalars['BigInt']['input']>;
  start_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  start_lt?: InputMaybe<Scalars['BigInt']['input']>;
  start_lte?: InputMaybe<Scalars['BigInt']['input']>;
  start_not?: InputMaybe<Scalars['BigInt']['input']>;
  start_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  timelock_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timelock_veto_guardian?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  timelock_veto_guardian_not?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  timelock_veto_guardian_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  veto_tx?: InputMaybe<Scalars['String']['input']>;
  veto_tx_contains?: InputMaybe<Scalars['String']['input']>;
  veto_tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  veto_tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  veto_tx_not?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  veto_tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vetoed?: InputMaybe<Scalars['Boolean']['input']>;
  vetoed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vetoed_not?: InputMaybe<Scalars['Boolean']['input']>;
  vetoed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type ScoresTick_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal?: InputMaybe<Scalars['String']['input']>;
  proposal_?: InputMaybe<ScoresTick_Proposal_Filter>;
  proposal_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_not?: InputMaybe<Scalars['String']['input']>;
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  scores_1?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_1_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_1_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_2_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_2_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  scores_3_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  scores_3_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum ScoresTick_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  Proposal = 'proposal',
  Scores_1 = 'scores_1',
  Scores_2 = 'scores_2',
  Scores_3 = 'scores_3',
  Timestamp = 'timestamp'
}

/** Space represents a DAO or governance organization on Snapshot X */
export type Space = {
  __typename?: 'Space';
  _indexer: Scalars['String']['output'];
  /** Number of currently active proposals in this space */
  active_proposal_count: Scalars['Int']['output'];
  /** Array of authenticator contract addresses for proposal validation */
  authenticators: Array<Scalars['String']['output']>;
  /** Address of the space controller/owner */
  controller: Scalars['String']['output'];
  /** Timestamp when the space was created */
  created: Scalars['Int']['output'];
  /** Unique identifier for the space */
  id: Scalars['String']['output'];
  /** UI link to space interface */
  link: Scalars['String']['output'];
  /** Maximum voting period duration (blocks on EVM, seconds on Starknet) */
  max_voting_period: Scalars['BigInt']['output'];
  /** Space metadata containing name, description, avatar, and other details */
  metadata?: Maybe<SpaceMetadataItem>;
  /** Minimum voting period duration (blocks on EVM, seconds on Starknet) */
  min_voting_period: Scalars['BigInt']['output'];
  /** Index for the next strategy to be added */
  next_strategy_index: Scalars['Int']['output'];
  /** Total number of proposals created in this space */
  proposal_count: Scalars['Int']['output'];
  /** Minimum voting power required to create a proposal */
  proposal_threshold: Scalars['BigDecimalVP']['output'];
  /** All proposals belonging to this space */
  proposals: Array<Proposal>;
  /** Number of unique proposers in this space */
  proposer_count: Scalars['Int']['output'];
  /** Protocol of the space ('snapshot-x', 'governor-bravo') */
  protocol: Scalars['String']['output'];
  /** Array of strategy contract addresses */
  strategies: Array<Scalars['String']['output']>;
  /** Array of decimal places for each strategy's voting power */
  strategies_decimals: Array<Scalars['Int']['output']>;
  /** Array of strategy indices currently active */
  strategies_indices: Array<Scalars['Int']['output']>;
  /** Array of strategy metadata as JSON strings */
  strategies_metadata: Array<Scalars['String']['output']>;
  /** Array of strategy parameters as encoded strings */
  strategies_params: Array<Scalars['String']['output']>;
  /** Parsed strategy metadata with structured data */
  strategies_parsed_metadata: Array<StrategiesParsedMetadataItem>;
  /** Whether the space has turbo mode enabled (premium space) */
  turbo: Scalars['Boolean']['output'];
  /** Transaction hash of space creation */
  tx: Scalars['String']['output'];
  /** Main validation strategy contract address */
  validation_strategy: Scalars['String']['output'];
  /** Parameters for the validation strategy */
  validation_strategy_params: Scalars['Text']['output'];
  /** Whether the space is verified by Snapshot team */
  verified: Scalars['Boolean']['output'];
  /** Total number of votes cast in this space */
  vote_count: Scalars['Int']['output'];
  /** Number of unique voters in this space */
  voter_count: Scalars['Int']['output'];
  /** Delay before voting starts after proposal creation (blocks on EVM, seconds on Starknet) */
  voting_delay: Scalars['BigInt']['output'];
  /** Parsed metadata for voting power validation strategies */
  voting_power_validation_strategies_parsed_metadata: Array<VotingPowerValidationStrategiesParsedMetadataItem>;
  /** Metadata for voting power validation strategies */
  voting_power_validation_strategy_metadata: Scalars['String']['output'];
  /** Array of voting power validation strategy addresses */
  voting_power_validation_strategy_strategies: Array<Scalars['String']['output']>;
  /** Array of parameters for voting power validation strategies */
  voting_power_validation_strategy_strategies_params: Array<Scalars['String']['output']>;
  /** Number of decimal places for voting power display */
  vp_decimals: Scalars['Int']['output'];
};

/** Metadata for a Space containing display information and configuration */
export type SpaceMetadataItem = {
  __typename?: 'SpaceMetadataItem';
  _indexer: Scalars['String']['output'];
  /** Description of the space and its purpose */
  about: Scalars['String']['output'];
  /** Avatar image URL for the space */
  avatar: Scalars['String']['output'];
  /** Clanker token address */
  clanker: Scalars['String']['output'];
  /** Cover image URL for the space */
  cover: Scalars['String']['output'];
  /** Array of delegation contract addresses */
  delegations: Array<Scalars['String']['output']>;
  /** Discord server invite link */
  discord: Scalars['String']['output'];
  /** Array of executor contract addresses */
  executors: Array<Scalars['String']['output']>;
  /** Array of executor destination addresses */
  executors_destinations: Array<Scalars['String']['output']>;
  /** Array of execution strategy configurations */
  executors_strategies: Array<ExecutionStrategy>;
  /** Array of executor types (e.g., 'SimpleQuorum', 'Timelock') */
  executors_types: Array<Scalars['String']['output']>;
  /** External website URL for the space */
  external_url: Scalars['String']['output'];
  /** Farcaster profile or channel */
  farcaster: Scalars['String']['output'];
  /** GitHub organization or repository link */
  github: Scalars['String']['output'];
  /** Unique identifier for the metadata item */
  id: Scalars['String']['output'];
  /** List of labels that can be used on this space for tagging proposals */
  labels: Array<Scalars['String']['output']>;
  /** Display name of the space */
  name: Scalars['String']['output'];
  /** Array of treasury contract addresses */
  treasuries: Array<Scalars['String']['output']>;
  /** Twitter/X handle or URL */
  twitter: Scalars['String']['output'];
  /** Symbol for voting power display (e.g., 'UNI', 'AAVE') */
  voting_power_symbol: Scalars['String']['output'];
  /** Unused field (legacy) */
  wallet: Scalars['String']['output'];
};

export type SpaceMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  about?: InputMaybe<Scalars['String']['input']>;
  about_contains?: InputMaybe<Scalars['String']['input']>;
  about_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  about_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  about_not?: InputMaybe<Scalars['String']['input']>;
  about_not_contains?: InputMaybe<Scalars['String']['input']>;
  about_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  about_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  avatar_contains?: InputMaybe<Scalars['String']['input']>;
  avatar_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  avatar_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  avatar_not?: InputMaybe<Scalars['String']['input']>;
  avatar_not_contains?: InputMaybe<Scalars['String']['input']>;
  avatar_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  avatar_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clanker?: InputMaybe<Scalars['String']['input']>;
  clanker_contains?: InputMaybe<Scalars['String']['input']>;
  clanker_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clanker_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clanker_not?: InputMaybe<Scalars['String']['input']>;
  clanker_not_contains?: InputMaybe<Scalars['String']['input']>;
  clanker_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clanker_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cover?: InputMaybe<Scalars['String']['input']>;
  cover_contains?: InputMaybe<Scalars['String']['input']>;
  cover_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  cover_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cover_not?: InputMaybe<Scalars['String']['input']>;
  cover_not_contains?: InputMaybe<Scalars['String']['input']>;
  cover_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  cover_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  discord?: InputMaybe<Scalars['String']['input']>;
  discord_contains?: InputMaybe<Scalars['String']['input']>;
  discord_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discord_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  discord_not?: InputMaybe<Scalars['String']['input']>;
  discord_not_contains?: InputMaybe<Scalars['String']['input']>;
  discord_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discord_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  external_url?: InputMaybe<Scalars['String']['input']>;
  external_url_contains?: InputMaybe<Scalars['String']['input']>;
  external_url_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  external_url_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  external_url_not?: InputMaybe<Scalars['String']['input']>;
  external_url_not_contains?: InputMaybe<Scalars['String']['input']>;
  external_url_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  external_url_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  farcaster?: InputMaybe<Scalars['String']['input']>;
  farcaster_contains?: InputMaybe<Scalars['String']['input']>;
  farcaster_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farcaster_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  farcaster_not?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_contains?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  github?: InputMaybe<Scalars['String']['input']>;
  github_contains?: InputMaybe<Scalars['String']['input']>;
  github_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  github_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  github_not?: InputMaybe<Scalars['String']['input']>;
  github_not_contains?: InputMaybe<Scalars['String']['input']>;
  github_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  github_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  twitter_contains?: InputMaybe<Scalars['String']['input']>;
  twitter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  twitter_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  twitter_not?: InputMaybe<Scalars['String']['input']>;
  twitter_not_contains?: InputMaybe<Scalars['String']['input']>;
  twitter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  twitter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_symbol?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_symbol_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  wallet?: InputMaybe<Scalars['String']['input']>;
  wallet_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  wallet_not?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum SpaceMetadataItem_OrderBy {
  Indexer = '_indexer',
  About = 'about',
  Avatar = 'avatar',
  Clanker = 'clanker',
  Cover = 'cover',
  Discord = 'discord',
  ExternalUrl = 'external_url',
  Farcaster = 'farcaster',
  Github = 'github',
  Id = 'id',
  Name = 'name',
  Twitter = 'twitter',
  VotingPowerSymbol = 'voting_power_symbol',
  Wallet = 'wallet'
}

export type Space_SpaceMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  about?: InputMaybe<Scalars['String']['input']>;
  about_contains?: InputMaybe<Scalars['String']['input']>;
  about_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  about_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  about_not?: InputMaybe<Scalars['String']['input']>;
  about_not_contains?: InputMaybe<Scalars['String']['input']>;
  about_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  about_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  avatar_contains?: InputMaybe<Scalars['String']['input']>;
  avatar_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  avatar_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  avatar_not?: InputMaybe<Scalars['String']['input']>;
  avatar_not_contains?: InputMaybe<Scalars['String']['input']>;
  avatar_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  avatar_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clanker?: InputMaybe<Scalars['String']['input']>;
  clanker_contains?: InputMaybe<Scalars['String']['input']>;
  clanker_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clanker_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clanker_not?: InputMaybe<Scalars['String']['input']>;
  clanker_not_contains?: InputMaybe<Scalars['String']['input']>;
  clanker_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  clanker_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cover?: InputMaybe<Scalars['String']['input']>;
  cover_contains?: InputMaybe<Scalars['String']['input']>;
  cover_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  cover_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cover_not?: InputMaybe<Scalars['String']['input']>;
  cover_not_contains?: InputMaybe<Scalars['String']['input']>;
  cover_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  cover_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  discord?: InputMaybe<Scalars['String']['input']>;
  discord_contains?: InputMaybe<Scalars['String']['input']>;
  discord_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discord_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  discord_not?: InputMaybe<Scalars['String']['input']>;
  discord_not_contains?: InputMaybe<Scalars['String']['input']>;
  discord_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  discord_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  external_url?: InputMaybe<Scalars['String']['input']>;
  external_url_contains?: InputMaybe<Scalars['String']['input']>;
  external_url_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  external_url_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  external_url_not?: InputMaybe<Scalars['String']['input']>;
  external_url_not_contains?: InputMaybe<Scalars['String']['input']>;
  external_url_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  external_url_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  farcaster?: InputMaybe<Scalars['String']['input']>;
  farcaster_contains?: InputMaybe<Scalars['String']['input']>;
  farcaster_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farcaster_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  farcaster_not?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_contains?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  farcaster_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  github?: InputMaybe<Scalars['String']['input']>;
  github_contains?: InputMaybe<Scalars['String']['input']>;
  github_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  github_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  github_not?: InputMaybe<Scalars['String']['input']>;
  github_not_contains?: InputMaybe<Scalars['String']['input']>;
  github_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  github_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  twitter_contains?: InputMaybe<Scalars['String']['input']>;
  twitter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  twitter_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  twitter_not?: InputMaybe<Scalars['String']['input']>;
  twitter_not_contains?: InputMaybe<Scalars['String']['input']>;
  twitter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  twitter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_symbol?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_symbol_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  wallet?: InputMaybe<Scalars['String']['input']>;
  wallet_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  wallet_not?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains?: InputMaybe<Scalars['String']['input']>;
  wallet_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  wallet_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_?: InputMaybe<Space_SpaceMetadataItem_Filter>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum Space_OrderBy {
  Indexer = '_indexer',
  ActiveProposalCount = 'active_proposal_count',
  Controller = 'controller',
  Created = 'created',
  Id = 'id',
  Link = 'link',
  MaxVotingPeriod = 'max_voting_period',
  Metadata = 'metadata',
  MinVotingPeriod = 'min_voting_period',
  NextStrategyIndex = 'next_strategy_index',
  ProposalCount = 'proposal_count',
  ProposalThreshold = 'proposal_threshold',
  ProposerCount = 'proposer_count',
  Protocol = 'protocol',
  Turbo = 'turbo',
  Tx = 'tx',
  ValidationStrategy = 'validation_strategy',
  ValidationStrategyParams = 'validation_strategy_params',
  Verified = 'verified',
  VoteCount = 'vote_count',
  VoterCount = 'voter_count',
  VotingDelay = 'voting_delay',
  VotingPowerValidationStrategyMetadata = 'voting_power_validation_strategy_metadata',
  VpDecimals = 'vp_decimals'
}

/** Starknet L1 execution tracking for cross-chain proposal execution */
export type StarknetL1Execution = {
  __typename?: 'StarknetL1Execution';
  _indexer: Scalars['String']['output'];
  /** Timestamp when L1 execution was initiated */
  created: Scalars['Int']['output'];
  /** Unique identifier for the L1 execution */
  id: Scalars['String']['output'];
  /** Proposal ID being executed on L1 */
  proposalId: Scalars['Int']['output'];
  /** Space ID where the proposal originated */
  space: Scalars['String']['output'];
  /** Transaction hash of L1 execution */
  tx: Scalars['String']['output'];
};

export type StarknetL1Execution_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposalId?: InputMaybe<Scalars['Int']['input']>;
  proposalId_gt?: InputMaybe<Scalars['Int']['input']>;
  proposalId_gte?: InputMaybe<Scalars['Int']['input']>;
  proposalId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposalId_lt?: InputMaybe<Scalars['Int']['input']>;
  proposalId_lte?: InputMaybe<Scalars['Int']['input']>;
  proposalId_not?: InputMaybe<Scalars['Int']['input']>;
  proposalId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum StarknetL1Execution_OrderBy {
  Indexer = '_indexer',
  Created = 'created',
  Id = 'id',
  ProposalId = 'proposalId',
  Space = 'space',
  Tx = 'tx'
}

/** Parsed metadata data for strategies containing token and display information */
export type StrategiesParsedMetadataDataItem = {
  __typename?: 'StrategiesParsedMetadataDataItem';
  _indexer: Scalars['String']['output'];
  /** Number of decimal places for the token */
  decimals: Scalars['Int']['output'];
  /** Description of what the strategy does */
  description: Scalars['String']['output'];
  /** Unique identifier for the data item */
  id: Scalars['String']['output'];
  /** Display name of the strategy */
  name: Scalars['String']['output'];
  /** Additional strategy-specific payload data */
  payload?: Maybe<Scalars['String']['output']>;
  /** Token symbol (e.g., 'UNI', 'AAVE') */
  symbol: Scalars['String']['output'];
  /** Token contract address (optional) */
  token?: Maybe<Scalars['String']['output']>;
};

export type StrategiesParsedMetadataDataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not?: InputMaybe<Scalars['String']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload?: InputMaybe<Scalars['String']['input']>;
  payload_contains?: InputMaybe<Scalars['String']['input']>;
  payload_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload_not?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum StrategiesParsedMetadataDataItem_OrderBy {
  Indexer = '_indexer',
  Decimals = 'decimals',
  Description = 'description',
  Id = 'id',
  Name = 'name',
  Payload = 'payload',
  Symbol = 'symbol',
  Token = 'token'
}

/** Parsed metadata for voting strategies */
export type StrategiesParsedMetadataItem = {
  __typename?: 'StrategiesParsedMetadataItem';
  _indexer: Scalars['String']['output'];
  /** Parsed metadata data for the strategy */
  data?: Maybe<StrategiesParsedMetadataDataItem>;
  /** Unique identifier for the metadata item */
  id: Scalars['String']['output'];
  /** Index of the strategy in the space */
  index: Scalars['Int']['output'];
  /** Space this strategy belongs to */
  space: Space;
};

export type StrategiesParsedMetadataItem_Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type StrategiesParsedMetadataItem_StrategiesParsedMetadataDataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not?: InputMaybe<Scalars['String']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload?: InputMaybe<Scalars['String']['input']>;
  payload_contains?: InputMaybe<Scalars['String']['input']>;
  payload_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload_not?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type StrategiesParsedMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  data?: InputMaybe<Scalars['String']['input']>;
  data_?: InputMaybe<StrategiesParsedMetadataItem_StrategiesParsedMetadataDataItem_Filter>;
  data_contains?: InputMaybe<Scalars['String']['input']>;
  data_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  data_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  data_not?: InputMaybe<Scalars['String']['input']>;
  data_not_contains?: InputMaybe<Scalars['String']['input']>;
  data_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  data_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  index?: InputMaybe<Scalars['Int']['input']>;
  index_gt?: InputMaybe<Scalars['Int']['input']>;
  index_gte?: InputMaybe<Scalars['Int']['input']>;
  index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  index_lt?: InputMaybe<Scalars['Int']['input']>;
  index_lte?: InputMaybe<Scalars['Int']['input']>;
  index_not?: InputMaybe<Scalars['Int']['input']>;
  index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_?: InputMaybe<StrategiesParsedMetadataItem_Space_Filter>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum StrategiesParsedMetadataItem_OrderBy {
  Indexer = '_indexer',
  Data = 'data',
  Id = 'id',
  Index = 'index',
  Space = 'space'
}

/** User represents a governance participant (voter or proposer) */
export type User = {
  __typename?: 'User';
  _indexer: Scalars['String']['output'];
  /** Type of address (1 for Ethereum, 2 for Starknet) */
  address_type: Scalars['Int']['output'];
  /** Timestamp when user first interacted */
  created: Scalars['Int']['output'];
  /** Unique identifier for the user (wallet address) */
  id: Scalars['String']['output'];
  /** Number of proposals created by this user */
  proposal_count: Scalars['Int']['output'];
  /** All proposals created by this user */
  proposals: Array<Proposal>;
  /** Number of votes cast by this user */
  vote_count: Scalars['Int']['output'];
  /** All votes cast by this user */
  votes: Array<Vote>;
};

export type User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_type?: InputMaybe<Scalars['Int']['input']>;
  address_type_gt?: InputMaybe<Scalars['Int']['input']>;
  address_type_gte?: InputMaybe<Scalars['Int']['input']>;
  address_type_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  address_type_lt?: InputMaybe<Scalars['Int']['input']>;
  address_type_lte?: InputMaybe<Scalars['Int']['input']>;
  address_type_not?: InputMaybe<Scalars['Int']['input']>;
  address_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum User_OrderBy {
  Indexer = '_indexer',
  AddressType = 'address_type',
  Created = 'created',
  Id = 'id',
  ProposalCount = 'proposal_count',
  VoteCount = 'vote_count'
}

/** Vote represents a user's vote on a specific proposal */
export type Vote = {
  __typename?: 'Vote';
  _indexer: Scalars['String']['output'];
  /** Voting choice (1, 2, 3, etc.) */
  choice: Scalars['Int']['output'];
  /** Timestamp when vote was cast */
  created: Scalars['Int']['output'];
  /** Unique identifier for the vote */
  id: Scalars['String']['output'];
  /** Vote metadata containing optional reason */
  metadata?: Maybe<VoteMetadataItem>;
  /** ID of the proposal being voted on */
  proposal: Scalars['String']['output'];
  /** Space where the vote was cast */
  space: Space;
  /** Transaction hash of the vote */
  tx: Scalars['String']['output'];
  /** User who cast the vote */
  voter: User;
  /** Voting power used for this vote */
  vp: Scalars['BigDecimalVP']['output'];
  /** Parsed voting power as float */
  vp_parsed: Scalars['Float']['output'];
};

/** Metadata for a vote containing optional reasoning */
export type VoteMetadataItem = {
  __typename?: 'VoteMetadataItem';
  _indexer: Scalars['String']['output'];
  /** Unique identifier for the metadata item */
  id: Scalars['String']['output'];
  /** Optional reason provided by the voter */
  reason: Scalars['Text']['output'];
};

export type VoteMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  reason_contains?: InputMaybe<Scalars['String']['input']>;
  reason_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VoteMetadataItem_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  Reason = 'reason'
}

export type Vote_Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Vote_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  address_type?: InputMaybe<Scalars['Int']['input']>;
  address_type_gt?: InputMaybe<Scalars['Int']['input']>;
  address_type_gte?: InputMaybe<Scalars['Int']['input']>;
  address_type_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  address_type_lt?: InputMaybe<Scalars['Int']['input']>;
  address_type_lte?: InputMaybe<Scalars['Int']['input']>;
  address_type_not?: InputMaybe<Scalars['Int']['input']>;
  address_type_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Vote_VoteMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  reason_contains?: InputMaybe<Scalars['String']['input']>;
  reason_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains?: InputMaybe<Scalars['String']['input']>;
  reason_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type Vote_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  choice?: InputMaybe<Scalars['Int']['input']>;
  choice_gt?: InputMaybe<Scalars['Int']['input']>;
  choice_gte?: InputMaybe<Scalars['Int']['input']>;
  choice_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  choice_lt?: InputMaybe<Scalars['Int']['input']>;
  choice_lte?: InputMaybe<Scalars['Int']['input']>;
  choice_not?: InputMaybe<Scalars['Int']['input']>;
  choice_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_?: InputMaybe<Vote_VoteMetadataItem_Filter>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal?: InputMaybe<Scalars['String']['input']>;
  proposal_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  proposal_not?: InputMaybe<Scalars['String']['input']>;
  proposal_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposal_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_?: InputMaybe<Vote_Space_Filter>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voter?: InputMaybe<Scalars['String']['input']>;
  voter_?: InputMaybe<Vote_User_Filter>;
  voter_contains?: InputMaybe<Scalars['String']['input']>;
  voter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voter_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voter_not?: InputMaybe<Scalars['String']['input']>;
  voter_not_contains?: InputMaybe<Scalars['String']['input']>;
  voter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  vp_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  vp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  vp_parsed?: InputMaybe<Scalars['Float']['input']>;
  vp_parsed_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  vp_parsed_not?: InputMaybe<Scalars['Float']['input']>;
  vp_parsed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

export enum Vote_OrderBy {
  Indexer = '_indexer',
  Choice = 'choice',
  Created = 'created',
  Id = 'id',
  Metadata = 'metadata',
  Proposal = 'proposal',
  Space = 'space',
  Tx = 'tx',
  Voter = 'voter',
  Vp = 'vp',
  VpParsed = 'vp_parsed'
}

/** Parsed metadata for voting power validation strategies */
export type VotingPowerValidationStrategiesParsedMetadataItem = {
  __typename?: 'VotingPowerValidationStrategiesParsedMetadataItem';
  _indexer: Scalars['String']['output'];
  /** Parsed metadata data for the validation strategy */
  data?: Maybe<StrategiesParsedMetadataDataItem>;
  /** Unique identifier for the metadata item */
  id: Scalars['String']['output'];
  /** Index of the validation strategy in the space */
  index: Scalars['Int']['output'];
  /** Space this validation strategy belongs to */
  space: Space;
};

export type VotingPowerValidationStrategiesParsedMetadataItem_Space_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  active_proposal_count?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  active_proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  active_proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  controller?: InputMaybe<Scalars['String']['input']>;
  controller_contains?: InputMaybe<Scalars['String']['input']>;
  controller_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  controller_not?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains?: InputMaybe<Scalars['String']['input']>;
  controller_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  controller_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  created?: InputMaybe<Scalars['Int']['input']>;
  created_gt?: InputMaybe<Scalars['Int']['input']>;
  created_gte?: InputMaybe<Scalars['Int']['input']>;
  created_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  created_lt?: InputMaybe<Scalars['Int']['input']>;
  created_lte?: InputMaybe<Scalars['Int']['input']>;
  created_not?: InputMaybe<Scalars['Int']['input']>;
  created_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  max_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  max_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  max_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  metadata_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  metadata_not?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  min_voting_period?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_gte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  min_voting_period_lt?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_lte?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not?: InputMaybe<Scalars['BigInt']['input']>;
  min_voting_period_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  next_strategy_index?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_gte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  next_strategy_index_lt?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_lte?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not?: InputMaybe<Scalars['Int']['input']>;
  next_strategy_index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposal_threshold?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_gte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposal_threshold_lt?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_lte?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not?: InputMaybe<Scalars['BigDecimalVP']['input']>;
  proposal_threshold_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalVP']['input']>>>;
  proposer_count?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_gte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  proposer_count_lt?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_lte?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not?: InputMaybe<Scalars['Int']['input']>;
  proposer_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  turbo?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  turbo_not?: InputMaybe<Scalars['Boolean']['input']>;
  turbo_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  tx?: InputMaybe<Scalars['String']['input']>;
  tx_contains?: InputMaybe<Scalars['String']['input']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tx_not?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains?: InputMaybe<Scalars['String']['input']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_not?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  validation_strategy_params_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains?: InputMaybe<Scalars['String']['input']>;
  validation_strategy_params_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  verified_not?: InputMaybe<Scalars['Boolean']['input']>;
  verified_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  vote_count?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_gte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']['input']>;
  vote_count_lte?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not?: InputMaybe<Scalars['Int']['input']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_gte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voter_count_lt?: InputMaybe<Scalars['Int']['input']>;
  voter_count_lte?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not?: InputMaybe<Scalars['Int']['input']>;
  voter_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  voting_delay?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_gte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_delay_lt?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_lte?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not?: InputMaybe<Scalars['BigInt']['input']>;
  voting_delay_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  voting_power_validation_strategy_metadata?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voting_power_validation_strategy_metadata_not?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  voting_power_validation_strategy_metadata_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  vp_decimals?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  vp_decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not?: InputMaybe<Scalars['Int']['input']>;
  vp_decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type VotingPowerValidationStrategiesParsedMetadataItem_StrategiesParsedMetadataDataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not?: InputMaybe<Scalars['String']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload?: InputMaybe<Scalars['String']['input']>;
  payload_contains?: InputMaybe<Scalars['String']['input']>;
  payload_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payload_not?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains?: InputMaybe<Scalars['String']['input']>;
  payload_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  payload_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type VotingPowerValidationStrategiesParsedMetadataItem_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  data?: InputMaybe<Scalars['String']['input']>;
  data_?: InputMaybe<VotingPowerValidationStrategiesParsedMetadataItem_StrategiesParsedMetadataDataItem_Filter>;
  data_contains?: InputMaybe<Scalars['String']['input']>;
  data_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  data_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  data_not?: InputMaybe<Scalars['String']['input']>;
  data_not_contains?: InputMaybe<Scalars['String']['input']>;
  data_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  data_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  index?: InputMaybe<Scalars['Int']['input']>;
  index_gt?: InputMaybe<Scalars['Int']['input']>;
  index_gte?: InputMaybe<Scalars['Int']['input']>;
  index_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  index_lt?: InputMaybe<Scalars['Int']['input']>;
  index_lte?: InputMaybe<Scalars['Int']['input']>;
  index_not?: InputMaybe<Scalars['Int']['input']>;
  index_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  space?: InputMaybe<Scalars['String']['input']>;
  space_?: InputMaybe<VotingPowerValidationStrategiesParsedMetadataItem_Space_Filter>;
  space_contains?: InputMaybe<Scalars['String']['input']>;
  space_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  space_not?: InputMaybe<Scalars['String']['input']>;
  space_not_contains?: InputMaybe<Scalars['String']['input']>;
  space_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  space_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum VotingPowerValidationStrategiesParsedMetadataItem_OrderBy {
  Indexer = '_indexer',
  Data = 'data',
  Id = 'id',
  Index = 'index',
  Space = 'space'
}

/** Contract and Block where its event is found. */
export type _Checkpoint = {
  __typename?: '_Checkpoint';
  block_number: Scalars['Int']['output'];
  contract_address: Scalars['String']['output'];
  /** id computed as last 5 bytes of sha256(contract+block) */
  id: Scalars['ID']['output'];
  indexer: Scalars['String']['output'];
};

export type _Checkpoint_Filter = {
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_number_gt?: InputMaybe<Scalars['Int']['input']>;
  block_number_gte?: InputMaybe<Scalars['Int']['input']>;
  block_number_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  block_number_lt?: InputMaybe<Scalars['Int']['input']>;
  block_number_lte?: InputMaybe<Scalars['Int']['input']>;
  block_number_not?: InputMaybe<Scalars['Int']['input']>;
  block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contract_address?: InputMaybe<Scalars['String']['input']>;
  contract_address_contains?: InputMaybe<Scalars['String']['input']>;
  contract_address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  contract_address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contract_address_not?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_contains?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  indexer_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  indexer_not?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum _Checkpoint_OrderBy {
  BlockNumber = 'block_number',
  ContractAddress = 'contract_address',
  Id = 'id',
  Indexer = 'indexer'
}

/** Core metadata values used internally by Checkpoint */
export type _Metadata = {
  __typename?: '_Metadata';
  /** example: last_indexed_block */
  id: Scalars['ID']['output'];
  indexer: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type _Metadata_Filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  indexer_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  indexer_not?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value?: InputMaybe<Scalars['String']['input']>;
  value_contains?: InputMaybe<Scalars['String']['input']>;
  value_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value_not?: InputMaybe<Scalars['String']['input']>;
  value_not_contains?: InputMaybe<Scalars['String']['input']>;
  value_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum _Metadata_OrderBy {
  Id = 'id',
  Indexer = 'indexer',
  Value = 'value'
}

export type ProposalFieldsFragment = { __typename?: 'Proposal', id: string, proposal_id: string, max_end: any, scores_1: any, scores_2: any, scores_3: any, scores_total: any, created: number, vote_count: number, space: { __typename?: 'Space', id: string, authenticators: Array<string> }, author: { __typename?: 'User', id: string }, metadata?: { __typename?: 'ProposalMetadataItem', title?: any | null, body?: any | null } | null };

export type ProposalQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id: string, proposal_id: string, max_end: any, scores_1: any, scores_2: any, scores_3: any, scores_total: any, created: number, vote_count: number, space: { __typename?: 'Space', id: string, authenticators: Array<string> }, author: { __typename?: 'User', id: string }, metadata?: { __typename?: 'ProposalMetadataItem', title?: any | null, body?: any | null } | null } | null };

export type ProposalsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  skip: Scalars['Int']['input'];
  where?: InputMaybe<Proposal_Filter>;
}>;


export type ProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, proposal_id: string, max_end: any, scores_1: any, scores_2: any, scores_3: any, scores_total: any, created: number, vote_count: number, space: { __typename?: 'Space', id: string, authenticators: Array<string> }, author: { __typename?: 'User', id: string }, metadata?: { __typename?: 'ProposalMetadataItem', title?: any | null, body?: any | null } | null }> };

export type VoteFieldsFragment = { __typename?: 'Vote', id: string, proposal: string, choice: number, vp: any, created: number, tx: string, voter: { __typename?: 'User', id: string }, space: { __typename?: 'Space', id: string }, metadata?: { __typename?: 'VoteMetadataItem', reason: any } | null };

export type UserVotesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  spaceIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  voter?: InputMaybe<Scalars['String']['input']>;
}>;


export type UserVotesQuery = { __typename?: 'Query', votes: Array<{ __typename?: 'Vote', id: string, proposal: string, choice: number, vp: any, created: number, tx: string, voter: { __typename?: 'User', id: string }, space: { __typename?: 'Space', id: string }, metadata?: { __typename?: 'VoteMetadataItem', reason: any } | null }> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const ProposalFieldsFragmentDoc = new TypedDocumentString(`
    fragment proposalFields on Proposal {
  id
  proposal_id
  space {
    id
    authenticators
  }
  author {
    id
  }
  metadata {
    title
    body
  }
  max_end
  scores_1
  scores_2
  scores_3
  scores_total
  created
  vote_count
}
    `, {"fragmentName":"proposalFields"}) as unknown as TypedDocumentString<ProposalFieldsFragment, unknown>;
export const VoteFieldsFragmentDoc = new TypedDocumentString(`
    fragment voteFields on Vote {
  id
  voter {
    id
  }
  space {
    id
  }
  metadata {
    reason
  }
  proposal
  choice
  vp
  created
  tx
}
    `, {"fragmentName":"voteFields"}) as unknown as TypedDocumentString<VoteFieldsFragment, unknown>;
export const ProposalDocument = new TypedDocumentString(`
    query Proposal($id: String!) {
  proposal(id: $id) {
    ...proposalFields
  }
}
    fragment proposalFields on Proposal {
  id
  proposal_id
  space {
    id
    authenticators
  }
  author {
    id
  }
  metadata {
    title
    body
  }
  max_end
  scores_1
  scores_2
  scores_3
  scores_total
  created
  vote_count
}`) as unknown as TypedDocumentString<ProposalQuery, ProposalQueryVariables>;
export const ProposalsDocument = new TypedDocumentString(`
    query Proposals($first: Int!, $skip: Int!, $where: Proposal_filter) {
  proposals(
    first: $first
    skip: $skip
    where: $where
    orderBy: created
    orderDirection: desc
  ) {
    ...proposalFields
  }
}
    fragment proposalFields on Proposal {
  id
  proposal_id
  space {
    id
    authenticators
  }
  author {
    id
  }
  metadata {
    title
    body
  }
  max_end
  scores_1
  scores_2
  scores_3
  scores_total
  created
  vote_count
}`) as unknown as TypedDocumentString<ProposalsQuery, ProposalsQueryVariables>;
export const UserVotesDocument = new TypedDocumentString(`
    query UserVotes($first: Int, $skip: Int, $spaceIds: [String], $voter: String) {
  votes(
    first: $first
    skip: $skip
    orderBy: proposal
    orderDirection: desc
    where: {space_in: $spaceIds, voter: $voter}
  ) {
    ...voteFields
  }
}
    fragment voteFields on Vote {
  id
  voter {
    id
  }
  space {
    id
  }
  metadata {
    reason
  }
  proposal
  choice
  vp
  created
  tx
}`) as unknown as TypedDocumentString<UserVotesQuery, UserVotesQueryVariables>;