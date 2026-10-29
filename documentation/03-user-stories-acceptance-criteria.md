# User Stories and Acceptance Criteria

Stories use “As a … I want … so that …”. Acceptance criteria are written in observable terms; they should become automated tests where practical.

## Epic A — Account and profile

### US-001: Register
As a student, I want to create an account so that I can personalize my dashboard.
- Given a valid unused email and a strong valid password, when I submit registration, then an account is created and I receive a clear next step.
- Given an email already registered, when I submit, then no duplicate account is created and the error does not expose sensitive account details unnecessarily.
- Invalid input is rejected server-side as well as client-side.

### US-002: Sign in and sign out
As a student, I want secure account access so that my saved items and notes remain private.
- Correct credentials establish an authenticated session.
- Incorrect credentials return a generic authentication error.
- Logout invalidates or clears the session/token according to the chosen session strategy.
- Protected API routes reject missing, invalid, or expired credentials.

### US-003: Personalize profile
As a student, I want to select my education level and interests so that the catalogue highlights relevant listings.
- Profile fields include education level and interests; branch, graduation year, and location are optional or conditional where appropriate.
- The profile can be edited and the updated values affect relevance hints.
- Empty optional fields do not break catalogue queries.

## Epic B — Discover opportunities

### US-010: Browse and search
As a student, I want to search opportunities so that I can find relevant listings quickly.
- The catalogue supports query text across title, organization, summary, and tags.
- Results are paginated; server-side limits prevent unbounded result sets.
- Empty results show a useful empty state and a way to clear filters.

### US-011: Filter and sort
As a student, I want filters for type, interest, education level, delivery mode/location, and deadline so that I can narrow results.
- Filters can be combined.
- Clearing one filter preserves the others.
- Sort options are stable and supported by the API.
- Expired, archived, draft, and unpublished records do not appear in the active public catalogue by default.

### US-012: Review a detail page
As a student, I want clear listing details so that I can decide whether to apply.
- Detail view shows summary, organization, criteria, deadline state, source URL, application URL, and verification/freshness information.
- If deadline is unknown, the UI says so rather than inventing a date.
- External links are clearly labeled and validated.

### US-013: Understand relevance
As a student, I want to see why a listing is highlighted so that I can trust personalized results.
- Matching hints identify the matched education level or interest tags.
- No match is not represented as proof of ineligibility.
- Relevance logic is deterministic and documented for MVP.

## Epic C — Eligibility checklist

### US-020: Complete checklist
As a student, I want to mark criteria as met, not met, or uncertain so that I can review requirements before applying.
- Each criterion supports all three states.
- Checklist answers are associated with both the student and opportunity.
- Returning to the listing restores answers.
- The page states that the checklist is guidance, not an official eligibility determination.

### US-021: Handle changed criteria
As a student, I want the app to handle criteria changes clearly so that old checklist answers are not mistaken for current guidance.
- When an admin changes or removes criteria, the UI indicates the listing was updated.
- The implementation either maps unchanged criterion IDs or resets only affected answers; the chosen behavior is documented and tested.

## Epic D — Save and track

### US-030: Save an opportunity
As a student, I want to save a listing so that I can return to it later.
- Saving is idempotent; duplicate records are not created by repeated clicks.
- The saved list can be filtered/sorted and links back to the detail page.
- A student cannot access another student's saved records.

### US-031: Track application status
As a student, I want to set a status so that I can remember where I am in the application process.
- Supported statuses: Interested, Planning, In progress, Applied, Accepted, Rejected, Withdrawn.
- Status changes persist and display on the dashboard.
- If a listing expires, its application history remains accessible to the student.

### US-032: Add a private note
As a student, I want a short private note so that I can remember next steps.
- Notes are private to their owner and are never exposed in public listing responses or admin catalogue views.
- Notes have a reasonable length limit and are safely rendered as text.

## Epic E — Deadlines and reminders

### US-040: See dashboard deadlines
As a student, I want upcoming deadlines in one place so that I can prioritize applications.
- Dashboard sorts upcoming known deadlines by earliest first.
- Unknown deadlines are labeled and not mixed into chronological deadline order.
- Expired deadlines are marked clearly.

### US-041: Receive reminders
As a student, I want reminders before a tracked deadline so that I do not forget an opportunity.
- Only opted-in students with a relevant tracked/saved record receive reminders according to the product rule chosen for the MVP.
- Each lead-time reminder is sent at most once for a given deadline version.
- Reminder failure is logged and retried or surfaced without causing duplicate sends.
- Deadline updates invalidate pending notifications for the old date.

## Epic F — Admin curation and trust

### US-050: Create and publish a listing
As an admin, I want to create structured opportunity records so that students have consistent information.
- Drafts can be saved without being public.
- Publishing requires title, type, summary, eligibility data or an explicit “criteria not provided” state, source URL, application URL where available, and a deadline state.
- URLs must be syntactically valid and safe protocols only.
- Publishing records verification metadata based on an actual check, not automatically just because the admin saved the form.

### US-051: Update or archive a listing
As an admin, I want to update or archive opportunities so that the catalogue stays current.
- An archive/expiry action removes the item from active public discovery but preserves student tracking history.
- Updating a deadline recalculates reminder eligibility.
- The audit fields identify who changed the record and when.

### US-052: Review issue reports
As an admin, I want to review reports so that students can flag incorrect information.
- Reports can be triaged as open, in review, resolved, or dismissed.
- Resolving a report requires an action note or a recorded disposition.
- The reporting student is not shown to other students.

## Cross-cutting definition of done
- API validation and authorization tests are included.
- Loading, success, error, and empty states are implemented.
- Layout works at mobile and desktop widths.
- Interactive controls have labels, keyboard access, and visible focus.
- No secret values or private user notes are logged.
- Relevant product documentation and setup instructions are updated.
