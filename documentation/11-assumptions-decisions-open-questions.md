# Assumptions, Decisions, and Open Questions

## Working assumptions for planning

1. Opportunity Hub is a responsive web app, not a native mobile app.
2. MERN is a fixed implementation constraint.
3. Students can browse public published listings; account creation is required for personalization, saving, checklist persistence, and tracking.
4. Initial listings are manually curated by trusted admins; there is no automated scraping in MVP.
5. Student profiles contain only information needed for relevance hints and reminders.
6. Eligibility is self-assessed against published criteria; the product does not certify eligibility.
7. Dates are stored consistently and rendered in the student's chosen timezone.
8. In-app deadline reminders are a core MVP requirement; email depends on configured infrastructure and user opt-in.
9. The first pilot can begin with a small high-quality catalogue rather than comprehensive coverage.
10. Admins maintain data quality and respond to issue reports.

## Decisions to finalize before build

| Decision | Recommended default | Why it matters |
|---|---|---|
| Product name | Keep “Opportunity Hub” as placeholder | Avoid blocking docs; finalize before public branding |
| Language | TypeScript if team is comfortable; otherwise JavaScript with strict validation | Affects scaffold and type-sharing |
| Auth approach | Secure HttpOnly cookie/session strategy with CSRF review | Browser security and deployment alignment |
| Public browsing | Allow catalogue/detail pages without login | Reduces friction and improves sharing |
| Saved vs tracked | One tracking record per student/opportunity, with `isSaved` and status | Avoids inconsistent duplicate records |
| Reminder eligibility | Notify only for opportunities saved or explicitly tracked; define exact behavior before implementation | Avoid sending unexpected reminders |
| Reminder lead times | 7, 3, and 1 day before a known deadline, configurable per user | Useful defaults while keeping student control |
| Email | Optional; provider adapter with a development mock | Avoid coupling core features to email setup |
| Deadline timezone | Preserve source timezone if known; otherwise define a consistent product policy | Prevents reminders firing at the wrong time |
| Expired listings | Hide from active public discovery, preserve student history | Keeps catalogue clean without losing user context |
| Listing verification | Human check with timestamp | Supports trust and accountability |
| Account deletion | Delete or anonymize user data per documented retention policy | Required for privacy operations |

## Open questions for the project owner

These do not block the planning pack, but should be resolved before the affected feature is implemented.

1. Will the initial audience be one college, a region, or students broadly?
2. Which opportunity types are mandatory at launch beyond scholarships, internships, hackathons, and competitions?
3. Should anonymous users be allowed to submit issue reports, or only signed-in students?
4. Should deadline reminders apply to all saved opportunities, only tracked opportunities, or only those with reminders explicitly enabled per listing?
5. Is email delivery required for the first pilot, or is in-app-only acceptable initially?
6. Who will verify listings, and how often should aging listings move to “needs review”?
7. Will admins be one trusted internal team or multiple college/club curators?
8. Does the project need a formal privacy/legal review before public use?
9. What is the expected first-pilot catalogue size and user count?
10. What hosting, database, email, and domain budgets are available?

## Change log

- **Draft v1.0 — 27 October 2026:** initial planning assumptions and MVP boundaries documented before implementation.
