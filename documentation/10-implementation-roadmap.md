# Implementation Roadmap — Documentation-First Plan

The roadmap sequences the build by dependency, with a validation checkpoint at the end of each phase. Estimates are intentionally omitted until team capacity and hosting choices are known.

## Phase 0 — Product and technical decisions
**Deliverables:** approved PRD and scope, final MVP decisions, repository structure, environment strategy, data model review, simple wireframes.

Checklist:
- [ ] Confirm working name or choose final product name.
- [ ] Decide JavaScript vs TypeScript.
- [ ] Decide session/cookie approach and CSRF handling.
- [ ] Decide hosting, database, email provider, and domain strategy.
- [ ] Agree on what “saved” means for reminders and tracking.
- [ ] Review privacy, retention, and account deletion policy.
- [ ] Define seed/pilot catalogue and who is responsible for verification.

**Exit gate:** open questions affecting schema, auth, or reminders are resolved or explicitly deferred.

## Phase 1 — Repository and engineering foundation
**Deliverables:** client/server scaffold, lint/format/test scripts, environment example, centralized errors, database connection, health endpoint, CI basics.

- [ ] Create client and server workspaces.
- [ ] Add environment validation and safe startup checks.
- [ ] Add request logging with secrets redacted.
- [ ] Add common API error format and request validation approach.
- [ ] Add database indexes/migration or index management strategy.
- [ ] Write local setup instructions.

**Exit gate:** new developer can run client/API locally using documented steps.

## Phase 2 — Authentication and profile
**Deliverables:** registration/login/logout, current user, server-side role enforcement, profile/preferences.

- [ ] Implement password hashing and authentication middleware.
- [ ] Ensure registration cannot create admins.
- [ ] Add rate limits and validation.
- [ ] Implement profile update and private preference endpoints.
- [ ] Add tests for ownership and unauthorized access.

**Exit gate:** account and profile flows pass integration tests.

## Phase 3 — Opportunity catalogue and admin curation
**Deliverables:** public browse/search/filter/detail and admin CRUD/lifecycle.

- [ ] Implement opportunity schema and indexes.
- [ ] Add server-side query parsing and pagination.
- [ ] Add public detail view and external-source/application links.
- [ ] Add admin create/edit/draft/publish/archive/verify operations.
- [ ] Add duplicate warnings and field validation.
- [ ] Add curated non-production sample records clearly labeled as samples.

**Exit gate:** a curator can publish a valid listing and a student can find it through the public catalogue.

## Phase 4 — Checklist, saves, and application tracking
**Deliverables:** saved opportunities, status tracking, private notes, checklist persistence, dashboard.

- [ ] Implement tracking and checklist models with unique indexes.
- [ ] Build eligibility criteria editor and student checklist UI.
- [ ] Add relevance explanations based on deterministic profile/tag matches.
- [ ] Build saved list and tracking-status controls.
- [ ] Build dashboard with deadline ordering and empty/error states.
- [ ] Add cross-user privacy tests.

**Exit gate:** student can complete the core journey and safely revisit their data.

## Phase 5 — Reminders and reports
**Deliverables:** in-app notifications, reminder ledger/worker, optional email adapter, issue-report queue.

- [ ] Finalize reminder eligibility rule and lead times.
- [ ] Implement unique dedupe keys and retry strategy.
- [ ] Reconcile reminder entries when deadline/status/preferences change.
- [ ] Add tests for duplicate worker runs and timezone boundaries.
- [ ] Add public report form and admin report resolution flow.
- [ ] Enable email only after provider, verified sender, and consent handling are configured.

**Exit gate:** reminders do not duplicate, stale deadlines do not trigger, and reports can be resolved.

## Phase 6 — Hardening and pilot
**Deliverables:** responsive/accessibility QA, security review, backup/restore test, deployment, pilot feedback plan.

- [ ] Execute P0 E2E flows and mobile smoke tests.
- [ ] Run dependency and configuration audits.
- [ ] Verify production secrets, CORS, cookies, HTTPS, rate limits, and logging.
- [ ] Test backup restoration.
- [ ] Add privacy/terms/contact pages and account-deletion behavior.
- [ ] Curate and verify initial catalogue before inviting users.
- [ ] Run small pilot, capture friction and relevance feedback, prioritize fixes.

**Exit gate:** no unresolved critical/high defects, documented owner for data curation and operations, and pilot acceptance checklist complete.

## Post-MVP backlog candidates
- Calendar export/integration.
- Bulk listing import with explicit review queue.
- Partner/college-specific curated collections.
- Better duplicate detection and admin quality reports.
- Saved searches and additional reminder rules.
- Accessibility improvements discovered during pilot.
- Dedicated search service only if actual catalogue scale demands it.

## Implementation rule
Complete and review the docs and UX flows before starting feature implementation. During the build, update the API, schema, and acceptance criteria when a deliberate product decision changes; do not let code silently redefine the product.
