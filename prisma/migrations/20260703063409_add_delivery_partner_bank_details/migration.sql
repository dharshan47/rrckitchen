-- AlterTable
ALTER TABLE "DeliveryPartnerKyc" ADD COLUMN     "accountHolderName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "googlePayNumber" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "phonePeNumber" TEXT,
ADD COLUMN     "upiId" TEXT;
