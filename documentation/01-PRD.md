# Product Requirements Document (PRD)

**Product:** Opportunity Hub (working title)  
**Version:** Draft v1.0  
**Status:** Pre-development  
**Date:** 27 October 2026  
**Owner:** Product / project team

## 1. Executive summary

Opportunity Hub is a student-focused opportunity discovery and tracking platform. It consolidates scholarships, internships, hackathons, competitions, fellowships, and selected student programs into a searchable directory. Each listing includes clearly structured eligibility criteria, an official application link, an original source, a deadline when available, and a freshness/verification indicator. Students can personalize recommendations through their education level and interests, check requirements, save listings, receive deadline reminders, and track their application progress.

The MVP will be built as a MERN web application. The primary product risk is not simply search functionality; it is whether listing information is accurate, current, and sufficiently clear to help students act. The product therefore treats provenance, freshness, and transparent eligibility guidance as first-class requirements.

## 2. Problem statement

Students discover opportunities through many disconnected channels. Relevant notices are easy to overlook, eligibility language is inconsistent, deadlines are spread across multiple pages, and personal tracking often lives in bookmarks or spreadsheets. This causes avoidable discovery friction and missed deadlines.

### Current pain points
- Students repeatedly search multiple sites and channels.
- Eligibility requirements are hard to compare quickly.
- Some listings have unclear deadlines, expired links, or outdated information.
- Students lose track of opportunities they intended to apply for.
- Colleges and clubs lack a unified lightweight way to curate and share relevant listings.

## 3. Goals and non-goals

### Goals
1. Let a student find relevant opportunities through full-text search and practical filters.
2. Show essential opportunity information consistently, especially criteria, deadline, application link, and source.
3. Personalize the experience using the student's self-reported education profile and interests.
4. Give each opportunity a reviewable eligibility checklist without claiming official eligibility determination.
5. Allow saving and application-status tracking.
6. Surface upcoming deadlines in a personalized dashboard and provide configurable reminders.
7. Let authorized admins create, edit, verify, publish, and archive listings.
8. Make the core journeys responsive, accessible, and secure.

### Non-goals for MVP
- Automatically scraping every opportunity website.
- Automatically applying to an opportunity or uploading/submitting student documents.
- Making binding eligibility decisions or guaranteeing that an application will be accepted.
- Employer/recruiter applicant management or scholarship award management.
- Native iOS/Android applications.
- Complex recommendation ML, social feeds, chat, payments, or premium plans.
- Multi-tenant institutional administration with complex roles and approval chains.

## 4. Users and primary use cases

### Persona A: Student
A student wants to find internships, scholarships, hackathons, and competitions that suit their education stage and interests. They need to understand requirements quickly, bookmark promising listings, and avoid forgetting deadlines.

### Persona B: Listing curator / administrator
A trusted admin collects opportunity details, preserves official source links, checks eligibility and deadlines, and keeps the public catalogue useful by updating or archiving stale listings.

### Primary jobs to be done
- “Show me opportunities that fit my level of study and interests.”
- “Tell me what I need to check before deciding whether to apply.”
- “Remind me before a deadline I care about.”
- “Help me remember what I saved and what I have already applied to.”
- “Let me publish a listing with enough evidence that students can verify it.”

## 5. Product principles

1. **Trust over volume:** a smaller curated catalogue is better than a large stale catalogue.
2. **Transparent eligibility:** show criteria and uncertainty; never imply official confirmation.
3. **Action-oriented:** every active listing should have a next step or a clearly explained missing field.
4. **Student control:** students can change interests, reminder settings, and saved/status records.
5. **Accessible by default:** essential flows must work on narrow screens and with keyboard navigation.
6. **Privacy by design:** collect only profile details needed for matching and reminders.

## 6. MVP scope and requirements

### 6.1 Authentication and profile
- **FR-001 — Registration:** a visitor can register with email and password.
- **FR-002 — Login/logout:** a registered user can securely sign in and sign out.
- **FR-003 — Student profile:** a student can set education level, degree/branch where relevant, graduation year where relevant, location preference (optional), and interests.
- **FR-004 — Profile editing:** a student can update profile and interests at any time.
- **FR-005 — Role enforcement:** only explicitly authorized admins can access admin APIs and screens.

