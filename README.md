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

**Phase 1 — Foundation:** architecture, API service scaffold, health endpoint, initial relational data model and security conventions.

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
