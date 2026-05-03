-- CreateEnum
CREATE TYPE "PropertyBrandingTheme" AS ENUM ('CANVAS', 'ARCHITECTURA');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "branding_theme" "PropertyBrandingTheme" NOT NULL DEFAULT 'CANVAS';
