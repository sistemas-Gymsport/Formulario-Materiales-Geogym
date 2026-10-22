-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'HELD', 'IGNORED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "username" VARCHAR(40) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "csrfToken" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" VARCHAR(300),
    "ip" VARCHAR(64),

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "normalizedName" VARCHAR(80) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(90) NOT NULL,
    "icon" VARCHAR(40) NOT NULL DEFAULT 'package',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "normalizedName" VARCHAR(80) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" UUID NOT NULL,
    "folio" VARCHAR(24) NOT NULL,
    "requesterName" VARCHAR(100) NOT NULL,
    "requesterNormalized" VARCHAR(100) NOT NULL,
    "branchId" INTEGER NOT NULL,
    "branchNameSnapshot" VARCHAR(80) NOT NULL,
    "idempotencyKey" VARCHAR(64) NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" SERIAL NOT NULL,
    "requestId" UUID NOT NULL,
    "materialId" INTEGER,
    "categoryId" INTEGER,
    "materialNameSnapshot" VARCHAR(80) NOT NULL,
    "normalizedName" VARCHAR(80) NOT NULL,
    "categoryNameSnapshot" VARCHAR(80) NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolioCounter" (
    "day" VARCHAR(8) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FolioCounter_pkey" PRIMARY KEY ("day")
);

-- CreateTable
CREATE TABLE "FormSchedule" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "timezone" VARCHAR(60) NOT NULL DEFAULT 'America/Mexico_City',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "openingTime" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "closingTime" VARCHAR(5) NOT NULL DEFAULT '18:00',
    "allowedWeekdays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "closedTitle" VARCHAR(120) NOT NULL DEFAULT 'Las solicitudes de materiales están cerradas por el momento',
    "closedMessage" VARCHAR(400) NOT NULL DEFAULT 'Consulta los próximos días habilitados para realizar tu solicitud.',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" VARCHAR(40),

    CONSTRAINT "FormSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormScheduleException" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "openingTime" VARCHAR(5),
    "closingTime" VARCHAR(5),
    "note" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormScheduleException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" VARCHAR(500),
    "encryptedCredential" TEXT,
    "credentialHint" VARCHAR(12),
    "destinationPhone" VARCHAR(20),
    "authMode" VARCHAR(10) NOT NULL DEFAULT 'hmac',
    "heldPolicy" VARCHAR(10) NOT NULL DEFAULT 'ignore',
    "enabledAt" TIMESTAMP(3),
    "lastTestAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,
    "lastTestMessage" VARCHAR(300),
    "lastDeliveryAt" TIMESTAMP(3),
    "lastDeliveryOk" BOOLEAN,
    "lastDeliveryMessage" VARCHAR(300),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lastError" VARCHAR(500),
    "responseStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "providerStatus" VARCHAR(20),
    "providerConfirmedAt" TIMESTAMP(3),

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyClose" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedById" UUID,

    CONSTRAINT "MonthlyClose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_normalizedName_key" ON "Branch"("normalizedName");

-- CreateIndex
CREATE INDEX "Branch_isActive_sortOrder_idx" ON "Branch"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Material_normalizedName_key" ON "Material"("normalizedName");

-- CreateIndex
CREATE INDEX "Material_categoryId_sortOrder_idx" ON "Material"("categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "Material_isActive_idx" ON "Material"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Request_folio_key" ON "Request"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Request_idempotencyKey_key" ON "Request"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");

-- CreateIndex
CREATE INDEX "Request_branchId_createdAt_idx" ON "Request"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "Request_requesterNormalized_idx" ON "Request"("requesterNormalized");

-- CreateIndex
CREATE INDEX "RequestItem_materialId_idx" ON "RequestItem"("materialId");

-- CreateIndex
CREATE INDEX "RequestItem_categoryId_idx" ON "RequestItem"("categoryId");

-- CreateIndex
CREATE INDEX "RequestItem_isCustom_normalizedName_idx" ON "RequestItem"("isCustom", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "RequestItem_requestId_normalizedName_key" ON "RequestItem"("requestId", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "FormScheduleException_date_key" ON "FormScheduleException"("date");

-- CreateIndex
CREATE INDEX "NotificationOutbox_status_nextAttemptAt_idx" ON "NotificationOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_requestId_type_key" ON "NotificationOutbox"("requestId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyClose_year_month_key" ON "MonthlyClose"("year", "month");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClose" ADD CONSTRAINT "MonthlyClose_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
