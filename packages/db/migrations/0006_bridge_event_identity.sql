ALTER TABLE realms_bridge_events
  ADD COLUMN IF NOT EXISTS _event_id text;

UPDATE realms_bridge_events
SET _event_id = _id || ':' || type::text
WHERE _event_id IS NULL;

ALTER TABLE realms_bridge_events
  DROP CONSTRAINT IF EXISTS realms_bridge_events_pkey;
ALTER TABLE realms_bridge_events
  ALTER COLUMN _event_id SET NOT NULL;
ALTER TABLE realms_bridge_events
  ADD CONSTRAINT realms_bridge_events_pkey PRIMARY KEY (_event_id);
ALTER TABLE realms_bridge_events
  ADD CONSTRAINT realms_bridge_events_request_type_unique UNIQUE (_id, type);
