/*
  Warnings:

  - A unique constraint covering the columns `[screenId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_screenId_key" ON "Chat"("screenId");
