-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "siteLogoUrl" TEXT DEFAULT '/images/logo.png',
ADD COLUMN     "siteTitle" TEXT NOT NULL DEFAULT 'My Website';
