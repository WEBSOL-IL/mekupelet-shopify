-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('INVOICE', 'CREDIT_FULL', 'CREDIT_REFUND');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "SyncKind" AS ENUM ('TODAY', 'MONTH', 'PRODUCT', 'SKU');

-- CreateEnum
CREATE TYPE "SyncSource" AS ENUM ('SCHEDULE', 'TRIGGER', 'MANUAL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "shop" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "refundId" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "vr360DocNo" TEXT,
    "storeNo" INTEGER,
    "customerNo" INTEGER,
    "reference" TEXT,
    "totalAmount" DECIMAL(12,2),
    "error" TEXT,
    "requestXml" TEXT,
    "responseXml" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "httpStatus" INTEGER,
    "durationMs" INTEGER NOT NULL,
    "orderId" TEXT,
    "error" TEXT,
    "request" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "kind" "SyncKind" NOT NULL,
    "source" "SyncSource" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
    "received" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "unchanged" INTEGER NOT NULL DEFAULT 0,
    "missing" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "details" JSONB,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkuCache" (
    "shop" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tracked" BOOLEAN NOT NULL DEFAULT true,
    "duplicate" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuCache_pkey" PRIMARY KEY ("shop","sku")
);

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

-- CreateIndex
CREATE INDEX "Document_shop_orderId_idx" ON "Document"("shop", "orderId");

-- CreateIndex
CREATE INDEX "Document_shop_status_createdAt_idx" ON "Document"("shop", "status", "createdAt");

-- CreateIndex
CREATE INDEX "RequestLog_shop_createdAt_idx" ON "RequestLog"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "RequestLog_shop_orderId_idx" ON "RequestLog"("shop", "orderId");

-- CreateIndex
CREATE INDEX "SyncRun_shop_startedAt_idx" ON "SyncRun"("shop", "startedAt");

-- CreateIndex
CREATE INDEX "SkuCache_shop_productId_idx" ON "SkuCache"("shop", "productId");
