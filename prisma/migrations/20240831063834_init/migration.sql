-- CreateTable
CREATE TABLE "OutlineItem" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "OutlineItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutlineItem" ADD CONSTRAINT "OutlineItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OutlineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
