CREATE TABLE "property_appliances" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_appliances_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "documents" ADD COLUMN "property_appliance_id" TEXT;

CREATE INDEX "property_appliances_property_id_order_idx" ON "property_appliances"("property_id", "order");

ALTER TABLE "property_appliances" ADD CONSTRAINT "property_appliances_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_property_appliance_id_fkey" FOREIGN KEY ("property_appliance_id") REFERENCES "property_appliances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
