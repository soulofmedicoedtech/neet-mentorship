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
- [ ] Provision local PostgreSQL and validate the complete initial migration.
- [ ] Confirm a successful CI run on the latest PR commit.
- [ ] Implement email verification, password recovery, refresh-token rotation, rate limiting and complete RBAC.
- [ ] Add a protected mentor/admin application review workflow.
- [ ] Add end-to-end tests for registration, login, profile persistence, college selection and mentorship application flows.

## Current student portal prototype
- Student portal is reachable from the landing page using the **Student Portal Preview** entry.
- Profile fields include professional year, college, university, exam goal and preferred language.
- Mentorship application preview captures goals, challenges and preferred contact method.
- Learning roadmap lists planned video, notes, QBank, university preparation and test modules.
- These are browser-session-only preview interactions. They are not persisted, authenticated, submitted to a backend or connected to a real mentor.
- Do not use demo data or preview interactions as real student records.

## Existing implementation and gaps
- React + Vite landing page and API-connected student portal.
- NestJS API scaffold with health endpoint and initial authentication foundation.
- Prisma schema includes identity, roles, sessions, student/faculty profiles, curriculum and audit events.
- No production database, validated migrations, full QBank, examination engine, payment integration, video streaming or AI verification pipeline has been established.
- Student authentication must not be exposed publicly until the remaining security controls, migrations, HTTPS, monitoring and security review are complete.

## Pending phases
Mentor/admin application review workflow → academic CMS → QBank → examination engine → video → MBBS university module → AI assistant → subscriptions/payments → security/performance → deployment.

## Release rule
A feature is complete only after implementation and tests. External services, paid infrastructure, production releases and irreversible operations require owner approval.
