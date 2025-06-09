-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "showSiteLogoIcon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSiteLogoUrl" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSiteTitle" BOOLEAN NOT NULL DEFAULT true;
