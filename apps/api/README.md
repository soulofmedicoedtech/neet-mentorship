# PRAXIS API
NestJS modular API foundation for PRAXIS.

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ (for database-backed modules)
- npm

## Local setup
Run these commands from `apps/api`:
```bash
cp .env.example .env
# Set DATABASE_URL and a unique JWT_SECRET (at least 32 characters) in .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

Health endpoint: `GET /api/v1/health`. The first complete PostgreSQL migration is in `prisma/migrations`; `prisma migrate dev` applies it to an empty local database.

For browser development, set `CORS_ORIGINS` to the exact comma-separated frontend origins. The defaults allow only local Vite development/preview origins.

## Student authentication endpoints

### Register
`POST /api/v1/auth/register`
```json
{
  "fullName": "Student Name",
  "email": "student@example.com",
  "password": "Use-A-Unique-Strong-Password1!"
}
```

### Login
`POST /api/v1/auth/login`
```json
{
  "email": "student@example.com",
  "password": "Use-A-Unique-Strong-Password1!"
}
```

Both endpoints return a short-lived (15-minute) bearer access token. Registration assigns only the STUDENT role; clients cannot select or self-assign privileged roles. Passwords are hashed with Argon2id. Input DTOs are validated by the global NestJS validation pipe.

## Current security boundary
This is an initial development foundation, not a production-ready identity system. Email ownership verification, password reset, refresh-token rotation, login throttling/abuse controls, account recovery, authenticated route guards and a complete RBAC policy are not yet implemented. New registrations are activated immediately for local integration testing. Do not expose these endpoints publicly or use real student data until those controls, migrations, HTTPS, monitoring and a security review are complete.

## Scripts
- `npm run start:dev` — development server
- `npm run build` — production compilation
- `npm run test` — unit tests
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate:dev` — create/apply a local migration

## Student profile and mentorship endpoints

All routes below except the college catalogue require `Authorization: Bearer <accessToken>`.

- `GET /api/v1/colleges?search=<name>` — lists active catalogue entries (maximum 100). The catalogue starts empty; only verified records should be imported by an authorised catalogue-management process.
- `GET /api/v1/students/me/profile` — retrieves the signed-in student's profile and selected college.
- `PATCH /api/v1/students/me/profile` — updates professional year, university, target examinations, preferred language and optional college ID. Values are allow-listed/validated.
- `POST /api/v1/students/me/mentorship-applications` — creates a student-owned application. A goal of at least 20 characters is required. New applications start as `PENDING`.
- `GET /api/v1/students/me/mentorship-applications` — lists only the signed-in student's applications and current statuses.

The student API does not expose an endpoint to approve, decline or otherwise change application status. A separately authorised mentor/admin workflow is still required. The college list is intentionally not pre-populated with guessed institution names; populate it only from a verified official catalogue.


## Protected admin mentorship review

These endpoints require a valid bearer token and one of the `SUPER_ADMIN`, `ADMIN` or `ACADEMIC_ADMIN` roles. The API checks the role claim server-side; hiding the UI is not the security boundary.

- `GET /api/v1/admin/mentorship-applications` — lists up to 200 applications with student profile, college and contact identity details. Optional `?status=PENDING` filter.
- `PATCH /api/v1/admin/mentorship-applications/:id` — changes status to `UNDER_REVIEW`, `APPROVED` or `DECLINED`. Every change and optional review note is written to `AuditEvent` in the same database transaction.

New public registrations can receive only the STUDENT role. Privileged role assignment is an operator-only database task after independently verifying the account. Example for a controlled local development database:

```sql
INSERT INTO "Role" ("id", "key", "description")
VALUES ('praxis-admin-role', 'ADMIN', 'PRAXIS administrator')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "UserRole" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" u CROSS JOIN "Role" r
WHERE u."email" = 'verified-admin@example.com' AND r."key" = 'ADMIN'
ON CONFLICT ("userId", "roleId") DO NOTHING;
```

Replace the email only with the verified administrator account. Run this only with direct, authorised database access; never expose this operation as a public API. The admin UI appears after that user signs in again and receives the updated role claim.

