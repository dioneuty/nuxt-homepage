-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" SERIAL NOT NULL,
    "headerColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "footerColor" TEXT NOT NULL DEFAULT '#333333',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);
