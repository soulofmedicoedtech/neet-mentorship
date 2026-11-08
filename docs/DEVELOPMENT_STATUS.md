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
- [x] Add a role-gated curriculum manager UI for creating subject/unit/chapter/topic records.
- [x] Connect the student Learning tab to the live read-only curriculum catalogue.
- [x] Add course records linked to subjects, admin-controlled course creation, verified faculty assignment and a faculty-only assigned-course endpoint with transactional audit logging.
- [x] Add a dedicated Prisma migration for course and faculty assignment tables.
- [x] Add course creation/assignment controls to the academic CMS and assigned-course view to the faculty workspace.
- [x] Add lecture/video metadata, PDF/external-link resource records and a draft → submitted → approved/rejected → published review workflow.
- [x] Add faculty lecture drafting/submission UI, academic-admin review/publish controls, and a student read-only published course/lecture/resource view.
- [ ] Integrate secure binary uploads/object storage, signed delivery URLs and malware scanning.
- [x] Add student self-enrolment in active courses, student-scoped published learning access, lecture completion records and course completion tracking.
- [ ] Provision local PostgreSQL and validate the complete initial migration.
- [x] Confirm latest Phase 2 CI passed on commit `60dfa2d`: web build, Prisma client generation, API build, all API unit tests and Prisma schema validation.
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
- Access tokens remain in memory; refreshing the page signs out. The learning roadmap is informational; the Phase 2 curriculum and course APIs are connected; faculty can draft lectures and attach PDF/external-link references, academic admins can review/publish, and students can view published learning content. Binary file storage is not implemented. Student self-enrolment and lecture/course progress tracking are implemented.

## Existing implementation and gaps
- React + Vite landing page and API-connected student portal.
- NestJS API scaffold with health endpoint and initial authentication foundation.
- Prisma schema includes identity, roles, sessions, student/faculty profiles, curriculum and audit events.
- No production database, validated migrations, full QBank, examination engine, payment integration, video streaming or AI verification pipeline has been established.
- Student authentication must not be exposed publicly until the remaining security controls, migrations, HTTPS, monitoring and security review are complete.

## Pending phases
Faculty onboarding and workload reporting → secure file storage and signed delivery → QBank → examination engine → video streaming → MBBS university module → AI assistant → subscriptions/payments → security/performance → deployment.

## Release rule
A feature is complete only after implementation and tests. External services, paid infrastructure, production releases and irreversible operations require owner approval.
