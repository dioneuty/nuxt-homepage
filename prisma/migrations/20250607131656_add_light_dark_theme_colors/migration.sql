/*
  Warnings:

  - You are about to drop the column `footerColor` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `headerColor` on the `SiteConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteConfig" DROP COLUMN "footerColor",
DROP COLUMN "headerColor",
ADD COLUMN     "darkFooterColor" TEXT NOT NULL DEFAULT '#1A202C',
ADD COLUMN     "darkHeaderColor" TEXT NOT NULL DEFAULT '#1A202C',
ADD COLUMN     "lightFooterColor" TEXT NOT NULL DEFAULT '#F7FAFC',
ADD COLUMN     "lightHeaderColor" TEXT NOT NULL DEFAULT '#FFFFFF';
