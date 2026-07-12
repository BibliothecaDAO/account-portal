WITH ranked_verifications AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY identifier
      ORDER BY
        updated_at DESC NULLS LAST,
        created_at DESC NULLS LAST,
        id DESC
    ) AS row_number
  FROM verification
)
DELETE FROM verification
WHERE id IN (
  SELECT id
  FROM ranked_verifications
  WHERE row_number > 1
);

ALTER TABLE verification
  ADD CONSTRAINT verification_identifier_unique UNIQUE (identifier);
