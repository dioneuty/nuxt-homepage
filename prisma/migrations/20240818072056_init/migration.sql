-- AlterTable
ALTER TABLE "GalleryComment" ADD COLUMN     "authorId" INTEGER,
ALTER COLUMN "author" DROP NOT NULL;
