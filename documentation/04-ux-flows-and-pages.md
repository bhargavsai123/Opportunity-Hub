# UX Flows and Page Inventory

## UX principles

- Put deadline, opportunity type, and eligibility summary where they can be scanned quickly.
- Keep “Apply on official site” visibly separate from internal actions such as save and track.
- Explain why a listing is recommended; do not show a mysterious match score.
- Use meaningful words (“Deadline in 3 days”) and not color alone to express urgency.
- Avoid overloading a card with all eligibility text; show a short summary and provide a detail view.

## Information architecture

### Public / unauthenticated
- Landing page
- Opportunity directory
- Opportunity detail
- Login
- Registration
- Privacy and terms pages (content required before public launch)

### Student / authenticated
- Dashboard
- Browse opportunities
- Opportunity detail and eligibility checklist
- Saved opportunities
- My applications / tracking list
- Profile and interests
- Reminder preferences
- Notifications / reported issues history (optional MVP detail)

### Admin
- Admin overview
- Listings table with search and status filters
- Create/edit opportunity form
- Preview/publish flow
- Issue report queue
- Listing change/verification details

## Main user flows

### Flow A: First visit to first saved opportunity
1. Student lands on catalogue or homepage.
2. Student searches or browses by type/interests.
3. Student opens a detail page and scans the eligibility, deadline, source, and verification details.
4. Student registers or signs in when attempting to save/track/checklist persistence.
5. Student completes profile basics and returns to the listing.
6. Student saves it and begins marking checklist items.
7. Dashboard shows the saved opportunity and any known upcoming deadline.

### Flow B: Personalized discovery
1. Student opens profile settings and selects education level and interest tags.
2. Directory highlights matches and explains the match (e.g. “Matches your interest: AI/ML”).
3. Student uses filters to further narrow results.
4. Student can reset personalization/filter settings at any time.

### Flow C: Deadline follow-through
1. Student saves or tracks an opportunity and selects a status.
2. Dashboard lists known upcoming deadlines in chronological order.
3. Reminder preferences show available lead times and delivery options.
4. A reminder appears in-app; email is sent only when enabled and configured.
5. Student opens the opportunity, updates status, or marks it no longer relevant.

### Flow D: Admin publishes an opportunity
1. Admin opens listing management and chooses “Create”.
2. Admin enters content, criteria, links, and deadline state.
3. Form validates required fields and flags likely duplicates.
4. Admin saves as draft or previews.
5. Admin verifies the source and deadline, records verification, and publishes.
6. Listing appears in active discovery; reporting and expiry workflows remain available.

### Flow E: Outdated listing report
1. Student selects “Report an issue” on a listing.
2. Student chooses issue type (expired, incorrect deadline, broken link, eligibility mismatch, other) and optional note.
3. Confirmation appears; the report is visible only to authorized admins.
4. Admin reviews and either corrects, archives, requests more information (future), or dismisses the report.

## Page-level requirements

| Page | Primary purpose | Primary action | Key content/states |
|---|---|---|---|
| Landing | Explain value and start discovery | Browse opportunities | Clear CTA, search entry, categories |
| Directory | Find listings | Open detail / save | Search, filters, sort, pagination, loading/empty/error states |
| Opportunity detail | Evaluate opportunity | Apply externally / save / track | Deadline, source, criteria, checklist, freshness, external link warning |
| Login/register | Account access | Authenticate | Field validation, generic auth errors, password guidance |
| Onboarding/profile | Personalize relevance | Save profile | Education stage, interests, optional fields, skip/continue path |
| Dashboard | Organize next steps | Open/track/act | Upcoming deadlines, saved items, status summaries, reminder settings |
| Saved list | Revisit opportunities | Update status/remove | Search/filter, preserved history, empty state |
| Profile settings | Maintain preferences | Save changes | Interests, education, timezone, reminder defaults |
| Admin list | Maintain catalogue | Create/edit/review | Status filters, verification age, duplicate warning |
| Admin form | Create trusted content | Save draft/publish | Criteria editor, links, deadline state, preview, validation messages |
| Reports queue | Resolve data issues | Resolve/update/archive | Issue type, submission date, listing, state, disposition note |

## Eligibility checklist UX

Each criterion has a concise label and optionally a short explanation or source quote entered by a curator. The student chooses one of three states:
- **Meets** — based on the information currently available to the student.
- **Does not meet** — appears not to satisfy the stated requirement.
- **Not sure / needs checking** — requirement needs further review or the student lacks information.

Do not compute a definitive “eligible/ineligible” badge. If the product displays a summary, use wording such as “2 criteria need checking” or “Review one criterion you marked as not met.” Always include a reminder to confirm with the official opportunity source.

## Accessibility notes
- Support keyboard-only usage for filters, checklist states, modals, and admin forms.
- Every form control has a persistent label; placeholder text is not the only label.
- Focus remains managed when dialogs open/close.
- Provide text equivalents for urgency/color cues.
- Use semantic headings and skip-to-content navigation.
- Respect reduced motion preferences and do not rely on animation for meaning.

## UX questions for validation
- Should public browsing remain available without registration after the first pilot?
- Does a student expect reminders for all saved opportunities or only ones explicitly marked for tracking?
- Is “Application status” clearer than “My applications” for students who have not submitted anything yet?
