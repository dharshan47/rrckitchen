-- CreateEnum
CREATE TYPE "CravingsPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "cravings_rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerItemId" TEXT NOT NULL,
    "kitchenId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Complete Your Meal 🍽️',
    "message" TEXT NOT NULL DEFAULT 'Customers usually order these together.',
    "priority" "CravingsPriority" NOT NULL DEFAULT 'MEDIUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cravings_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cravings_rule_item" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cravings_rule_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cravings_rule_triggerItemId_idx" ON "cravings_rule"("triggerItemId");

-- CreateIndex
CREATE INDEX "cravings_rule_kitchenId_idx" ON "cravings_rule"("kitchenId");

-- CreateIndex
CREATE INDEX "cravings_rule_priority_idx" ON "cravings_rule"("priority");

-- CreateIndex
CREATE INDEX "cravings_rule_isActive_idx" ON "cravings_rule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cravings_rule_item_ruleId_menuItemId_key" ON "cravings_rule_item"("ruleId", "menuItemId");

-- CreateIndex
CREATE INDEX "cravings_rule_item_menuItemId_idx" ON "cravings_rule_item"("menuItemId");

-- AddForeignKey
ALTER TABLE "cravings_rule" ADD CONSTRAINT "cravings_rule_triggerItemId_fkey" FOREIGN KEY ("triggerItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cravings_rule" ADD CONSTRAINT "cravings_rule_kitchenId_fkey" FOREIGN KEY ("kitchenId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cravings_rule_item" ADD CONSTRAINT "cravings_rule_item_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "cravings_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cravings_rule_item" ADD CONSTRAINT "cravings_rule_item_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
