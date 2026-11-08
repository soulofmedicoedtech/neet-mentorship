CREATE TYPE "MentorshipApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'WITHDRAWN');

CREATE TABLE "College" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "university" TEXT,
  "collegeType" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "College_name_state_key" ON "College"("name", "state");
CREATE INDEX "College_state_active_idx" ON "College"("state", "active");
CREATE INDEX "College_university_active_idx" ON "College"("university", "active");

ALTER TABLE "StudentProfile" ADD COLUMN "collegeId" TEXT;
CREATE INDEX "StudentProfile_collegeId_idx" ON "StudentProfile"("collegeId");
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MentorshipApplication" (
  "id" TEXT NOT NULL,
  "studentProfileId" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "challenge" TEXT,
  "preferredContact" TEXT,
  "status" "MentorshipApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MentorshipApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MentorshipApplication_studentProfileId_createdAt_idx" ON "MentorshipApplication"("studentProfileId", "createdAt");
CREATE INDEX "MentorshipApplication_status_createdAt_idx" ON "MentorshipApplication"("status", "createdAt");
ALTER TABLE "MentorshipApplication" ADD CONSTRAINT "MentorshipApplication_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
