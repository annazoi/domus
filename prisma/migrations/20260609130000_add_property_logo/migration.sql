ALTER TABLE "properties" ADD COLUMN "logo_id" TEXT;

CREATE UNIQUE INDEX "properties_logo_id_key" ON "properties"("logo_id");

ALTER TABLE "properties" ADD CONSTRAINT "properties_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
