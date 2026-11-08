CREATE TYPE "ContentPublicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED');
CREATE TYPE "LearningResourceType" AS ENUM ('PDF', 'EXTERNAL_LINK');
CREATE TABLE "Lecture" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "topicId" TEXT,
  "authorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "videoUrl" TEXT,
  "videoType" TEXT,
  "durationSec" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LearningResource" (
  "id" TEXT NOT NULL,
  "lectureId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "LearningResourceType" NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentPublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Lecture_courseId_status_sortOrder_idx" ON "Lecture"("courseId", "status", "sortOrder");
CREATE INDEX "Lecture_authorId_createdAt_idx" ON "Lecture"("authorId", "createdAt");
CREATE INDEX "LearningResource_lectureId_status_sortOrder_idx" ON "LearningResource"("lectureId", "status", "sortOrder");
CREATE INDEX "LearningResource_authorId_createdAt_idx" ON "LearningResource"("authorId", "createdAt");
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
