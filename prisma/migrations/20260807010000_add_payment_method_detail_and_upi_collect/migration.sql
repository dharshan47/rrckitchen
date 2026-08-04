-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'UPI_COLLECT';

-- CreateEnum
CREATE TYPE "UpiCollectStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paymentMethodDetail" JSONB;

-- CreateTable
CREATE TABLE "upi_collect_request" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "vpa" TEXT NOT NULL,
    "razorpayVpaId" TEXT,
    "status" "UpiCollectStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upi_collect_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upi_collect_request_orderId_key" ON "upi_collect_request"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "upi_collect_request_paymentId_key" ON "upi_collect_request"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "upi_collect_request_razorpayVpaId_key" ON "upi_collect_request"("razorpayVpaId");

-- CreateIndex
CREATE INDEX "upi_collect_request_status_idx" ON "upi_collect_request"("status");

-- AddForeignKey
ALTER TABLE "upi_collect_request" ADD CONSTRAINT "upi_collect_request_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upi_collect_request" ADD CONSTRAINT "upi_collect_request_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
