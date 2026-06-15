-- Add unique public host profile slug derived from the user's name.
ALTER TABLE "users" ADD COLUMN "host_name" TEXT;

WITH slugs AS (
  SELECT
    id,
    TRIM(BOTH '-' FROM REGEXP_REPLACE(
      REGEXP_REPLACE(LOWER(TRIM(CONCAT(first_name, ' ', last_name))), '\s+', '-', 'g'),
      '[^a-z-]',
      '',
      'g'
    )) AS base
  FROM "users"
),
numbered AS (
  SELECT
    id,
    base,
    ROW_NUMBER() OVER (PARTITION BY base ORDER BY created_at ASC, id ASC) AS rn
  FROM slugs
  WHERE base <> ''
)
UPDATE "users" AS u
SET "host_name" = CASE
  WHEN n.rn = 1 THEN n.base
  ELSE n.base || '-' || n.rn::text
END
FROM numbered AS n
WHERE u.id = n.id;

CREATE UNIQUE INDEX "users_host_name_key" ON "users"("host_name");
