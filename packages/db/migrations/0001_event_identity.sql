ALTER TABLE realms_lords_claims
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE realms_lords_claims
SET _id = hash || ':legacy:' || amount::text;

ALTER TABLE realms_lords_claims
  DROP CONSTRAINT IF EXISTS realms_lords_claims_pkey;
ALTER TABLE realms_lords_claims
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE realms_lords_claims
  ADD CONSTRAINT realms_lords_claims_pkey PRIMARY KEY (_id);

ALTER TABLE velords_rewards_received
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_rewards_received
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

ALTER TABLE velords_rewards_received
  DROP CONSTRAINT IF EXISTS velords_rewards_received_pkey;
ALTER TABLE velords_rewards_received
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_rewards_received
  ADD CONSTRAINT velords_rewards_received_pkey PRIMARY KEY (_id);

ALTER TABLE velords_lords_locked
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_lords_locked
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

ALTER TABLE velords_lords_locked
  DROP CONSTRAINT IF EXISTS velords_lords_locked_pkey;
ALTER TABLE velords_lords_locked
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_lords_locked
  ADD CONSTRAINT velords_lords_locked_pkey PRIMARY KEY (_id);

ALTER TABLE velords_burner_transfers
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_burner_transfers
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

ALTER TABLE velords_burner_transfers
  DROP CONSTRAINT IF EXISTS velords_burner_transfers_pkey;
ALTER TABLE velords_burner_transfers
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_burner_transfers
  ADD CONSTRAINT velords_burner_transfers_pkey PRIMARY KEY (_id);
