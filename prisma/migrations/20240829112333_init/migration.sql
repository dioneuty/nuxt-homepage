/*
  Warnings:

  - The primary key for the `Wiki` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Wiki` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Wiki" DROP CONSTRAINT "Wiki_pkey",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "author" DROP NOT NULL,
ADD CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id");
