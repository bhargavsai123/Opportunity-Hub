# REST API Specification (MVP Draft)

**Base path:** `/api/v1`  
**Format:** JSON  
**Authentication:** authenticated endpoints use the selected secure browser session/token strategy.  
**Convention:** request validation occurs server-side; API responses must not expose stack traces or secrets.

## Response conventions

Success responses return a JSON object with resource data. Lists include pagination metadata. Errors should use a consistent shape such as:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields need attention.",
    "fields": { "title": "Title is required." },
    "requestId": "optional-request-id"
  }
}
```

Do not expose internal exceptions or sensitive authentication details. Dates are ISO 8601 timestamps; frontend renders them in the selected timezone.

## Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a student account |
| POST | `/auth/login` | Public, rate-limited | Authenticate |
| POST | `/auth/logout` | Authenticated | End session |
| GET | `/auth/me` | Authenticated | Return current user's safe profile summary |

Register request fields: `email`, `password`, and optional minimal display name. Server assigns the student role; public requests cannot assign admin role.

## Student profile and preferences

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/users/me` | Student | Fetch own profile |
| PATCH | `/users/me` | Student | Update own profile |
| GET | `/users/me/preferences` | Student | Get reminder/timezone preferences |
| PATCH | `/users/me/preferences` | Student | Update reminders, delivery options, timezone |
| DELETE | `/users/me` | Student | Request/delete own account according to approved retention policy |

Profile fields: `educationLevel`, optional `discipline`, optional `graduationYear`, `interests[]`, optional `preferredLocation`, `preferredModes[]`, and configured `timeZone`.

## Public opportunity catalogue

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/opportunities` | Public | Search/filter/sort published active listings |
| GET | `/opportunities/:id` | Public | Read one published opportunity |
| POST | `/opportunities/:id/report` | Public or authenticated per anti-abuse policy | Report issue with listing |

Recommended query parameters for `GET /opportunities`:
- `q` free-text query
- `type` one or multiple allowed opportunity types
- `interest` tag/category
- `educationLevel`
- `mode` and optional `location`
- `deadlineFrom`, `deadlineTo`
- `sort=deadline|newest|updated|relevance`
- `page` and `limit` (server-enforced maximum)

Response shape example:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 }
}
```

Public responses must not include private admin notes, user tracking, unpublished fields, internal moderation discussion, or private contact information.

## Student tracking and saved opportunities

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/me/dashboard` | Student | Get deadline and status summaries |
| GET | `/me/tracking` | Student | List own tracked opportunities |
| PUT | `/me/tracking/:opportunityId` | Student | Upsert tracking record/status/note |
| DELETE | `/me/tracking/:opportunityId` | Student | Remove tracking record if allowed |
| GET | `/me/saved` | Student | List saved opportunities |
| PUT | `/me/saved/:opportunityId` | Student | Save idempotently |
| DELETE | `/me/saved/:opportunityId` | Student | Unsave idempotently |

Suggested tracking payload:

```json
{
  "status": "Planning",
  "note": "Prepare portfolio before submitting"
}
```

Allowed status values: `Interested`, `Planning`, `InProgress`, `Applied`, `Accepted`, `Rejected`, `Withdrawn`. Notes have a strict maximum length and are private to the student. A saved record may be stored in a unified tracking document with `isSaved`, as long as API behavior remains clear.

## Eligibility checklist

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/opportunities/:id/criteria` | Public | Read structured criteria for a published listing |
| GET | `/me/eligibility/:opportunityId` | Student | Read own checklist responses |
| PUT | `/me/eligibility/:opportunityId` | Student | Upsert own checklist responses |

Each response references a stable `criterionId` and a status from `Meets`, `DoesNotMeet`, `Unsure`. The API must verify that criterion IDs belong to the current opportunity. Criteria changes must not silently reinterpret old responses.

## Notifications

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/me/notifications` | Student | List notifications, paginated |
| PATCH | `/me/notifications/:id` | Student | Mark own notification read |
| PATCH | `/me/notifications/read-all` | Student | Mark all own notifications read |

## Online opportunity feeds (implemented)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/opportunities/sync` | Admin | Fetch supported external feeds, normalize records, de-duplicate, and upsert into MongoDB |

The backend also starts one non-blocking synchronization after MongoDB connects. Feed failures are reported per source; they do not stop the server. Imported records retain `externalSource`, `externalId`, `sourceName`, and `updatedFromOnlineAt` for traceability. Public cards show source attribution and link to the original listing.

## Admin opportunity management

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/admin/opportunities` | Admin | List all lifecycle states |
| POST | `/admin/opportunities` | Admin | Create draft |
| GET | `/admin/opportunities/:id` | Admin | Read admin listing record |
| PATCH | `/admin/opportunities/:id` | Admin | Update fields |
| POST | `/admin/opportunities/:id/publish` | Admin | Validate and publish |
| POST | `/admin/opportunities/:id/archive` | Admin | Archive listing |
| POST | `/admin/opportunities/:id/verify` | Admin | Record that source was checked |
| GET | `/admin/reports` | Admin | List submitted issue reports |
| PATCH | `/admin/reports/:id` | Admin | Update report disposition |

Never trust frontend-only admin route guards. Every admin endpoint must verify the server-side role and record appropriate audit fields.

## Opportunity data contract

Core fields:
- `title`, `slug` or stable identifier, `type`, `organization`, `summary`.
- `eligibilityCriteria[]` with stable IDs, category, label, details, required/informational flag.
- `deadlineAt` nullable, `deadlineState` (`Known`, `NotSpecified`, `Rolling`, `Closed`).
- `applicationUrl`, `sourceUrl`, optional `mode`, `location`, `benefits`, `tags[]`, `targetEducationLevels[]`.
- `status` (`Draft`, `Published`, `NeedsReview`, `Expired`, `Archived`).
- `verifiedAt`, `verifiedBy`, `createdBy`, `updatedBy`, timestamps. Online imports also use `externalSource`, `externalId`, `sourceName`, and `updatedFromOnlineAt`.

## HTTP status guidance

- `200` success; `201` created; `204` successful no-content deletion when appropriate.
- `400` malformed input; `401` unauthenticated; `403` authenticated but unauthorized; `404` missing/not accessible resource; `409` duplicate/conflict; `422` valid JSON but invalid business rules; `429` rate limit; `500` generic unexpected server failure.

## API implementation checklist

- Validate all query parameters and body payloads.
- Limit page size, string length, note length, and array sizes.
- Normalize and validate URLs; allow only `https:` and, where intentionally supported, `http:` with safe external-link handling.
- Avoid unrestricted user-provided MongoDB query operators.
- Enforce ownership in query predicates, not only after fetching a record.
- Apply rate limits to auth, reporting, and other abuse-prone endpoints.
- Add tests for unauthorized roles, cross-user access, malformed filters, and expired/unpublished listings.
