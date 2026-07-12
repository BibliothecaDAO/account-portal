CREATE OR REPLACE FUNCTION pg_temp.normalize_bridge_starknet_address(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  hex_value text;
BEGIN
  IF input !~* '^0x[0-9a-f]+$' THEN
    RAISE EXCEPTION 'Invalid Starknet bridge address: %', input;
  END IF;
  hex_value := regexp_replace(lower(input), '^0x0*', '');
  IF hex_value = '' THEN
    RAISE EXCEPTION 'Invalid zero Starknet bridge address';
  END IF;
  RETURN '0x' || hex_value;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.normalize_bridge_ethereum_address(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  hex_value text;
BEGIN
  IF input !~* '^0x[0-9a-f]+$' THEN
    RAISE EXCEPTION 'Invalid Ethereum bridge address: %', input;
  END IF;
  hex_value := regexp_replace(lower(input), '^0x0*', '');
  IF hex_value = '' OR length(hex_value) > 40 THEN
    RAISE EXCEPTION 'Invalid Ethereum bridge address: %', input;
  END IF;
  RETURN '0x' || lpad(hex_value, 40, '0');
END;
$$;

UPDATE realms_bridge_requests
SET
  from_address = to_address,
  to_address = from_address
WHERE
  from_chain IN ('0x534e5f4d41494e', '0x534e5f5345504f4c4941')
  AND length(regexp_replace(lower(from_address), '^0x0*', '')) <= 40
  AND length(regexp_replace(lower(to_address), '^0x0*', '')) > 40;

UPDATE realms_bridge_requests
SET
  from_address = CASE
    WHEN from_chain IN ('1', '11155111')
      THEN pg_temp.normalize_bridge_ethereum_address(from_address)
    ELSE pg_temp.normalize_bridge_starknet_address(from_address)
  END,
  to_address = CASE
    WHEN from_chain IN ('1', '11155111')
      THEN pg_temp.normalize_bridge_starknet_address(to_address)
    ELSE pg_temp.normalize_bridge_ethereum_address(to_address)
  END;
