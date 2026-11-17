-- DropIndex
DROP INDEX "PracticeProgress_userId_practiceTextId_youtubeStudyId_mode_key";

-- AlterTable
ALTER TABLE "PracticeProgress" ADD COLUMN     "pdfStudyId" TEXT;

-- CreateTable
CREATE TABLE "PDFStudy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "extractedContent" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PDFStudy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PDFStudy_userId_idx" ON "PDFStudy"("userId");

-- CreateIndex
CREATE INDEX "PracticeProgress_pdfStudyId_idx" ON "PracticeProgress"("pdfStudyId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeProgress_userId_practiceTextId_youtubeStudyId_pdfSt_key" ON "PracticeProgress"("userId", "practiceTextId", "youtubeStudyId", "pdfStudyId", "mode");

-- AddForeignKey
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_pdfStudyId_fkey" FOREIGN KEY ("pdfStudyId") REFERENCES "PDFStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PDFStudy" ADD CONSTRAINT "PDFStudy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

