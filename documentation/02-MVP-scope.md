# MVP Scope and Release Boundaries

## In scope for the first usable release

### Student experience
- Email/password registration, login, logout, and profile editing.
- Profile attributes for education level, discipline/branch, expected graduation year where relevant, interests, and optional location/mode preference.
- Public opportunity catalogue with search, pagination, filters, and sorting.
- Opportunity detail pages with eligibility, deadline, official application URL, source URL, and verification status.
- Profile-driven relevance hints with a short explanation.
- Per-opportunity eligibility checklist with “Meets”, “Does not meet”, and “Not sure / needs checking”.
- Saved opportunities, application status, optional private note, dashboard, and in-app deadline reminders.
- Configurable email reminder preferences if email infrastructure is approved and configured.
- Report-outdated/incorrect-listing action.

### Admin experience
- Admin-only access enforced by the API.
- Create/edit/draft/publish/unpublish/archive listings.
- Structured criteria editor and URL/deadline validation.
- Verification timestamp and moderation status.
- Duplicate warnings and issue-report queue.

### Engineering scope
- MERN application in a clearly separated client and server.
- Request validation, centralized error handling, access control, server-side filtering/pagination, indexes, unit/integration tests, environment configuration, and basic operational logging.
- Local setup guide and deployment checklist.

## Explicitly out of scope
- Automatic scraping/crawling or ingesting from arbitrary websites.
- AI that claims to decide official eligibility.
- Auto-submitting forms or applications; document vault/upload; CV builder.
- Native mobile app, push notifications, chat, community feed, social profiles.
- Paid plans, payments, sponsored listing placements, or advertising system.
- Institutional multi-tenancy, self-service partner onboarding, approval workflow across multiple curators.
- Complex recommender model or personalized ranking trained on behavioral data.
- Calendar-provider integrations in the first release.

## MVP prioritization

| Priority | Capability | Reason |
|---|---|---|
| P0 | Auth, student profile, opportunity catalogue, detail view | Required for core product journey |
| P0 | Search/filter/pagination and admin CRUD | Makes directory useful and maintainable |
| P0 | Save, application status, dashboard | Converts discovery into follow-through |
| P0 | Eligibility checklist and disclaimer | Differentiating feature, safely scoped |
| P0 | Deadline display and in-app reminders | Directly addresses missed deadlines |
| P0 | Source/verification fields and issue reporting | Trust and data-quality foundation |
| P1 | Email reminders | Useful but depends on provider/setup |
| P1 | Duplicate detection warnings | Improves curator workflow |
| P2 | Bulk import/export, calendar integration, advanced ranking | Defer until pilot feedback |

## Release gates
- **Gate A — Product/data readiness:** field schema and curated pilot data reviewed.
- **Gate B — Core flows:** all P0 acceptance criteria pass on desktop and mobile.
- **Gate C — Security/quality:** authorization tests, validation, rate limiting, dependency audit, error handling, and backup plan reviewed.
- **Gate D — Pilot readiness:** operational owner assigned; feedback/reporting route available; known limitations shown to testers.

## Scope-change rule
A feature enters MVP only if it directly supports discovery, eligibility understanding, deadline follow-through, trustworthy curation, or a release-blocking security/reliability need. Otherwise, record it in a post-MVP backlog with a user problem and success measure.
