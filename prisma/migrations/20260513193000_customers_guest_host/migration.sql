CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "guest_user_id" TEXT NOT NULL,
    "host_user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "vat_number" TEXT,
    "notes" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "customers" RENAME COLUMN "user_id" TO "guest_user_id";
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE "customers" RENAME COLUMN "host_id" TO "host_user_id";
  END IF;
END;
$$;

DROP INDEX IF EXISTS "customers_guest_user_id_host_user_id_key";

DROP INDEX IF EXISTS "customers_user_id_host_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "customers_guest_user_id_host_user_id_key" ON "customers"("guest_user_id", "host_user_id");

DROP INDEX IF EXISTS "customers_guest_user_id_idx";

DROP INDEX IF EXISTS "customers_user_id_idx";

CREATE INDEX IF NOT EXISTS "customers_guest_user_id_idx" ON "customers"("guest_user_id");

DROP INDEX IF EXISTS "customers_host_user_id_idx";

DROP INDEX IF EXISTS "customers_host_id_idx";

CREATE INDEX IF NOT EXISTS "customers_host_id_idx" ON "customers"("host_user_id");

CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers"("email");

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_guest_user_id_fkey";

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_user_id_fkey";

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_host_user_id_fkey";

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_host_id_fkey";

ALTER TABLE "customers" ADD CONSTRAINT "customers_guest_user_id_fkey" FOREIGN KEY ("guest_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "customers" ADD CONSTRAINT "customers_host_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
