/*
  Warnings:

  - The values [HOST,GUEST] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[avatar_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[banner_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- UserRole existed on DB from initial migration but no column used it yet; safe replace
DROP TYPE "UserRole";
CREATE TYPE "UserRole" AS ENUM ('USER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_property_image_id_fkey";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "property_image_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_id" TEXT,
ADD COLUMN     "banner_id" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_host" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "users_avatar_id_key" ON "users"("avatar_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_banner_id_key" ON "users"("banner_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_property_image_id_fkey" FOREIGN KEY ("property_image_id") REFERENCES "property_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
