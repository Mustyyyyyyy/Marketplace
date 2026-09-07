CREATE TYPE "TransactionType" AS ENUM ('PAYMENT_ESCROWED', 'PLATFORM_FEE', 'TASKER_EARNED', 'REFUND', 'PAYOUT_REQUESTED', 'PAYOUT_COMPLETED', 'PAYOUT_FAILED', 'ADJUSTMENT');

CREATE TABLE "WalletTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentId" TEXT,
  "payoutId" TEXT,
  "type" "TransactionType" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "balanceAfter" DOUBLE PRECISION,
  "reference" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WalletTransaction_userId_type_reference_key" ON "WalletTransaction"("userId", "type", "reference");
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");
CREATE INDEX "WalletTransaction_paymentId_idx" ON "WalletTransaction"("paymentId");
CREATE INDEX "WalletTransaction_payoutId_idx" ON "WalletTransaction"("payoutId");
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PlatformPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
