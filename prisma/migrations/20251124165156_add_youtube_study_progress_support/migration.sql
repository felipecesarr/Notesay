-- AlterTable
ALTER TABLE "PracticeProgress" DROP CONSTRAINT "PracticeProgress_practiceTextId_fkey";

-- AlterTable
ALTER TABLE "PracticeProgress" ALTER COLUMN "practiceTextId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PracticeProgress" ADD COLUMN "youtubeStudyId" TEXT;

-- DropIndex
DROP INDEX "PracticeProgress_userId_practiceTextId_mode_key";

-- CreateIndex
CREATE INDEX "PracticeProgress_youtubeStudyId_idx" ON "PracticeProgress"("youtubeStudyId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeProgress_userId_practiceTextId_youtubeStudyId_mode_key" ON "PracticeProgress"("userId", "practiceTextId", "youtubeStudyId", "mode");

-- AddForeignKey
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_practiceTextId_fkey" FOREIGN KEY ("practiceTextId") REFERENCES "PracticeText"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_youtubeStudyId_fkey" FOREIGN KEY ("youtubeStudyId") REFERENCES "YouTubeStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
