CREATE TABLE "Course" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "subjectId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CourseFacultyAssignment" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "facultyId" TEXT NOT NULL,
  "assignedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CourseFacultyAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
CREATE INDEX "Course_subjectId_active_idx" ON "Course"("subjectId", "active");
CREATE UNIQUE INDEX "CourseFacultyAssignment_courseId_facultyId_key" ON "CourseFacultyAssignment"("courseId", "facultyId");
CREATE INDEX "CourseFacultyAssignment_facultyId_createdAt_idx" ON "CourseFacultyAssignment"("facultyId", "createdAt");
ALTER TABLE "Course" ADD CONSTRAINT "Course_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseFacultyAssignment" ADD CONSTRAINT "CourseFacultyAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseFacultyAssignment" ADD CONSTRAINT "CourseFacultyAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
