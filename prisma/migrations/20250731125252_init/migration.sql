-- AlterTable
ALTER TABLE "YouTubeVideo" ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "YouTubeVideoCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouTubeVideoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTubeVideoCategory_slug_key" ON "YouTubeVideoCategory"("slug");

-- AddForeignKey
ALTER TABLE "YouTubeVideo" ADD CONSTRAINT "YouTubeVideo_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "YouTubeVideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
