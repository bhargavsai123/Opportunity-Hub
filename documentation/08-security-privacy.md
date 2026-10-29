# Security, Privacy, and Abuse-Prevention Requirements

## Security baseline

- Hash passwords with a modern password-hashing algorithm and a suitable work factor; never store plaintext passwords.
- Use HTTPS in production.
- Keep secrets in deployment secret storage or environment variables; commit only placeholders in `.env.example`.
- Validate request bodies, path IDs, query parameters, arrays, strings, dates, and URLs on the server.
- Use a centralized authorization layer with explicit student/admin policy checks.
- Prevent mass assignment: allowlist fields the caller may update.
- Apply rate limits to authentication, account creation, and public report endpoints.
- Configure secure cookie attributes and CSRF defenses if cookie-based authentication is used.
- Set appropriate security headers; configure CORS for the actual frontend origin rather than allowing every origin with credentials.
- Keep dependencies updated and run an audit before release.
- Do not expose stack traces, database queries, secrets, password hashes, or internal moderation notes to clients.

## Authentication and authorization

- Public registration always creates a student account.
- Admin privilege must never be controlled by a client-supplied `role` field.
- Every protected endpoint verifies identity on the server.
- Every user-owned query filters by the authenticated user ID.
- Admin actions that publish/archive/verify a listing record the actor and timestamp.
- Logout invalidates the selected session/token mechanism; token expiry and rotation/revocation behavior must be documented.
- Consider administrator MFA before a public launch with valuable/large catalogue access.

## Privacy by design

- Collect only profile details that improve matching or reminders.
- Education level and interest preferences are personal data; do not expose profiles publicly.
- Optional location should be broad (e.g. city/region or preferred location), not precise GPS by default.
- Student notes and eligibility answers are private to the student.
- Do not sell or publicly disclose student behavior in the MVP.
- Do not send email reminders unless the user has enabled them and a verified address is available.
- Provide clear account deletion/request handling, privacy notice, and contact route before public launch.
- Define retention for account data, issue reports, reminder logs, and backup copies.

## Eligibility and listing trust safety

- A checklist is not an authoritative ruling. Keep this disclaimer near the checklist result.
- Link directly to the official source and label third-party application destinations clearly.
- Do not state a scholarship amount, stipend, deadline, or requirement unless supported by source content.
- Display a meaningful freshness marker: verified date, needs review, or not recently verified.
- Admin publish validation requires source URL and an explicit known/unknown deadline state.
- Provide a reporting process for stale listings, suspicious links, and inaccurate criteria.

## External links

- Accept only intended URL protocols; reject `javascript:` and other dangerous schemes.
- Treat external URLs as untrusted data even when submitted by an admin.
- Use safe new-tab behavior and clearly label the destination as external.
- Admins should inspect destinations before marking the listing verified.
- Do not proxy downloads or collect credentials from opportunity websites.

## Abuse and operational controls

- Rate-limit sign-in, sign-up, and report submission.
- Use generic authentication errors to reduce account enumeration.
- Add reasonable bounds to page size, query lengths, notes, and criteria count.
- Escape/render user-generated notes and report text as text, not HTML.
- Log security-relevant events, but never log raw passwords, tokens, cookies, or private notes.
- Back up MongoDB and test restoring it; a backup without a restore test is not a complete recovery plan.
- Have a process to remove or correct malicious links and disable compromised admin accounts.

## Pre-launch security checklist
- [ ] Role-based access tests exist for every admin endpoint.
- [ ] Cross-user access tests cover tracking, notes, profile, notifications, and eligibility responses.
- [ ] Validation and rate-limiting are enabled in production.
- [ ] CORS, cookies, CSRF, and security headers are reviewed for the chosen deployment.
- [ ] Secrets and production data are absent from source control and test fixtures.
- [ ] Error responses and logs are reviewed for leaks.
- [ ] Dependency audit and backup/restore rehearsal are complete.
- [ ] Privacy/terms/contact pages and account deletion behavior are defined.
