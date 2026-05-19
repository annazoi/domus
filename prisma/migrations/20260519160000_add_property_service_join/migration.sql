CREATE TABLE "property_services" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_services_pkey" PRIMARY KEY ("id")
);

INSERT INTO "property_services" ("id", "property_id", "service_id", "created_at")
SELECT gen_random_uuid()::text, "property_id", "id", NOW()
FROM "services";

CREATE UNIQUE INDEX "property_services_property_id_service_id_key" ON "property_services"("property_id", "service_id");
CREATE INDEX "property_services_property_id_idx" ON "property_services"("property_id");
CREATE INDEX "property_services_service_id_idx" ON "property_services"("service_id");

ALTER TABLE "property_services" ADD CONSTRAINT "property_services_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_services" ADD CONSTRAINT "property_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "services_property_id_idx";

ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_property_id_fkey";

ALTER TABLE "services" DROP COLUMN "property_id";