### 6.2 Opportunity catalogue
- **FR-010 — Listing fields:** an opportunity can store title, type, summary, organization, eligibility criteria, deadline (or “not specified”), application URL, original source URL, delivery mode/location if applicable, tags/interests, benefits when known, listing status, created/updated timestamps, and last verified timestamp.
- **FR-011 — Catalogue browsing:** users can browse published active opportunities without needing to save them first.
- **FR-012 — Search:** users can search by title, organization, summary, and tags.
- **FR-013 — Filters:** users can filter by type, interest/category, education level, location/mode, deadline range, and active status where meaningful.
- **FR-014 — Sorting:** users can sort by deadline, newest/last updated, or relevance where supported.
- **FR-015 — Detail view:** each opportunity detail page shows criteria, deadline/timezone, application link, original source, verification/freshness information, and a clear external-link indicator.
- **FR-016 — Pagination:** list endpoints paginate results and return total/page metadata or cursor metadata.
- **FR-017 — Listing lifecycle:** admins can create, edit, publish/unpublish, archive, and mark a listing as expired or needing review.
- **FR-018 — Source traceability:** each published listing must include an original source URL; a separate application URL may be the same or different.
- **FR-019 — Freshness:** listings must show last verified time or clearly indicate that it has not been verified recently.

### 6.3 Eligibility checklist and personalization
- **FR-020 — Structured criteria:** admins can define criteria as checklist items with a label, category, and optionally whether the criterion is required or informational.
- **FR-021 — Student checklist:** a student can mark each criterion “Meets”, “Does not meet”, or “Not sure / needs checking”.
- **FR-022 — Checklist persistence:** checklist answers are saved per student and opportunity so progress is retained.
- **FR-023 — Profile-based relevance:** the catalogue/dashboard can highlight opportunities whose declared education levels and tags overlap with the student's profile.
- **FR-024 — Explanation:** the UI can explain why an opportunity is highlighted (for example, matching interest tags or education level).
- **FR-025 — Eligibility disclaimer:** checklist results are guidance only and must not be presented as an official decision.

### 6.4 Saved listings, application tracking, and reminders
- **FR-030 — Save/unsave:** a student can save or remove an opportunity from their saved list.
- **FR-031 — Application status:** a student can track a listing as “Interested”, “Planning”, “In progress”, “Applied”, “Accepted”, “Rejected”, or “Withdrawn”. Default is “Interested” when first tracked; the UI may expose “Not tracking” for no record.
- **FR-032 — Personal notes:** a student may add a short private note to their tracking record.
- **FR-033 — Dashboard:** the dashboard summarizes saved opportunities, current statuses, and upcoming deadlines.
- **FR-034 — Reminder preferences:** a student can enable/disable reminders and choose available lead times (MVP: 7 days, 3 days, and 1 day before deadline; app-wide defaults can be adjusted during implementation).
- **FR-035 — In-app reminders:** upcoming reminders appear in the authenticated dashboard/notification area.
- **FR-036 — Email reminders:** email reminders may be enabled only when email delivery is configured and verified; failures must be logged safely and must not block the app.
- **FR-037 — Idempotency:** a reminder for the same user, opportunity, deadline, and lead-time window must not be sent more than once.
- **FR-038 — Deadline changes:** when an admin updates a deadline, pending reminders must be recalculated and stale scheduled reminders must not fire for the old deadline.

### 6.5 Administration and quality
- **FR-040 — Admin dashboard:** admins can see published, draft, expired, archived, and needs-review listings.
- **FR-041 — Validation:** required fields and valid URLs/deadline values are checked before publishing.
- **FR-042 — Duplicate warning:** the admin UI should warn about likely duplicate listings based on normalized title, organization, and source/application URL.
- **FR-043 — Audit fields:** record who created/last updated a listing and the verification date.
- **FR-044 — Report issue:** MVP should provide a simple “Report outdated/incorrect listing” path, storing a report for admin review.
- **FR-045 — Admin moderation:** admins can dismiss reports, correct listings, or archive listings that should no longer appear as active.

## 7. UX and interaction requirements

- Responsive layout with functional search and filters on mobile.
- Opportunity cards show type, title, organization, deadline or “No deadline listed”, key matching hints, and save action.
- Detail page has distinct “Apply on official site” and “View source” links when those differ.
- Deadline urgency is communicated using text and icon/color together, never color alone.
- Eligibility checklist states are plain-language and keyboard operable.
- Empty states explain how to get started or change filters.
- Destructive actions such as removing a tracked record or archiving a listing require confirmation or an undo path.
- External links open safely and are clearly identified as leaving the platform.

## 8. Data and content rules

- Do not fabricate eligibility, benefits, deadlines, or organization details.
- If the source does not state a deadline, store it as unknown rather than inferring one.
- Store both the application destination and source URL; retain the last verification timestamp.
- Store dates in UTC and render them in the student's configured timezone. Preserve a source timezone when explicitly stated.
- Do not display “verified” unless a curator actually checked the source.
- Expired/archived listings are excluded from active discovery by default but can remain visible in a student's own tracking history with a clear status.
- Admins are responsible for the accuracy of manually curated entries; reports provide a feedback loop.

