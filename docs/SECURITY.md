# PRAXIS Security Baseline

- Validate all input at API boundaries.
- Enforce authorization server-side with deny-by-default policies.
- Hash passwords with a modern adaptive password hash (Argon2id preferred) when local credentials are introduced.
- Keep secrets in environment/secret management; never commit credentials.
- Rate-limit authentication, search, AI and test submission endpoints.
- Use secure, HttpOnly, SameSite cookies for browser sessions when cookie authentication is selected.
- Rotate refresh tokens and support session revocation.
- Restrict upload types and sizes; scan files before publication.
- Keep media buckets private and issue short-lived playback access only after entitlement checks.
- Record privileged actions in append-only audit events.
- Encrypt transport and storage using managed, supported mechanisms.
- Define retention, export, correction and account deletion workflows.

## Medical content integrity
Content must carry provenance, license/ownership metadata, review state and reviewer attribution. AI-generated content remains labeled as generated/draft until an authorized academic reviewer approves it.

## Privacy
Collect only necessary student data. Do not use private learning records to train external models without a valid legal basis, appropriate notice and authorization. Do not expose sensitive data in logs, analytics or lock-screen notifications.

## Platform limitations
Screenshot prevention is not universally enforceable, especially on the web. Use platform-supported controls, watermarking and monitoring without promising absolute prevention.
