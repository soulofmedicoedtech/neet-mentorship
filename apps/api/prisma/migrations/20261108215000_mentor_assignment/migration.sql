ALTER TABLE "MentorshipApplication"
  ADD COLUMN "assignedMentorId" TEXT,
  ADD COLUMN "mentorReviewNote" TEXT,
  ADD COLUMN "assignedAt" TIMESTAMP(3);

CREATE INDEX "MentorshipApplication_assignedMentorId_status_createdAt_idx"
  ON "MentorshipApplication"("assignedMentorId", "status", "createdAt");

ALTER TABLE "MentorshipApplication"
  ADD CONSTRAINT "MentorshipApplication_assignedMentorId_fkey"
  FOREIGN KEY ("assignedMentorId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