The faculty inbox and mentor recommendation endpoints are implemented in the current branch; this section describes the earlier admin-only milestone. Faculty assignment and access are enforced by the later mentor workflow documented below.


## Mentor assignment and faculty workspace

Admin-only:
- `GET /api/v1/admin/mentorship-applications/mentors` — active FACULTY users with a faculty profile.
- `PATCH /api/v1/admin/mentorship-applications/:id/assignment` — assign an eligible faculty user to a pending or under-review application. Reassignment is audit logged.

Faculty-only:
- `GET /api/v1/mentors/me/mentorship-applications` — returns only records where `assignedMentorId` equals the authenticated user ID.
- `PATCH /api/v1/mentors/me/mentorship-applications/:id/review` — saves a 20–2,000 character recommendation only when the application is assigned to that mentor and remains open. The update is audit logged.

The mentor cannot browse the global application list, change application decisions, or reassign records. The administrator retains final approval/decline authority. A FACULTY account must have an active User, FACULTY role and FacultyProfile before it can be assigned. Provision faculty accounts only through a separately verified, authorised operator workflow.


### Controlled local faculty provisioning

Faculty onboarding/invitation is not yet a public product workflow. For local development only, an authorised database operator may attach the FACULTY role and create the faculty profile after independently verifying the account. Example:

```sql
INSERT INTO "Role" ("id", "key", "description")
VALUES ('praxis-faculty-role', 'FACULTY', 'PRAXIS faculty mentor')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "UserRole" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" u CROSS JOIN "Role" r
WHERE u."email" = 'verified-faculty@example.com' AND r."key" = 'FACULTY'
ON CONFLICT ("userId", "roleId") DO NOTHING;

INSERT INTO "FacultyProfile" ("id", "userId", "qualifications", "specialties")
SELECT 'faculty-' || u."id", u."id", ARRAY[]::TEXT[], ARRAY[]::TEXT[]
FROM "User" u
WHERE u."email" = 'verified-faculty@example.com'
ON CONFLICT ("userId") DO NOTHING;
```

Replace the example email only with the independently verified account. The user must be ACTIVE. After provisioning, the faculty member must sign in again to receive a token containing the FACULTY role. Do not expose this SQL as a public endpoint or grant FACULTY based solely on a self-declared profile.


## Phase 2 — academic curriculum foundation

- `GET /api/v1/academic/subjects` — public read-only curriculum tree: active subjects, units, chapters and topics in configured order.
- `POST /api/v1/academic/subjects` — create a subject (unique uppercase code, name, optional description/order).
- `POST /api/v1/academic/subjects/:subjectId/units` — create a unit under an existing subject.
- `POST /api/v1/academic/units/:unitId/chapters` — create a chapter under an existing unit.
- `POST /api/v1/academic/chapters/:chapterId/topics` — create a topic under an existing chapter.

All write routes require a bearer token with one of SUPER_ADMIN, ADMIN, ACADEMIC_ADMIN, FACULTY or CONTENT_MANAGER. Parent existence is checked before child creation. Each create operation and its audit event are committed in one database transaction. The current Phase 2 slice includes a role-gated web curriculum manager and a student read-only catalogue view. It is not a complete CMS: editing/archiving, faculty assignment to courses, lecture/document upload, publication review and student enrolment are pending. The catalogue will remain empty until an authorized academic editor creates verified curriculum records.


## Courses and faculty assignment (Phase 2 continuation)

- `GET /api/v1/academic/courses` — public read-only list of active courses with their subject identifiers; faculty account details are not exposed.
- `POST /api/v1/academic/courses` — create a course under an existing subject. Requires SUPER_ADMIN, ADMIN or ACADEMIC_ADMIN.
- `POST /api/v1/academic/courses/:courseId/faculty` — assign an active user who has both the FACULTY role and a FacultyProfile. Requires SUPER_ADMIN, ADMIN or ACADEMIC_ADMIN.
- `GET /api/v1/academic/faculty/me/courses` — faculty-only list of courses assigned to the signed-in faculty account.

