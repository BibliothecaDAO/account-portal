CREATE OR REPLACE FUNCTION pg_temp.canonical_bridge_request_id(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  parts text[];
  token_count integer;
  expected_length integer;
  part_index integer;
BEGIN
  IF left(input, 1) <> '{' THEN
    RETURN input;
  END IF;

  parts := input::text[];
  IF cardinality(parts) < 5 OR parts[5] !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid legacy bridge request id: %', input;
  END IF;
  IF parts[5]::numeric > 1073741821 THEN
    RAISE EXCEPTION 'Invalid token count in legacy bridge request id: %', input;
  END IF;

  token_count := parts[5]::integer;
  expected_length := 5 + token_count * 2;
  IF cardinality(parts) < expected_length THEN
    RAISE EXCEPTION 'Incomplete legacy bridge request id: %', input;
  END IF;

  FOR part_index IN 1..expected_length LOOP
    IF parts[part_index] !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Invalid legacy bridge request id: %', input;
    END IF;
  END LOOP;

  RETURN array_to_string(parts[1:expected_length], ':');
END;
$$;

ALTER TABLE realms_bridge_events
  ADD COLUMN IF NOT EXISTS _event_id text;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname
  INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'realms_bridge_events'::regclass
    AND contype = 'p';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE realms_bridge_events DROP CONSTRAINT %I',
      constraint_name
    );
  END IF;
END;
$$;

UPDATE realms_bridge_events AS canonical
SET
  hash = legacy.hash,
  timestamp = legacy.timestamp
FROM realms_bridge_events AS legacy
WHERE left(legacy._id, 1) = '{'
  AND canonical._id = pg_temp.canonical_bridge_request_id(legacy._id)
  AND canonical.type = legacy.type
  AND legacy.timestamp < canonical.timestamp;

DELETE FROM realms_bridge_events AS legacy
USING realms_bridge_events AS canonical
WHERE left(legacy._id, 1) = '{'
  AND canonical._id = pg_temp.canonical_bridge_request_id(legacy._id)
  AND canonical.type = legacy.type;

UPDATE realms_bridge_events
SET _id = pg_temp.canonical_bridge_request_id(_id)
WHERE left(_id, 1) = '{';

UPDATE realms_bridge_requests AS canonical
SET
  from_chain = legacy.from_chain,
  token_ids = legacy.token_ids,
  from_address = legacy.from_address,
  to_address = legacy.to_address,
  timestamp = legacy.timestamp,
  tx_hash = legacy.tx_hash,
  req_hash = legacy.req_hash
FROM realms_bridge_requests AS legacy
WHERE left(legacy._id, 1) = '{'
  AND canonical._id = pg_temp.canonical_bridge_request_id(legacy._id)
  AND legacy.timestamp < canonical.timestamp;

DELETE FROM realms_bridge_requests AS legacy
USING realms_bridge_requests AS canonical
WHERE left(legacy._id, 1) = '{'
  AND canonical._id = pg_temp.canonical_bridge_request_id(legacy._id);

UPDATE realms_bridge_requests
SET _id = pg_temp.canonical_bridge_request_id(_id)
WHERE left(_id, 1) = '{';

UPDATE realms_bridge_events
SET _event_id = _id || ':' || type::text;

ALTER TABLE realms_bridge_events
  DROP CONSTRAINT IF EXISTS realms_bridge_events_request_type_unique;
ALTER TABLE realms_bridge_events
  ALTER COLUMN _event_id SET NOT NULL;
ALTER TABLE realms_bridge_events
  ADD CONSTRAINT realms_bridge_events_pkey PRIMARY KEY (_event_id);
ALTER TABLE realms_bridge_events
  ADD CONSTRAINT realms_bridge_events_request_type_unique UNIQUE (_id, type);
