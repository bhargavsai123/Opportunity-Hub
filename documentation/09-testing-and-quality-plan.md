# Testing and Quality Plan

## Quality objectives

Protect student data, keep listing details understandable, prevent incorrect or duplicate reminders, and make the core journey work across devices. Test behavior and authorization rather than relying only on visual happy-path checks.

## Test layers

### Unit tests
- Eligibility summary helpers and allowed criterion answer states.
- Relevance matching rules and explanation generation.
- Deadline/timezone formatting utilities.
- Status transitions and validation rules.
- Reminder due-date calculation, deadline revision handling, and deduplication key generation.
- URL normalization and duplicate-warning helper behavior.

### API integration tests
- Register/login/logout/current-user endpoints.
- Student CRUD ownership and attempts to access another student's records.
- Catalogue query validation, filters, pagination, and active/published constraints.
- Admin-only opportunity creation, publishing, verification, archival, and reports queue.
- Saved/tracking upsert idempotency.
- Checklist read/update and criterion membership validation.
- Reminder processor behavior when a notification already exists, when email fails, and when deadlines change.

### Frontend/component tests
- Registration and login validation states.
- Search and combined filters.
- Opportunity card/detail required metadata.
- Eligibility checkbox/radio states and persistence feedback.
- Save/unsave and status update interaction.
- Dashboard states: upcoming, no known deadlines, expired, empty, and API error.
- Admin form validation and publish confirmation.

### End-to-end tests
1. Student registers, sets profile, searches, opens a listing, saves it, and sees it on the dashboard.
2. Student updates checklist answers and sees them after refresh/re-login.
3. Student changes application status and sees the updated status.
4. Admin creates a draft, verifies a source, publishes, updates a deadline, and archives a listing.
5. A configured reminder produces one notification per lead-time and does not duplicate on repeated worker runs.
6. A student cannot retrieve or mutate another student's notes, saved records, or checklist answers.

## Important edge cases
- Missing/unknown deadline, rolling deadline, deadline today, and already-expired deadline.
- Timezone and daylight-saving changes where relevant.
- Admin changes the deadline after a reminder was scheduled.
- Listing is archived after a student saved it.
- Criteria are edited after a student completed the checklist.
- The same save/status update is submitted twice.
- Malformed Mongo-like query operators appear in query/body input.
- External URL uses a dangerous protocol or malformed host.
- Email provider is unavailable or times out.
- Student has no interests and/or profile fields are incomplete.
- Search yields no results or an excessively broad query.

## Manual QA checklist
- Test at narrow mobile width, tablet width, and desktop width.
- Navigate core journeys using keyboard only.
- Check visible focus, labels, headings, contrast, and meaningful screen-reader names.
- Verify deadline display with the user timezone and source timezone rules.
- Verify external links and source labels.
- Confirm loading, empty, success, validation, unauthorized, and server-error states.
- Confirm no private note appears in public/admin list responses unintentionally.

## Suggested release gates
- All P0 acceptance criteria pass.
- No unresolved critical/high security or data-integrity bugs.
- No known route where a student can access another student's private records.
- Reminder tests prove idempotency and deadline-change behavior.
- Admin CRUD and report workflow tested with a non-production account.
- A database backup and restore test succeeds.
- Deployment README and environment variable list are complete.

## Quality metrics to capture during pilot
- Failure rate for catalogue/dashboard requests.
- p95 response times for search, opportunity detail, and dashboard.
- Reminder delivery failures and duplicate notification count (target: zero duplicates per dedupe key).
- Number and age of listings in “needs review”.
- User reports per active listing and median report resolution time.
- Usability observations for find → evaluate → save → track flow.
