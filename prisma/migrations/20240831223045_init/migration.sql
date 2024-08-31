/*
  Warnings:

  - The primary key for the `OutlineItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "OutlineItem" DROP CONSTRAINT "OutlineItem_parentId_fkey";

-- AlterTable
ALTER TABLE "OutlineItem" DROP CONSTRAINT "OutlineItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "parentId" SET DATA TYPE BIGINT,
ADD CONSTRAINT "OutlineItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OutlineItem_id_seq";

-- AddForeignKey
ALTER TABLE "OutlineItem" ADD CONSTRAINT "OutlineItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OutlineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
