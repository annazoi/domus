-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HOST', 'GUEST', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- users: split full name into first_name + last_name; timestamps
ALTER TABLE "users" RENAME COLUMN "fullName" TO "first_name";
ALTER TABLE "users" ADD COLUMN "last_name" TEXT;
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- properties
ALTER TABLE "properties" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "properties" RENAME COLUMN "propertyType" TO "property_type";
ALTER TABLE "properties" RENAME COLUMN "maxGuests" TO "max_guests";
ALTER TABLE "properties" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "properties" RENAME COLUMN "updatedAt" TO "updated_at";

-- property_availability
ALTER TABLE "property_availability" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "property_availability" RENAME COLUMN "propertyId" TO "property_id";
ALTER TABLE "property_availability" RENAME COLUMN "isAvailable" TO "is_available";
ALTER TABLE "property_availability" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "property_availability" RENAME COLUMN "updatedAt" TO "updated_at";

-- property_amenities
ALTER TABLE "property_amenities" RENAME COLUMN "propertyId" TO "property_id";
ALTER TABLE "property_amenities" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "property_amenities" RENAME COLUMN "updatedAt" TO "updated_at";

-- property_images: add url for API uploads; rename columns
ALTER TABLE "property_images" ADD COLUMN IF NOT EXISTS "url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "property_images" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "property_images" RENAME COLUMN "propertyId" TO "property_id";
ALTER TABLE "property_images" RENAME COLUMN "isCover" TO "is_cover";
ALTER TABLE "property_images" RENAME COLUMN "createdAt" TO "created_at";

-- documents
ALTER TABLE "documents" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "documents" RENAME COLUMN "propertyImageId" TO "property_image_id";
ALTER TABLE "documents" RENAME COLUMN "propertyAmenityId" TO "property_amenity_id";
ALTER TABLE "documents" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "documents" RENAME COLUMN "updatedAt" TO "updated_at";

-- Recreate indexes with new column names (PostgreSQL may keep index names; Prisma expects these names)
DROP INDEX IF EXISTS "properties_userId_status_idx";
CREATE INDEX "properties_user_id_status_idx" ON "properties"("user_id", "status");

DROP INDEX IF EXISTS "property_amenities_propertyId_idx";
CREATE INDEX "property_amenities_property_id_idx" ON "property_amenities"("property_id");

DROP INDEX IF EXISTS "property_amenities_propertyId_value_key";
CREATE UNIQUE INDEX "property_amenities_property_id_value_key" ON "property_amenities"("property_id", "value");

DROP INDEX IF EXISTS "property_availability_propertyId_date_idx";
CREATE INDEX "property_availability_property_id_date_idx" ON "property_availability"("property_id", "date");

DROP INDEX IF EXISTS "property_availability_propertyId_date_key";
CREATE UNIQUE INDEX "property_availability_property_id_date_key" ON "property_availability"("property_id", "date");

DROP INDEX IF EXISTS "property_images_propertyId_order_idx";
CREATE INDEX "property_images_property_id_order_idx" ON "property_images"("property_id", "order");

DROP INDEX IF EXISTS "documents_userId_idx";
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");
