-- Properties created from early migrations lacked slug / short_description (API always writes them).
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "short_description" TEXT;

UPDATE "properties"
SET "slug" = "id"
WHERE "slug" IS NULL OR TRIM(COALESCE("slug", '')) = '';

ALTER TABLE "properties" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "properties_slug_key" ON "properties"("slug");
