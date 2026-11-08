# PRAXIS API
NestJS modular API scaffold for PRAXIS.

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ (for database-backed modules)
- npm

## Setup
```bash
cp .env.example .env
npm install
npm run start:dev
```
Initial health endpoint: `GET /api/v1/health`.

Database-backed modules are not enabled until a local database is configured and migrations are validated.

## Scripts
- `npm run start:dev` — development server
- `npm run build` — production compilation
- `npm run test` — unit tests
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate:dev` — create/apply local migration

Do not deploy this scaffold as a production API. Authentication, RBAC, migration validation, observability and security testing remain pending.
