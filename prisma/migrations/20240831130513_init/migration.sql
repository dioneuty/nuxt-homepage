/*
  Warnings:

  - You are about to alter the column `order` on the `OutlineItem` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "OutlineItem" ALTER COLUMN "order" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "OutlineState" (
    "id" SERIAL NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutlineState_pkey" PRIMARY KEY ("id")
);
