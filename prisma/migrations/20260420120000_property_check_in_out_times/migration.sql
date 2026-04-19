-- Align DB when properties table predates schema fields
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "check_out_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
