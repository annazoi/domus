/*
  Warnings:

  - Added the required column `property_id` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "property_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "services_property_id_idx" ON "services"("property_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
