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
