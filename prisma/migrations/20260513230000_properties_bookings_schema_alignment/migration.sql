DROP INDEX IF EXISTS "properties_user_id_status_idx";

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "room_type" TEXT NOT NULL DEFAULT '';

ALTER TABLE "properties" DROP COLUMN IF EXISTS "cleaning_fee";

ALTER TABLE "properties" DROP COLUMN IF EXISTS "status";

DROP INDEX IF EXISTS "properties_user_id_isPublished_idx";

CREATE INDEX IF NOT EXISTS "properties_user_id_isPublished_idx" ON "properties"("user_id", "isPublished");

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_guest_id_fkey";

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_user_id_fkey";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'guest_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'guest_user_id'
  ) THEN
    ALTER TABLE "bookings" RENAME COLUMN "guest_id" TO "guest_user_id";
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'host_user_id'
  ) THEN
    ALTER TABLE "bookings" RENAME COLUMN "user_id" TO "host_user_id";
  END IF;
END;
$$;

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "host_user_id" TEXT;

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guest_user_id" TEXT;

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "customer_id" TEXT;

UPDATE "bookings" b
SET "host_user_id" = p."user_id"
FROM "properties" p
WHERE b."property_id" = p."id" AND b."host_user_id" IS NULL;

UPDATE "bookings" b
SET "customer_id" = c."id"
FROM "customers" c
WHERE c."guest_user_id" = b."guest_user_id"
  AND c."host_user_id" = b."host_user_id"
  AND b."customer_id" IS NULL;

INSERT INTO "customers" ("id", "guest_user_id", "host_user_id", "first_name", "last_name", "email", "created_at", "updated_at")
SELECT gen_random_uuid()::text, b."guest_user_id", b."host_user_id", u."first_name", u."last_name", u."email", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "bookings" b
INNER JOIN "users" u ON u."id" = b."guest_user_id"
WHERE b."customer_id" IS NULL
ON CONFLICT ("guest_user_id", "host_user_id") DO NOTHING;

UPDATE "bookings" b
SET "customer_id" = c."id"
FROM "customers" c
WHERE c."guest_user_id" = b."guest_user_id"
  AND c."host_user_id" = b."host_user_id"
  AND b."customer_id" IS NULL;

ALTER TABLE "bookings" ALTER COLUMN "host_user_id" SET NOT NULL;

ALTER TABLE "bookings" ALTER COLUMN "guest_user_id" SET NOT NULL;

ALTER TABLE "bookings" ALTER COLUMN "customer_id" SET NOT NULL;

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_customer_id_fkey";

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_host_user_id_fkey";

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_guest_user_id_fkey";

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_user_id_fkey" FOREIGN KEY ("guest_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "bookings_guest_id_idx";

CREATE INDEX IF NOT EXISTS "bookings_guest_user_id_idx" ON "bookings"("guest_user_id");
