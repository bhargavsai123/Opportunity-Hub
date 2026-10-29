# Data Model and Database Rules

This is a conceptual model for MongoDB. Exact Mongoose schemas/collections can change during implementation, but the invariants below should remain.

## 1. User

Example fields:

```json
{
  "_id": "ObjectId",
  "email": "student@example.com",
  "passwordHash": "...",
  "role": "student",
  "displayName": "Student",
  "profile": {
    "educationLevel": "Undergraduate",
    "discipline": "Computer Science",
    "graduationYear": 2028,
    "interests": ["AI/ML", "Hackathons"],
    "preferredLocation": null,
    "preferredModes": ["Online", "Hybrid"]
  },
  "preferences": {
    "timeZone": "Asia/Kolkata",
    "inAppReminders": true,
    "emailReminders": false,
    "reminderLeadDays": [7, 3, 1]
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

Rules:
- Store email in a normalized form and enforce uniqueness with a unique index.
- Never return `passwordHash` in API responses.
- Role defaults to `student`; only a secure admin bootstrap/administrative operation can grant `admin`.
- Treat location as optional and collect no more precision than needed.

## 2. Opportunity

```json
{
  "_id": "ObjectId",
  "title": "Example opportunity",
  "type": "Internship",
  "organization": "Example organization",
  "summary": "Short summary",
  "eligibilityCriteria": [
    {
      "criterionId": "stable-criterion-id",
      "category": "Education",
      "label": "Currently enrolled in an undergraduate program",
      "details": "Confirm with the official source.",
      "importance": "Required"
    }
  ],
  "deadlineAt": "ISODate or null",
  "deadlineState": "Known",
  "applicationUrl": "https://example.org/apply",
  "sourceUrl": "https://example.org/official-details",
  "tags": ["AI/ML", "Internship"],
  "targetEducationLevels": ["Undergraduate"],
  "mode": "Online",
  "location": null,
  "benefits": ["Stipend stated by source"],
  "status": "Published",
  "verifiedAt": "ISODate or null",
  "verifiedBy": "ObjectId or null",
  "createdBy": "ObjectId",
  "updatedBy": "ObjectId",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

Rules:
- `deadlineState` distinguishes known deadline, not specified, rolling, and closed. It must agree with `deadlineAt` business rules.
- Never infer a deadline from publication date or prior-year listing.
- Stable `criterionId` values allow the app to preserve checklist responses when criteria are unchanged.
- `verifiedAt` is set only after someone checks the external source.
- Normalize duplicate-check fields without changing the original title or URLs shown to users.

## 3. TrackingRecord

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "opportunityId": "ObjectId",
  "isSaved": true,
  "status": "Planning",
  "note": "Private student note",
  "updatedAt": "ISODate",
  "createdAt": "ISODate"
}
```

Rules:
- Unique compound index on `{ userId, opportunityId }`.
- `note` is private and never included in public opportunity API responses.
- Deleting/untracking a record should have a clearly defined effect on reminders and checklist history.
- Student tracking history should survive listing archive/expiry; deleted opportunity handling needs a soft-delete/archive strategy.

## 4. EligibilityResponse

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "opportunityId": "ObjectId",
  "criterionId": "stable-criterion-id",
  "answer": "Unsure",
  "updatedAt": "ISODate"
}
```

A combined document containing all answers per user/opportunity is also reasonable if it supports atomic updates. Prevent duplicate answers for one criterion and verify ownership and criterion membership. Store a criteria revision or last-seen update marker if needed to alert users when criteria change.

## 5. Notification and reminder ledger

Notification fields: user, opportunity, type, title/body or template key, deadline snapshot, `readAt`, `createdAt`.

Reminder ledger fields: stable `dedupeKey`, user, opportunity, deadline snapshot/version, lead-days, `scheduledFor`, status (`Pending`, `Processing`, `Sent`, `Failed`, `Cancelled`), attempt count, last error code (not secret values), sent timestamp.

Rules:
- Enforce uniqueness on `dedupeKey`.
- Claim/process due work atomically where supported.
- Avoid storing full email bodies containing private notes.
- A deadline change cancels/reconciles reminder events based on the old deadline.

## 6. IssueReport

Fields: opportunity ID, reporter user ID when authenticated (nullable if anonymous reporting is permitted), issue type, message, state (`Open`, `InReview`, `Resolved`, `Dismissed`), admin disposition note, timestamps, resolver ID.

Rules:
- Reports and reporter identities are not public.
- Apply rate limits and input length limits.
- Do not store unnecessary sensitive information in free-text report fields.

## Index plan

Initial candidate indexes:
- `users.email`: unique.
- `opportunities.status + deadlineAt` and `opportunities.status + type + deadlineAt` for common listing queries.
- `opportunities.tags`, `targetEducationLevels`, depending on query shape.
- `trackingRecords.userId + opportunityId`: unique.
- `eligibilityResponses.userId + opportunityId + criterionId`: unique if individual responses are separate documents.
- `reminderLedger.dedupeKey`: unique.
- `notifications.userId + createdAt` for paginated notification reads.
- `issueReports.state + createdAt` for admin queues.

Validate query plans against representative data. Indexes consume storage and write time, so do not add every candidate blindly.

## Retention and deletion decisions

Before public launch, decide what happens to tracking/checklist records when a user deletes their account, how long issue reports and delivery logs remain, and how soft-deleted opportunities remain resolvable from student history. Implement one policy consistently and document it in the privacy notice.
