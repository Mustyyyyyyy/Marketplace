ALTER TABLE "User" ADD COLUMN "stripeAccountId" TEXT;
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");

ALTER TABLE "Hire"
  ADD CONSTRAINT "Hire_offerId_fkey"
  FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_PAYMENT', 'PROCESSING', 'ESCROWED', 'RELEASED', 'REFUNDED', 'FAILED');

CREATE TABLE "PlatformPayment" (
  "id" TEXT NOT NULL,
  "hireId" TEXT NOT NULL,
  "taskerId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "grossAmount" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL,
  "taskerAmount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT',
  "stripePaymentIntentId" TEXT,
  "stripeTransferId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  CONSTRAINT "PlatformPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformPayment_hireId_key" ON "PlatformPayment"("hireId");
CREATE UNIQUE INDEX "PlatformPayment_stripePaymentIntentId_key" ON "PlatformPayment"("stripePaymentIntentId");
CREATE UNIQUE INDEX "PlatformPayment_stripeTransferId_key" ON "PlatformPayment"("stripeTransferId");
CREATE INDEX "PlatformPayment_customerId_status_idx" ON "PlatformPayment"("customerId", "status");
CREATE INDEX "PlatformPayment_taskerId_status_idx" ON "PlatformPayment"("taskerId", "status");
ALTER TABLE "PlatformPayment" ADD CONSTRAINT "PlatformPayment_hireId_fkey" FOREIGN KEY ("hireId") REFERENCES "Hire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlatformPayment" ADD CONSTRAINT "PlatformPayment_taskerId_fkey" FOREIGN KEY ("taskerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlatformPayment" ADD CONSTRAINT "PlatformPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
