-- CreateTable
CREATE TABLE "QnA" (
    "id" SERIAL NOT NULL,
    "questionTitle" TEXT NOT NULL,
    "questionContent" TEXT NOT NULL,
    "answerContent" TEXT,
    "author" TEXT NOT NULL,
    "answerer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);
