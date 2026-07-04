-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('CUSTOMER', 'KITCHENPARTNER', 'DELIVERYPARTNER', 'ADMIN', 'SUPPORTAGENT');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDINGAPPROVAL', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('VEG', 'NONVEG');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('MORNING', 'LUNCH', 'EVENINGSNACKS', 'DINNER');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CONFIRMED', 'PREPARING', 'READYFORPICKUP', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('APP', 'PHONECALL');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'CASHONPICKUP');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,
    "roles" TEXT NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "name" TEXT,
    "fullName" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "impersonatedBy" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "lineOne" TEXT NOT NULL,
    "lineTwo" TEXT,
    "pincode" TEXT NOT NULL,
    "serviceZoneId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenPartner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDINGAPPROVAL',
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "KitchenPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenPartnerKyc" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "aadhaarDocumentUrl" TEXT,
    "fssaiNumber" TEXT,
    "addressProofUrl" TEXT,
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "KitchenPartnerKyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenAlias" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitchenAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenCategory" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "KitchenCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenAvailability" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitchenAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "foodType" "FoodType" NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemPhoto" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItemPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPartner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDINGAPPROVAL',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPartnerKyc" (
    "id" TEXT NOT NULL,
    "deliveryPartnerId" TEXT NOT NULL,
    "documentUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryPartnerKyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPartnerCatalogueItem" (
    "id" TEXT NOT NULL,
    "deliveryPartnerId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "ratePerUnit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DeliveryPartnerCatalogueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryPartnerKitchenAssignment" (
    "id" TEXT NOT NULL,
    "deliveryPartnerId" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "assignedByAdminId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryPartnerKitchenAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pincodes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addressId" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CONFIRMED',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "source" "OrderSource" NOT NULL DEFAULT 'APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitchenPartnerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySlot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeliverySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_phoneNumber_idx" ON "user"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "OtpCode_mobileNumber_idx" ON "OtpCode"("mobileNumber");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_serviceZoneId_idx" ON "Address"("serviceZoneId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenPartner_userId_key" ON "KitchenPartner"("userId");

-- CreateIndex
CREATE INDEX "KitchenPartner_status_idx" ON "KitchenPartner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenPartnerKyc_kitchenPartnerId_key" ON "KitchenPartnerKyc"("kitchenPartnerId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenAlias_kitchenPartnerId_key" ON "KitchenAlias"("kitchenPartnerId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenAlias_displayName_key" ON "KitchenAlias"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenAlias_sequenceNumber_key" ON "KitchenAlias"("sequenceNumber");

-- CreateIndex
CREATE INDEX "KitchenCategory_categoryId_idx" ON "KitchenCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenCategory_kitchenPartnerId_categoryId_key" ON "KitchenCategory"("kitchenPartnerId", "categoryId");

-- CreateIndex
CREATE INDEX "KitchenAvailability_serviceDate_isAvailable_idx" ON "KitchenAvailability"("serviceDate", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenAvailability_kitchenPartnerId_serviceDate_key" ON "KitchenAvailability"("kitchenPartnerId", "serviceDate");

-- CreateIndex
CREATE INDEX "Menu_kitchenPartnerId_idx" ON "Menu"("kitchenPartnerId");

-- CreateIndex
CREATE INDEX "MenuItem_menuId_timeSlot_foodType_idx" ON "MenuItem"("menuId", "timeSlot", "foodType");

-- CreateIndex
CREATE INDEX "MenuItemPhoto_menuItemId_idx" ON "MenuItemPhoto"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPartner_userId_key" ON "DeliveryPartner"("userId");

-- CreateIndex
CREATE INDEX "DeliveryPartner_status_idx" ON "DeliveryPartner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPartnerKyc_deliveryPartnerId_key" ON "DeliveryPartnerKyc"("deliveryPartnerId");

-- CreateIndex
CREATE INDEX "DeliveryPartnerCatalogueItem_deliveryPartnerId_idx" ON "DeliveryPartnerCatalogueItem"("deliveryPartnerId");

-- CreateIndex
CREATE INDEX "DeliveryPartnerKitchenAssignment_deliveryPartnerId_idx" ON "DeliveryPartnerKitchenAssignment"("deliveryPartnerId");

-- CreateIndex
CREATE INDEX "DeliveryPartnerKitchenAssignment_kitchenPartnerId_idx" ON "DeliveryPartnerKitchenAssignment"("kitchenPartnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceZone_name_key" ON "ServiceZone"("name");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_serviceDate_timeSlot_idx" ON "Order"("serviceDate", "timeSlot");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_kitchenPartnerId_idx" ON "OrderItem"("kitchenPartnerId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Review_kitchenPartnerId_idx" ON "Review"("kitchenPartnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_serviceZoneId_fkey" FOREIGN KEY ("serviceZoneId") REFERENCES "ServiceZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenPartner" ADD CONSTRAINT "KitchenPartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenPartnerKyc" ADD CONSTRAINT "KitchenPartnerKyc_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenAlias" ADD CONSTRAINT "KitchenAlias_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenCategory" ADD CONSTRAINT "KitchenCategory_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenCategory" ADD CONSTRAINT "KitchenCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenAvailability" ADD CONSTRAINT "KitchenAvailability_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemPhoto" ADD CONSTRAINT "MenuItemPhoto_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartner" ADD CONSTRAINT "DeliveryPartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerKyc" ADD CONSTRAINT "DeliveryPartnerKyc_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerCatalogueItem" ADD CONSTRAINT "DeliveryPartnerCatalogueItem_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerKitchenAssignment" ADD CONSTRAINT "DeliveryPartnerKitchenAssignment_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryPartnerKitchenAssignment" ADD CONSTRAINT "DeliveryPartnerKitchenAssignment_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_kitchenPartnerId_fkey" FOREIGN KEY ("kitchenPartnerId") REFERENCES "KitchenPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
