ALTER TABLE "User" ADD COLUMN "flutterwaveBankCode" TEXT;
ALTER TABLE "User" ADD COLUMN "flutterwaveAccountNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "flutterwaveAccountName" TEXT;
ALTER TABLE "PlatformPayment" ADD COLUMN "flutterwaveTransactionId" TEXT;
CREATE UNIQUE INDEX "PlatformPayment_flutterwaveTransactionId_key" ON "PlatformPayment"("flutterwaveTransactionId");

CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TABLE "Payout" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "providerRef" TEXT,
  "bankCode" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payout_providerRef_key" ON "Payout"("providerRef");
CREATE INDEX "Payout_userId_status_idx" ON "Payout"("userId", "status");
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
