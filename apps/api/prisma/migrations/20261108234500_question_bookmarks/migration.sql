CREATE TABLE "QuestionBookmark" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuestionBookmark_studentProfileId_questionId_key"
ON "QuestionBookmark"("studentProfileId", "questionId");

CREATE INDEX "QuestionBookmark_studentProfileId_createdAt_idx"
ON "QuestionBookmark"("studentProfileId", "createdAt");

ALTER TABLE "QuestionBookmark"
ADD CONSTRAINT "QuestionBookmark_studentProfileId_fkey"
FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuestionBookmark"
ADD CONSTRAINT "QuestionBookmark_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "Question"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
