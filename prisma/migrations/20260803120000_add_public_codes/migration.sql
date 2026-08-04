-- CreateTable
CREATE TABLE "public_id_counter" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "digits" INTEGER NOT NULL,

    CONSTRAINT "public_id_counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicIdCounter_prefix_key" ON "public_id_counter"("prefix");

-- Seed per-prefix counters (sequence starts at 0; allocation increments before returning)
INSERT INTO "public_id_counter" ("id", "prefix", "sequence", "digits") VALUES
    ('cnt-kp', 'KP', 0, 7),
    ('cnt-dp', 'DP', 0, 7),
    ('cnt-adm', 'ADM', 0, 4),
    ('cnt-ord', 'ORD', 0, 9),
    ('cnt-pymt', 'PYMT', 0, 9),
    ('cnt-rfd', 'RFD', 0, 7),
    ('cnt-m', 'M', 0, 8),
    ('cnt-cus', 'CUS', 0, 9);

-- AlterTable
ALTER TABLE "user" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_publicCode_key" ON "user"("publicCode");

-- AlterTable
ALTER TABLE "KitchenPartner" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KitchenPartner_publicCode_key" ON "KitchenPartner"("publicCode");

-- AlterTable
ALTER TABLE "DeliveryPartner" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPartner_publicCode_key" ON "DeliveryPartner"("publicCode");

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_publicCode_key" ON "MenuItem"("publicCode");

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicCode_key" ON "Order"("publicCode");

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_publicCode_key" ON "Payment"("publicCode");

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_publicCode_key" ON "Refund"("publicCode");

-- AlterTable
ALTER TABLE "admin_profile" ADD COLUMN "publicCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_publicCode_key" ON "admin_profile"("publicCode");