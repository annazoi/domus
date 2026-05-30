ALTER TABLE "users" ADD COLUMN "stripe_account_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "charges_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "payouts_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "users_stripe_account_id_key" ON "users"("stripe_account_id");

ALTER TABLE "bookings" ADD COLUMN "stripe_session_id" TEXT;
ALTER TABLE "bookings" ADD COLUMN "payment_intent_id" TEXT;

CREATE UNIQUE INDEX "bookings_stripe_session_id_key" ON "bookings"("stripe_session_id");
