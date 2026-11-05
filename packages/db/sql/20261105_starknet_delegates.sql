-- Additive only: creates the delegates indexer's tables and touches nothing else.
-- Fails if they already exist.
BEGIN;
CREATE TABLE public.starknet_delegates (
  _id text PRIMARY KEY,
  address text NOT NULL,
  votes numeric(78, 0) NOT NULL,
  token_holders_represented integer NOT NULL,
  last_block_number numeric NOT NULL,
  last_event_index integer NOT NULL,
  last_transaction_hash text NOT NULL
);
CREATE INDEX starknet_delegates_votes_idx ON public.starknet_delegates (votes);
CREATE TABLE public.starknet_delegators (
  _id text PRIMARY KEY,
  delegator text NOT NULL,
  delegate text,
  last_block_number numeric NOT NULL,
  last_event_index integer NOT NULL,
  last_transaction_hash text NOT NULL
);
CREATE INDEX starknet_delegators_delegate_idx ON public.starknet_delegators (delegate);
CREATE TABLE public.starknet_delegates_status (
  _id text PRIMARY KEY,
  latest_block_number numeric NOT NULL,
  latest_block_timestamp timestamptz NOT NULL,
  last_processed_at timestamptz NOT NULL,
  has_reached_head boolean NOT NULL DEFAULT false
);
COMMIT;
