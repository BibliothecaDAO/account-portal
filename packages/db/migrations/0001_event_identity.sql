CREATE OR REPLACE FUNCTION pg_temp.drop_primary_key(target_table regclass)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname
  INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = target_table
    AND contype = 'p';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE %s DROP CONSTRAINT %I',
      target_table,
      constraint_name
    );
  END IF;
END;
$$;

ALTER TABLE realms_lords_claims
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE realms_lords_claims
SET _id = hash || ':legacy:' || amount::text
WHERE _id IS NULL;

SELECT pg_temp.drop_primary_key('realms_lords_claims'::regclass);
ALTER TABLE realms_lords_claims
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE realms_lords_claims
  ADD CONSTRAINT realms_lords_claims_pkey PRIMARY KEY (_id);

ALTER TABLE velords_rewards_received
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_rewards_received
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

SELECT pg_temp.drop_primary_key('velords_rewards_received'::regclass);
ALTER TABLE velords_rewards_received
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_rewards_received
  ADD CONSTRAINT velords_rewards_received_pkey PRIMARY KEY (_id);

ALTER TABLE velords_lords_locked
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_lords_locked
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

SELECT pg_temp.drop_primary_key('velords_lords_locked'::regclass);
ALTER TABLE velords_lords_locked
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_lords_locked
  ADD CONSTRAINT velords_lords_locked_pkey PRIMARY KEY (_id);

ALTER TABLE velords_burner_transfers
  ADD COLUMN IF NOT EXISTS _id text;

UPDATE velords_burner_transfers
SET _id = transaction_hash || ':legacy:' || amount::text
WHERE _id IS NULL;

SELECT pg_temp.drop_primary_key('velords_burner_transfers'::regclass);
ALTER TABLE velords_burner_transfers
  ALTER COLUMN _id SET NOT NULL;
ALTER TABLE velords_burner_transfers
  ADD CONSTRAINT velords_burner_transfers_pkey PRIMARY KEY (_id);
