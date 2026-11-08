# PRAXIS Development Status
Last updated: 2026-11-08

## Phase 1 — Foundation
- [x] Locate and preserve existing GitHub project.
- [x] Create isolated branch `praxis/phase-1-foundation`.
- [x] Document architecture and domain boundaries.
- [x] Add NestJS API service scaffold and versioned health endpoint.
- [x] Add initial PostgreSQL/Prisma identity, role, session, curriculum and audit schema.
- [x] Add initial CI workflow for web build, API build/tests and Prisma validation.
- [x] Add student registration/login API foundation (not production-ready).
- [x] Add responsive student portal with API-backed registration/login, profile, college lookup and mentorship application workflows; retain a separate demo preview.
- [x] Add authenticated student profile read/update API and student-owned mentorship application endpoints.
- [x] Add college catalogue read endpoint and complete initial PostgreSQL schema migration (catalogue data not yet seeded).
- [ ] Install dependencies and run type-check/build in a local development environment.
- [x] Start Phase 2 academic infrastructure with a curriculum catalogue and faculty-authorized subject/unit/chapter/topic creation APIs.
- [ ] Provision local PostgreSQL and validate the complete initial migration.
- [x] Confirm Phase 1 CI succeeded on commit `536cfd5`; rerun CI for the new Phase 2 commit.
- [ ] Implement email verification, password recovery, refresh-token rotation, rate limiting and complete permission-based RBAC.
- [x] Add a protected admin/academic-admin mentorship review API with role guard and transactional audit logging.
- [x] Add a role-aware admin workspace to list, filter, approve, decline and start review of mentorship applications.
- [x] Add admin-controlled assignment to verified active faculty accounts.
- [x] Add faculty-only assigned-application inbox and mentor recommendation submission.
- [ ] Add faculty onboarding/invitation and mentor workload reporting.
- [ ] Add end-to-end tests for registration, login, profile persistence, college selection, mentorship application and admin review flows.

## Current student and admin workspaces
- Student portal supports API-backed registration/login, profile persistence, college lookup and mentorship applications.
- A separate demo preview remains browser-session-only and is not submitted to the API.
- Admin workspace is shown only when the signed-in token includes SUPER_ADMIN, ADMIN or ACADEMIC_ADMIN. It supports application listing, status filtering and review transitions.
- Admin status changes are written to AuditEvent in the same database transaction as the application update.
- Privileged roles must be granted by an authorised database operator; there is no public role-elevation endpoint.
- Admins can assign eligible active FACULTY users with a FacultyProfile. Faculty see only records assigned to their own user ID and can submit recommendations; they cannot approve/decline or browse other applications.
- Faculty onboarding/invitation and workload reporting are not implemented.
- Access tokens remain in memory; refreshing the page signs out. The learning roadmap is informational; the Phase 2 curriculum API is now connected to the database, but a faculty content-management UI, lectures, notes and student course enrolment are not implemented.

## Existing implementation and gaps
- React + Vite landing page and API-connected student portal.
- NestJS API scaffold with health endpoint and initial authentication foundation.
- Prisma schema includes identity, roles, sessions, student/faculty profiles, curriculum and audit events.
- No production database, validated migrations, full QBank, examination engine, payment integration, video streaming or AI verification pipeline has been established.
- Student authentication must not be exposed publicly until the remaining security controls, migrations, HTTPS, monitoring and security review are complete.

## Pending phases
Faculty onboarding and workload reporting → academic CMS UI and course content → QBank → examination engine → video → MBBS university module → AI assistant → subscriptions/payments → security/performance → deployment.

## Release rule
A feature is complete only after implementation and tests. External services, paid infrastructure, production releases and irreversible operations require owner approval.
