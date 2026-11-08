# PRAXIS — Powered by Soul of Medico

**Learn Smarter. Revise Faster. Perform Better.**

PRAXIS is an original medical education platform for MBBS university examinations, NEET PG and INI-CET preparation.

## Repository status

This repository is being developed in verified phases. The existing React + Vite landing experience is preserved while the platform foundation is added.

- [Architecture and implementation plan](docs/ARCHITECTURE.md)
- [Development status](docs/DEVELOPMENT_STATUS.md)
- [Security baseline](docs/SECURITY.md)
- [API service](apps/api/README.md)

## Current phase

**Phase 1 — Foundation:** architecture, API service scaffold, student authentication, API-backed student profile and mentorship workflows, initial relational data model and security conventions. Phase 1 CI passed on commit `536cfd5`.

**Phase 2 — Academic infrastructure (started):** the API now exposes a read-only hierarchical curriculum catalogue and role-protected creation endpoints for subjects, units, chapters and topics. Faculty/admin writes are audited. The faculty CMS UI, lectures, notes, student enrolment and content publication workflow remain pending.

The React student portal supports API registration/sign-in, profile retrieval and updates, college catalogue search, mentorship application submission and application-status history. A role-aware admin workspace supports listing, filtering, reviewing and assigning applications to active faculty mentors. Faculty accounts receive a separate mentor workspace that lists only applications assigned to the signed-in mentor and accepts mentor recommendations. Assignment, decisions and mentor recommendations are audit logged. Authentication tokens are held in memory only; refreshing the page signs the user out. The demo preview remains separate and is not sent to the API. The review workspace is limited to SUPER_ADMIN, ADMIN and ACADEMIC_ADMIN; faculty mentor assignment and mentor-specific access are implemented in the API and role-aware portal. The academic curriculum APIs have been added; the authoring UI remains pending.

### Connect the web app to the API

Create a root `.env.local` file (do not commit it) with:

```bash
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Start the API on port 4000 and the web app with `npm run dev`. Configure the API's `CORS_ORIGINS` to include the exact web-app origin. For a hosted preview, set `VITE_API_BASE_URL` to the API base URL and configure the API CORS allow-list for that exact hosted origin. Do not expose the current development authentication service publicly.

## Planned workspace

- `apps/web` — student web experience (existing Vite application; migration decisions documented before implementation)
- `apps/api` — NestJS API
- `apps/mobile` — Flutter Android/iOS application (planned)
- `packages/contracts` — shared API contracts (planned)
- `infra` — deployment and infrastructure definitions (planned)

## Local development

The existing landing app can be run with:

```bash
npm install
npm run dev
```

The API scaffold is in `apps/api`. Copy `.env.example` to `.env` and configure local services before starting it. Never commit real secrets.

## Non-negotiable standards

- No fabricated student, financial, examination or analytics data.
- No unreviewed AI-generated medical content presented as verified.
- No unauthorized copyrighted educational content.
- Least-privilege access and server-side authorization.
- Paid services, production deployments and irreversible operations require owner approval.
