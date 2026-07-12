DO $$
BEGIN
  CREATE TYPE "BridgeEventType" AS ENUM (
    'deposit_initiated_l1',
    'deposit_initiated_l2',
    'withdraw_available_l1',
    'withdraw_completed_l1',
    'withdraw_completed_l2'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL,
  image text,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  address text UNIQUE
);

CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY NOT NULL,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  password text,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY NOT NULL,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY NOT NULL,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS realms_bridge_requests (
  _id text PRIMARY KEY NOT NULL,
  from_chain text NOT NULL,
  token_ids integer[] NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  timestamp timestamp NOT NULL,
  tx_hash text NOT NULL,
  req_hash numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS realms_bridge_events (
  _id text NOT NULL,
  hash text NOT NULL,
  type "BridgeEventType" NOT NULL,
  timestamp timestamp NOT NULL,
  CONSTRAINT realms_bridge_events__id_type_pk PRIMARY KEY (_id, type)
);

CREATE TABLE IF NOT EXISTS realms_lords_claims (
  _id text,
  hash text NOT NULL,
  amount numeric NOT NULL,
  recipient text NOT NULL,
  timestamp timestamp NOT NULL,
  CONSTRAINT realms_lords_claims_amount_hash_pk PRIMARY KEY (amount, hash)
);

CREATE TABLE IF NOT EXISTS velords_rewards_received (
  sender text NOT NULL,
  amount numeric NOT NULL,
  transaction_hash text NOT NULL,
  epoch timestamp(3) NOT NULL,
  CONSTRAINT velords_rewards_received_amount_transaction_hash_pk
    PRIMARY KEY (amount, transaction_hash)
);

CREATE TABLE IF NOT EXISTS velords_lords_locked (
  owner text NOT NULL,
  amount numeric NOT NULL,
  transaction_hash text NOT NULL,
  epoch timestamp(3) NOT NULL,
  end_time integer,
  CONSTRAINT velords_lords_locked_amount_transaction_hash_pk
    PRIMARY KEY (amount, transaction_hash)
);

CREATE TABLE IF NOT EXISTS velords_burner_transfers (
  sender text NOT NULL,
  amount numeric NOT NULL,
  transaction_hash text NOT NULL,
  timestamp timestamp(3) NOT NULL,
  CONSTRAINT velords_burner_transfers_amount_transaction_hash_pk
    PRIMARY KEY (amount, transaction_hash)
);

CREATE TABLE IF NOT EXISTS dune_velords_burns (
  source text NOT NULL,
  amount numeric NOT NULL,
  transaction_hash text NOT NULL,
  epoch timestamp(3) NOT NULL,
  epoch_total_amount numeric NOT NULL,
  sender_epoch_total_amount numeric NOT NULL,
  CONSTRAINT dune_velords_burns_amount_transaction_hash_pk
    PRIMARY KEY (amount, transaction_hash)
);

CREATE TABLE IF NOT EXISTS dune_velords_supply (
  old_supply text NOT NULL,
  new_supply numeric NOT NULL,
  transaction_hash text PRIMARY KEY NOT NULL,
  block_time timestamp(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS governances (
  uid uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  id varchar(256) NOT NULL,
  "currentDelegates" integer NOT NULL,
  "totalDelegates" integer NOT NULL,
  "delegatedVotesRaw" numeric(80, 0) NOT NULL,
  "delegatedVotes" numeric(80, 20) NOT NULL
);

CREATE TABLE IF NOT EXISTS delegates (
  uid uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  block_range int8range NOT NULL,
  id varchar(256) NOT NULL,
  governance varchar(256),
  "user" varchar(256) NOT NULL,
  "delegatedVotesRaw" numeric(80, 0) NOT NULL,
  "delegatedVotes" numeric(80, 20) NOT NULL,
  "tokenHoldersRepresentedAmount" integer NOT NULL,
  "tokenHoldersRepresented" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS delegate_profiles (
  id varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "delegateId" varchar(256) UNIQUE,
  statement text NOT NULL,
  interests text[],
  twitter text,
  github text,
  telegram text,
  discord text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS delegate_profiles_delegateId_index
  ON delegate_profiles USING btree ("delegateId");
CREATE INDEX IF NOT EXISTS delegates_delegatedvotes_index
  ON delegates USING btree ("delegatedVotes");
CREATE INDEX IF NOT EXISTS delegates_delegatedvotesraw_index
  ON delegates USING btree ("delegatedVotesRaw");
CREATE INDEX IF NOT EXISTS delegates_governance_index
  ON delegates USING btree (governance);
CREATE INDEX IF NOT EXISTS delegates_id_index
  ON delegates USING btree (id);
CREATE INDEX IF NOT EXISTS delegates_tokenholdersrepresented_index
  ON delegates USING btree ("tokenHoldersRepresented");
CREATE INDEX IF NOT EXISTS delegates_tokenholdersrepresentedamount_index
  ON delegates USING btree ("tokenHoldersRepresentedAmount");
CREATE INDEX IF NOT EXISTS delegates_user_index
  ON delegates USING btree ("user");
CREATE INDEX IF NOT EXISTS governances_currentdelegates_index
  ON governances USING btree ("currentDelegates");
CREATE INDEX IF NOT EXISTS governances_delegatedvotes_index
  ON governances USING btree ("delegatedVotes");
CREATE INDEX IF NOT EXISTS governances_delegatedvotesraw_index
  ON governances USING btree ("delegatedVotesRaw");
CREATE INDEX IF NOT EXISTS governances_id_index
  ON governances USING btree (id);
CREATE INDEX IF NOT EXISTS governances_totaldelegates_index
  ON governances USING btree ("totalDelegates");
