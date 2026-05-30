ALTER TABLE "services" ADD COLUMN "host_user_id" TEXT;

UPDATE "services" s
SET "host_user_id" = sub."user_id"
FROM (
  SELECT DISTINCT ON (ps."service_id") ps."service_id", p."user_id"
  FROM "property_services" ps
  INNER JOIN "properties" p ON p."id" = ps."property_id"
  ORDER BY ps."service_id", ps."created_at" ASC
) sub
WHERE s."id" = sub."service_id";

DELETE FROM "services" WHERE "host_user_id" IS NULL;

ALTER TABLE "services" ALTER COLUMN "host_user_id" SET NOT NULL;

CREATE INDEX "services_host_user_id_idx" ON "services"("host_user_id");

ALTER TABLE "services" ADD CONSTRAINT "services_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
