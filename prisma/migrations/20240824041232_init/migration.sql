/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `GalleryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GalleryItem" DROP COLUMN "imageUrl",
ADD COLUMN     "content" TEXT;
