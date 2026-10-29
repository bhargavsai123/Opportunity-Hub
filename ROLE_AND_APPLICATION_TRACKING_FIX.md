# Role and Application Tracking Update

## Role-based navigation
- Students see Discover, Saved, and Applications.
- Admins see Discover and Manage listings only.
- The API also rejects admin requests to student tracking endpoints.

## Save versus apply
- Saving an opportunity updates `isSaved` only.
- Browsing a listing or updating the eligibility checklist does not mark an application.
- When a signed-in student clicks Apply, the backend tracking record gets `hasApplied: true` and status `Applied` for a first-time application.
- The Applications page filters by `hasApplied`, so saved-only records do not appear there.
- Students can subsequently update status without removing the item from Applications.

## Existing tracking records
Older records with statuses Applied, Accepted, Rejected, or Withdrawn are treated as applications to retain existing application history. Older saved records with only Interested or Planning are not assumed to be applications; the student can click Apply to add them.
