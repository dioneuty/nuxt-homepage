/*
  Warnings:

  - You are about to drop the `GalleryFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GalleryFile" DROP CONSTRAINT "GalleryFile_galleryItemId_fkey";

-- DropTable
DROP TABLE "GalleryFile";

-- CreateTable
CREATE TABLE "AdminGalleryItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminGalleryItem_pkey" PRIMARY KEY ("id")
);
