CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE "AcademicRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'CONTENT_MANAGER', 'QUESTION_BANK_MANAGER', 'VIDEO_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_EXECUTIVE', 'MODERATOR', 'STUDENT');
CREATE TYPE "MentorshipApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'WITHDRAWN');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "phoneE164" TEXT,
  "passwordHash" TEXT,
  "displayName" TEXT NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "key" "AcademicRole" NOT NULL,
  "description" TEXT,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Permission" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "UserRole" (
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId")
);
CREATE TABLE "RolePermission" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);
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
CREATE TABLE "StudentProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "professionalYear" TEXT,
  "university" TEXT,
  "targetExaminations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredLanguage" TEXT,
  "collegeId" TEXT,
  CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FacultyProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "qualifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  CONSTRAINT "FacultyProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DeviceSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceLabel" TEXT,
  "refreshHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Subject" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Unit" (
  "id" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Chapter" (
  "id" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Topic" (
  "id" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
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

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phoneE164_key" ON "User"("phoneE164");
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE UNIQUE INDEX "College_name_state_key" ON "College"("name", "state");
CREATE INDEX "College_state_active_idx" ON "College"("state", "active");
CREATE INDEX "College_university_active_idx" ON "College"("university", "active");
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
CREATE INDEX "StudentProfile_collegeId_idx" ON "StudentProfile"("collegeId");
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");
CREATE INDEX "DeviceSession_userId_revokedAt_idx" ON "DeviceSession"("userId", "revokedAt");
CREATE INDEX "DeviceSession_expiresAt_idx" ON "DeviceSession"("expiresAt");
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
CREATE INDEX "Unit_subjectId_sortOrder_idx" ON "Unit"("subjectId", "sortOrder");
CREATE INDEX "Chapter_unitId_sortOrder_idx" ON "Chapter"("unitId", "sortOrder");
CREATE INDEX "Topic_chapterId_sortOrder_idx" ON "Topic"("chapterId", "sortOrder");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");
CREATE INDEX "AuditEvent_resource_resourceId_idx" ON "AuditEvent"("resource", "resourceId");
CREATE INDEX "MentorshipApplication_studentProfileId_createdAt_idx" ON "MentorshipApplication"("studentProfileId", "createdAt");
CREATE INDEX "MentorshipApplication_status_createdAt_idx" ON "MentorshipApplication"("status", "createdAt");

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MentorshipApplication" ADD CONSTRAINT "MentorshipApplication_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