Course creation, assignment and audit records are transactional. Course codes are unique. Repeating the same faculty assignment is idempotent. The schema migration `20261108210000_course_faculty_assignment` must be applied before using these endpoints. This slice provides course structure and faculty ownership only; lecture/video and note/document records, publication workflow and student enrolment remain pending.


## Lectures, video references and study resources

- `GET /api/v1/academic/courses/:courseId/lectures` — public read-only access to published lectures and published resources only.
- `GET /api/v1/academic/faculty/me/lectures` — faculty-only list of the signed-in faculty member's authored lectures and resource metadata.
- `POST /api/v1/academic/courses/:courseId/lectures` — create a draft lecture. Faculty must be assigned to the course; academic admins and content managers may create across courses.
- `POST /api/v1/academic/lectures/:lectureId/resources` — add a PDF or external-link resource to a lecture draft. Faculty authors may edit their own lecture content; privileged academic editors may assist.
- `POST /api/v1/academic/lectures/:lectureId/submit` — submit a draft/rejected lecture and its draft resources for academic review.
- `GET /api/v1/academic/content-review/queue` — academic-admin review queue for submitted and approved lectures.
- `PATCH /api/v1/academic/lectures/:lectureId/review` — transition SUBMITTED to APPROVED/REJECTED, then APPROVED to PUBLISHED. Publishing also publishes approved attached resources.

Content changes and review decisions are audit logged. Students cannot see draft, submitted, approved-but-unpublished or rejected content. Video and PDF records currently store HTTPS URLs and metadata only; binary upload, malware scanning, signed URLs, storage lifecycle and provider integration are not implemented. The migration `20261108213000_lecture_learning_resources` must be applied before using these endpoints.


## Student course enrolment and progress

- `POST /api/v1/academic/courses/:courseId/enroll` — authenticated STUDENT enrolment in an active course; repeated requests return the existing enrolment.
- `GET /api/v1/academic/student/me/enrollments` — returns only the signed-in student's active course enrolments, published lectures/resources and their progress.
- `PATCH /api/v1/academic/lectures/:lectureId/progress` — records non-decreasing watched seconds and/or completion for a published lecture in a course the student is enrolled in. The course is marked complete when every currently published lecture has been completed.

The migration `20261108230000_student_learning_progress` must be applied before using these endpoints. Enrolment is currently open to authenticated student accounts; paid access, batch entitlements, subscriptions and payment checks are not implemented. Progress records are student-scoped and cannot be written for unpublished lectures or courses the student has not joined.


## Question bank foundation

- `GET /api/v1/academic/questions?examTrack=NEET_PG&page=1&limit=20` — STUDENT-only paginated list of published MCQs. Filters include subject, exam track and difficulty. Correct-answer flags and explanations are deliberately omitted from the question payload.
- `POST /api/v1/academic/questions/:questionId/attempt` — STUDENT-only answer submission. The API validates that the selected option belongs to the published question, stores the student's attempt and returns correctness, correct option and explanation after submission.
- `POST /api/v1/academic/questions` — creates a draft single-best-answer MCQ. QUESTION_BANK_MANAGER and academic administrators can author across subjects; faculty must have an active course assignment in the selected subject. Exactly one option must be marked correct.
- `POST /api/v1/academic/questions/:questionId/submit` — author submits a draft or rejected question for review.
- `GET /api/v1/academic/question-review/queue` and `PATCH /api/v1/academic/questions/:questionId/review` — question-bank managers/academic administrators review, approve/reject and publish questions.

The migration `20261108233000_question_bank_foundation` must be applied before using these endpoints. Only single-best-answer MCQs are supported in this foundation. No question content is seeded; only questions checked against an authorised source should be entered. This is not an AI-generated question pipeline or an examination engine.


### Student question bookmarks

- `GET /api/v1/academic/student/me/question-bookmarks?page=1&limit=20` — paginated bookmarks belonging only to the authenticated student. Only currently published questions are returned, and answer keys/explanations are excluded.
- `POST /api/v1/academic/questions/:questionId/bookmark` — idempotently bookmark a published question for the authenticated student.
- `DELETE /api/v1/academic/questions/:questionId/bookmark` — remove the bookmark from the authenticated student's own profile.

Apply migration `20261108234500_question_bookmarks` before enabling these endpoints.
