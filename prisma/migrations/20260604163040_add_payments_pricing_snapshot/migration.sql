-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PricingUnit" AS ENUM ('PER_STAY', 'PER_NIGHT', 'PER_GUEST', 'PER_GUEST_PER_NIGHT');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'eur',
ADD COLUMN     "discount_amount" DECIMAL(65,30),
ADD COLUMN     "fees" DECIMAL(65,30),
ADD COLUMN     "nights" INTEGER,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "price_snapshot" JSONB,
ADD COLUMN     "subtotal_accommodation" DECIMAL(65,30),
ADD COLUMN     "subtotal_extras" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_quantity" INTEGER,
ADD COLUMN     "pricing_unit" "PricingUnit" NOT NULL DEFAULT 'PER_STAY';

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "guest_user_id" TEXT NOT NULL,
    "host_user_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "context" TEXT NOT NULL DEFAULT 'BOOKING_PAYMENT',
    "stripe_session_id" TEXT,
    "stripe_payment_intent" TEXT,
    "stripe_charge_id" TEXT,
    "stripe_payment_url" TEXT,
    "stripe_receipt_url" TEXT,
    "stripe_transfer_id" TEXT,
    "platform_fee_amount" DECIMAL(65,30),
    "stripe_fee_amount" DECIMAL(65,30),
    "net_amount" DECIMAL(65,30),
    "payout_amount" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_session_id_key" ON "payments"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_key" ON "payments"("stripe_payment_intent");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_stripe_payment_intent_idx" ON "payments"("stripe_payment_intent");

-- CreateIndex
CREATE INDEX "payments_host_user_id_idx" ON "payments"("host_user_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_guest_user_id_fkey" FOREIGN KEY ("guest_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
