-- AlterTable
ALTER TABLE "DeliveryPartnerKyc" ADD COLUMN     "bankName" TEXT;

-- AlterTable
ALTER TABLE "KitchenPartnerKyc" ADD COLUMN     "bankName" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "compareAtPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "MenuItemPhoto" ADD COLUMN     "cloudinaryPublicId" TEXT;
