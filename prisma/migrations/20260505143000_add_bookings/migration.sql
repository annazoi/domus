-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_property_id_idx" ON "bookings"("property_id");

-- CreateIndex
CREATE INDEX "bookings_guest_id_idx" ON "bookings"("guest_id");

-- CreateIndex
CREATE INDEX "bookings_property_id_check_in_check_out_idx" ON "bookings"("property_id", "check_in", "check_out");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
