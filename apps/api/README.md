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
npm run prisma:migrate:dev -- --name initial
npm run start:dev
```

Health endpoint: `GET /api/v1/health`.

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
