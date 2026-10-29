# Content Quality and Moderation Policy

## Purpose
Opportunity Hub helps students find and track external opportunities. The catalogue is only useful if records are clear, traceable, and current. This policy describes the minimum rules for adding and maintaining listings.

## Required listing fields
Before publishing, the curator should provide:
- Clear title and opportunity type.
- Organization or responsible entity.
- Short factual summary.
- Official source URL; application URL when different or available.
- Explicit deadline state: known date, not specified, rolling, or closed.
- Eligibility criteria as structured items when the source provides them, or an explicit statement that criteria were not specified in the source.
- Relevant target education levels/tags only when supported by source information.
- Verification timestamp and curator identity after checking the source.

## Accuracy rules
- Never invent an application deadline, stipend, scholarship amount, award, eligibility criterion, location, or benefit.
- Distinguish facts from curator notes.
- Prefer the official opportunity page over reposts or social summaries.
- If an official source is unavailable, broken, or ambiguous, keep the item in draft/needs-review state until resolved.
- Do not mark a listing verified merely because its URL is syntactically valid.
- For rolling or no-deadline opportunities, state that clearly; do not fabricate a deadline to support reminders.
- Retain original source details needed to re-check the opportunity.

## Freshness workflow

A configurable freshness rule should move or flag listings that have not been rechecked recently. The exact time window must be set by the project team. When an admin rechecks a record, update `verifiedAt`; if the details cannot be confirmed, mark it `NeedsReview` or archive it until corrected.

A freshness marker must never imply that the opportunity provider endorses Opportunity Hub. Suggested user-facing labels:
- “Source checked on [date]”
- “Needs review — details may have changed”
- “Deadline not listed by source”
- “Archived / no longer shown in active listings”

## Duplicate handling
Before publishing, compare normalized title, organization, source URL, and application URL. If likely duplicate, update the existing record unless the source clearly describes a distinct cohort or cycle. Preserve historical context when a new cycle is different, and avoid overwriting current records with stale prior-year details.

## Issue reports
Accepted report categories:
- Deadline is incorrect or has changed.
- Application/source link is broken or suspicious.
- Eligibility criteria appear inaccurate.
- Opportunity is closed or expired.
- Duplicate listing.
- Other content concern.

Admins should triage reports promptly according to the pilot's operational capacity. The interface should not promise a resolution time until an owner and service target are established. A report should result in one of: corrected listing, needs-review state, archived listing, or dismissed report with a disposition note.

## Restricted or unsuitable content
Do not publish content that is fraudulent, impersonates an organization, asks students to share account passwords, or appears to be a malicious credential-harvesting link. Suspend the listing pending review if authenticity is uncertain. Keep report text private and limit access to the moderation team.

## User-facing disclaimer
Opportunity Hub is an information and tracking service. Students must confirm the current terms, eligibility, deadlines, fees, and application steps with the official opportunity provider. A checklist or profile match is not an official eligibility determination.
