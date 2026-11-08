# PRAXIS Technical Architecture

## Product boundaries
PRAXIS is a multi-client medical learning platform. Begin with a modular monolith and extract services only when measured scale or operational isolation justifies it.

## Proposed stack
| Layer | Initial choice | Rationale |
|---|---|---|
| Student web | Existing React + Vite; TypeScript migration staged | Preserve the working landing page and avoid an unreviewed rewrite |
| Mobile | Flutter | One maintained Android/iOS codebase |
| API | NestJS + TypeScript | Modular server-side authorization, validation and testing |
| Database | PostgreSQL + Prisma | Relational integrity for curriculum, questions, attempts and billing |
| Cache/jobs | Redis + BullMQ (later) | Caching, rate limits and background work |
| Object storage | Private S3-compatible buckets | Media and documents stay off application servers |
| Search | PostgreSQL full-text initially | Avoid operating a search cluster prematurely |
| AI | Provider adapter + retrieval layer (later) | Model portability and auditable retrieval |

No cloud provider, payment gateway, DRM vendor or AI provider is selected until cost, data residency, contractual terms and security are reviewed.

## Domain modules
1. Identity and access
2. Student profile and preferences
3. Curriculum and catalog
4. Learning assets and video entitlements
5. Question bank and academic review
6. Examinations and attempts
7. Revision and personal learning tools
8. AI assistant and verified knowledge
9. Subscriptions and payments
10. Notifications and support
11. Analytics and audit

## Initial API boundaries
- `/api/v1/health` — liveness/readiness foundation
- `/api/v1/auth` — authentication
- `/api/v1/curriculum` — curriculum catalog
- `/api/v1/questions` — question bank
- `/api/v1/exams` — examination lifecycle
- `/api/v1/learning` — courses, lectures and progress
- `/api/v1/admin` — privileged management APIs

Every protected route must enforce authorization on the server; hiding UI controls is not authorization.

## Data principles
- Stable IDs and version history for curriculum and questions.
- Separate authored, reviewed, approved and published states.
- Transactional examination attempts and responses.
- Store payment provider references, never raw card credentials.
- Minimize personal data and define retention/deletion workflows.
- Store UTC timestamps and render local time in clients.

## Target topology
Clients → CDN/WAF → API gateway → NestJS modular API → PostgreSQL / Redis / private object storage. Background workers process media, notifications and analytics. AI requests pass through a provider adapter and retrieval policy layer.

## Quality gates
Each phase requires type-checking, unit tests, integration tests for critical flows, migration validation and a documented security review. Production readiness additionally requires load tests, backup restore drills, privacy/legal review and operational monitoring.
