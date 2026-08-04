-- CreateTable
CREATE TABLE "RrcKitchenReview" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "recommendation" BOOLEAN,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RrcKitchenReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RrcKitchenReview_kitchenPartnerId_key" ON "RrcKitchenReview"("kitchenPartnerId");

-- CreateIndex
CREATE INDEX "RrcKitchenReview_rating_idx" ON "RrcKitchenReview"("rating");

-- AddForeignKey
ALTER TABLE "RrcKitchenReview" ADD CONSTRAINT "RrcKitchenReview_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