## 9. Success metrics

### Product outcome metrics
- Opportunity detail-to-application-link click-through rate.
- Share of active students who save at least one listing.
- Share of saved listings with an application status update.
- Reminder delivery success rate and reminder open/click rate if email tracking is used appropriately.
- Percentage of published listings with source URL and verification timestamp.
- Rate of user reports for stale/incorrect listings and median time to resolve them.

### Usability/quality metrics
- Search/filter task completion rate in usability tests.
- Time taken for a first-time user to find and save a relevant opportunity.
- Accessibility and responsive-layout defects found before release.
- API error rate, p95 response time under the agreed test load, and failed reminder jobs.

No numerical launch targets are assumed yet; the team should set targets after a pilot and baseline measurement. Vanity metrics such as total listings alone are not a sufficient success signal.

## 10. Non-functional requirements

- **NFR-001 Availability:** graceful errors and retryable background jobs; the deployment target will define an explicit availability target.
- **NFR-002 Performance:** common catalogue and dashboard requests should feel responsive; paginate every list and index common query fields.
- **NFR-003 Security:** strong password hashing, server-side authorization, input validation, rate limiting, secure session/token handling, and secrets outside source control.
- **NFR-004 Privacy:** collect minimum profile data; users can edit profile and request account deletion according to the project's data-retention policy.
- **NFR-005 Accessibility:** target WCAG 2.2 AA practices for core journeys, subject to a practical automated and manual audit.
- **NFR-006 Maintainability:** separate client, API, data models, validation, and reminder services; document environment variables and setup.
- **NFR-007 Observability:** structured server logs, request IDs where practical, reminder-job outcomes, and health/readiness endpoints without exposing secrets.
- **NFR-008 Data integrity:** enforce uniqueness for user-opportunity saves/tracking and reminder deduplication keys.
- **NFR-009 Portability:** use environment-based configuration so local development and production can differ without source changes.

## 11. Dependencies and constraints

- MongoDB database and backup plan.
- Email provider credentials for email reminders; without this dependency, in-app reminders remain available.
- Secure hosting for frontend/API and HTTPS in production.
- Admins/curators who can provide and maintain trustworthy opportunity data.
- Opportunity websites may change terms, page structures, and availability; MVP will not scrape them automatically.

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Stale or false listings | Students waste time or miss deadlines | Show sources and verification dates; report flow; expiration review queue |
| Incorrect eligibility matching | Students incorrectly assume they qualify | Checklist is self-assessed; no definitive eligibility claims; show unknown criteria |
| Too few listings at launch | Platform feels empty | Curate a small but varied pilot catalogue before public release |
| Reminder duplication or wrong deadline | Trust loss | Idempotent reminder keys; recalculate after deadline changes; test timezones |
| Admin account compromise | Catalogue manipulation | Role-based authorization, MFA as a later hardening option, rate limits, audit logs |
| Scope creep | Delayed launch | Keep scraping, ML recommendations, and multi-tenant portals out of MVP |

## 13. MVP release acceptance criteria

The MVP is ready for pilot when:
1. A student can register, sign in/out, edit profile, and access only their private data.
2. Published opportunities can be searched, filtered, sorted, paginated, and opened in a detail view.
3. Every published listing has an original source URL and explicit deadline state (date or unknown).
4. The student can complete and revisit eligibility checklist answers.
5. The student can save a listing, set/update status, and see the result on the dashboard.
6. In-app reminders are visible for upcoming tracked deadlines; configured email reminders are deduplicated and tested if enabled.
7. An admin can create, validate, publish, update, archive, and verify listings.
8. Reported listing issues can be reviewed and resolved by an admin.
9. Automated tests cover authentication, authorization, core API flows, and reminder deduplication.
10. Core pages work on mobile and desktop, and the team has reviewed keyboard navigation and accessible labels.
11. Deployment, environment configuration, backup/restore basics, and incident/contact ownership are documented.

## 14. Launch strategy

Start with a small private pilot involving a student club, department, or placement cell. Seed the catalogue through manual curation, validate the search-to-save-to-track journey, and collect feedback on relevance and trust. Expand the content categories only after the team can maintain verification quality.

## 15. Open decisions

See [Assumptions, Decisions, and Open Questions](11-assumptions-decisions-open-questions.md). These include the final product name, identity provider strategy, email provider, hosting, reminder delivery policy, and whether anonymous browsing remains enabled after pilot.
