CREATE OR REPLACE FUNCTION pg_temp.normalize_starknet_address(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  numeric_value numeric;
  remainder integer;
  hex_value text := '';
BEGIN
  IF input ~* '^0x[0-9a-f]+$' THEN
    hex_value := regexp_replace(lower(input), '^0x0*', '');
    IF hex_value = '' THEN
      RAISE EXCEPTION 'Invalid zero Starknet address';
    END IF;
    RETURN '0x' || hex_value;
  END IF;

  IF input !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid Starknet address: %', input;
  END IF;

  numeric_value := input::numeric;
  IF numeric_value <= 0 THEN
    RAISE EXCEPTION 'Invalid zero Starknet address';
  END IF;

  WHILE numeric_value > 0 LOOP
    remainder := mod(numeric_value, 16)::integer;
    hex_value := substr('0123456789abcdef', remainder + 1, 1) || hex_value;
    numeric_value := trunc(numeric_value / 16);
  END LOOP;

  RETURN '0x' || hex_value;
END;
$$;

UPDATE realms_lords_claims
SET recipient = pg_temp.normalize_starknet_address(recipient);

UPDATE velords_rewards_received
SET sender = pg_temp.normalize_starknet_address(sender);

UPDATE velords_lords_locked
SET owner = pg_temp.normalize_starknet_address(owner);

UPDATE velords_burner_transfers
SET sender = pg_temp.normalize_starknet_address(sender);
