-- AlterTable
ALTER TABLE "BoardPost" ADD COLUMN     "parentId" INTEGER,
ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "guestbooks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guestbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guestbook_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guestbookId" INTEGER NOT NULL,

    CONSTRAINT "guestbook_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BoardPost" ADD CONSTRAINT "BoardPost_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guestbook_comments" ADD CONSTRAINT "guestbook_comments_guestbookId_fkey" FOREIGN KEY ("guestbookId") REFERENCES "guestbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
