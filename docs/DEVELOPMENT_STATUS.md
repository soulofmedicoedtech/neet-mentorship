# PRAXIS Development Status
Last updated: 2026-11-08

## Phase 1 — Foundation
- [x] Locate and preserve existing GitHub project.
- [x] Create isolated branch `praxis/phase-1-foundation`.
- [x] Document architecture and domain boundaries.
- [x] Add NestJS API service scaffold.
- [x] Add initial PostgreSQL/Prisma data model.
- [ ] Install dependencies and run type-check/build in a local development environment.
- [ ] Provision local PostgreSQL and validate first migration.
- [ ] Add automated CI checks.
- [ ] Implement production-grade authentication and RBAC.

## Existing implementation
- React + Vite landing page exists on `main`.
- It is a public marketing page, not a production student application.
- Login is currently a placeholder; production authentication/backend were not found in the initial inspection.
- No production database, QBank, examination engine, payment integration, video streaming or AI verification pipeline has been established.

## Pending phases
Academic CMS → QBank → examination engine → video → MBBS university module → AI assistant → subscriptions/payments → security/performance → deployment.

## Release rule
A feature is complete only after implementation and tests. External services, paid infrastructure, production releases and irreversible operations require owner approval.
