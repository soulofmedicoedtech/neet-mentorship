CREATE TABLE "CourseEnrollment" (
  "id" TEXT NOT NULL,
  "studentProfileId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LectureProgress" (
  "id" TEXT NOT NULL,
  "studentProfileId" TEXT NOT NULL,
  "lectureId" TEXT NOT NULL,
  "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LectureProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CourseEnrollment_studentProfileId_courseId_key" ON "CourseEnrollment"("studentProfileId", "courseId");
CREATE INDEX "CourseEnrollment_studentProfileId_enrolledAt_idx" ON "CourseEnrollment"("studentProfileId", "enrolledAt");
CREATE INDEX "CourseEnrollment_courseId_enrolledAt_idx" ON "CourseEnrollment"("courseId", "enrolledAt");
CREATE UNIQUE INDEX "LectureProgress_studentProfileId_lectureId_key" ON "LectureProgress"("studentProfileId", "lectureId");
CREATE INDEX "LectureProgress_studentProfileId_updatedAt_idx" ON "LectureProgress"("studentProfileId", "updatedAt");
CREATE INDEX "LectureProgress_lectureId_idx" ON "LectureProgress"("lectureId");
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
