CREATE TYPE "QuestionExamTrack" AS ENUM ('UNIVERSITY', 'NEET_PG', 'INI_CET');
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_BEST_ANSWER');
CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "topicId" TEXT,
  "authorId" TEXT NOT NULL,
  "examTrack" "QuestionExamTrack" NOT NULL,
  "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_BEST_ANSWER',
  "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
  "questionText" TEXT NOT NULL,
  "explanation" TEXT,
  "yearAsked" INTEGER,
  "marks" INTEGER,
  "sourceReference" TEXT,
  "status" "ContentPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "QuestionOption" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "QuestionAttempt" (
  "id" TEXT NOT NULL,
  "studentProfileId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedOptionId" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Question_subjectId_examTrack_status_difficulty_idx" ON "Question"("subjectId", "examTrack", "status", "difficulty");
CREATE INDEX "Question_topicId_status_idx" ON "Question"("topicId", "status");
CREATE INDEX "Question_authorId_createdAt_idx" ON "Question"("authorId", "createdAt");
CREATE INDEX "QuestionOption_questionId_sortOrder_idx" ON "QuestionOption"("questionId", "sortOrder");
CREATE INDEX "QuestionAttempt_studentProfileId_attemptedAt_idx" ON "QuestionAttempt"("studentProfileId", "attemptedAt");
CREATE INDEX "QuestionAttempt_questionId_attemptedAt_idx" ON "QuestionAttempt"("questionId", "attemptedAt");
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
