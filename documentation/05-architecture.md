# System Architecture

## Architectural direction

Use a conventional MERN structure with the React client communicating with an Express REST API. Node.js hosts API routes and background deadline-reminder processing. MongoDB stores users, opportunities, per-user tracking/checklist data, notifications, and issue reports.

## Logical components

```text
Browser (React)
  ├─ Public catalogue and opportunity detail
  ├─ Student dashboard/profile/saved/tracking
  └─ Admin listing/report management
           │ HTTPS JSON API
           ▼
Node.js + Express API
  ├─ Authentication/session middleware
  ├─ Validation and authorization
  ├─ Opportunity service
  ├─ Online feed adapters (internships / hackathons / student contests)
  ├─ Feed sync + idempotent MongoDB upsert
  ├─ Student tracking/checklist service
  ├─ Reminder and notification service
  ├─ Admin moderation service
  └─ Structured logging/error handling
           │
           ▼
MongoDB
  ├─ users
  ├─ opportunities
  ├─ trackingRecords
  ├─ eligibilityResponses
  ├─ notifications / reminder ledger
  └─ issueReports

Scheduled worker / cron process
  ├─ Finds due reminder events
  ├─ Deduplicates by stable key
  ├─ Creates in-app notification
  └─ Sends email only when configured and opted in
```

## Suggested repository layout

```text
opportunity-hub/
  client/                 # React UI
    src/
      app/                # routes, layout, providers
      components/         # shared UI
      features/            # auth, opportunities, dashboard, profile, admin
      lib/                 # API client, formatters, helpers
  server/                 # Express API and worker
    src/
      config/              # environment config
      middleware/          # auth, validation, errors, rate limiting
      modules/
        auth/
        users/
        opportunities/
        tracking/
        eligibility/
        reminders/
        notifications/
        reports/
        admin/
      models/              # Mongoose models or equivalent data layer
      jobs/                # scheduled reminder job
      utils/
      app.js
      server.js
  docs/
  .env.example
  README.md
```

## API and service boundaries

- **Auth module:** sign-up, sign-in, sign-out/session handling, current user.
- **User module:** profile and reminder preferences; returns only the current user's private settings.
- **Opportunity module:** public published catalogue, filters/search, detail, admin CRUD and lifecycle actions.
- **Tracking module:** saves, status, notes, dashboard summaries.
- **Eligibility module:** structured criteria on listings and private user responses.
- **Reminder module:** deadline-derived reminder calculation, schedule reconciliation, deduplication, delivery attempts.
- **Notification module:** in-app notification list/read state.
- **Report module:** student issue submission and admin triage.

Modules may share a single Node.js deployment for MVP, but should keep responsibilities separate to avoid route handlers becoming business logic containers.

## Technology choices

- **Client:** React with a router, a consistent component system, and a centralized API client. Use TypeScript if the team can support it; otherwise apply strict linting and runtime validation.
- **Server:** Node.js + Express, REST/JSON, schema validation at request boundaries, consistent error format.
- **Database:** MongoDB with a schema/model layer (e.g. Mongoose) and explicit indexes.
- **Authentication:** choose one coherent cookie/session or short-lived access-token strategy; prefer HttpOnly, Secure, SameSite cookies for a browser app where compatible with deployment. Do not store long-lived secrets in localStorage.
- **Reminders:** begin with a scheduled worker plus a durable notification/reminder ledger. A cron library alone is not a durable queue; ensure database-backed idempotency and safe retries.
- **Email:** provider adapter behind an interface; development can use a mock/logging adapter.
- **Testing:** unit tests for business rules, API integration tests, and browser-level smoke tests for primary journeys.

The exact package versions should be selected from supported stable releases at implementation time and locked in the package manager lockfile.

## Online catalogue ingestion
1. At startup, after connecting to MongoDB, the API begins a non-blocking sync from configured public opportunity feeds.
2. An admin can request `POST /api/v1/opportunities/sync` to refresh the feed manually.
3. The source adapters normalize external records into one opportunity schema and retain source metadata.
4. Stable source identifiers and title/organization matching prevent repeat imports from creating duplicate records.
5. Source refresh state is cached in MongoDB to avoid repeated calls; source outages are reported without taking down the API, and the catalogue already saved in MongoDB remains available.

## Key data flows

### Catalogue request
1. Client sends search/filter/sort/page parameters.
2. API validates allowed filters and limits page size.
3. Query constrains results to published and active opportunities.
4. API returns only public fields and pagination metadata.

### Personalized dashboard
1. API authenticates the student.
2. Profile and the student's tracking records are loaded.
3. The service joins tracked opportunity summaries and current deadline/status information.
4. Response includes explanations for simple profile/tag matches and excludes private information belonging to others.

### Reminder processing
1. Scheduled worker identifies candidate tracking records with known future deadlines and eligible reminder settings.
2. It derives a unique key from user, opportunity, deadline version/date, and lead time.
3. The worker creates or claims a ledger record atomically.
4. It creates an in-app notification and attempts optional email delivery.
5. Attempts and outcomes are recorded; retry behavior must avoid duplicate notifications/emails.
6. Updating a deadline reconciles outstanding reminder records and prevents delivery based on stale deadlines.

## Search and indexes

At minimum, consider indexes for:
- Public opportunity status + deadline + type.
- Opportunity tags and target education levels.
- Normalized title/organization/source URL for duplicate warnings.
- Tracking records: user ID + opportunity ID with a unique compound index.
- Eligibility responses: user ID + opportunity ID + criterion ID as needed.
- Notifications/reminder ledger: user ID + due time + read/delivery status; unique reminder key.

Choose text search strategy after measuring the expected catalogue size: MongoDB text indexes may be sufficient for the MVP; a dedicated search engine is a later option, not a prerequisite.

## Deployment environments

- **Local:** client and API run locally; database can be local or a dedicated development database.
- **Preview/staging:** separate non-production database and secrets; test email provider/sandbox.
- **Production:** HTTPS, managed database with backups, controlled admin bootstrap, monitoring/logging, and a documented restore process.

Do not use production data in local development unless it is explicitly approved and sanitized.

## Architecture decisions to finalize before implementation

1. TypeScript vs JavaScript.
2. Cookie/session strategy and CSRF handling.
3. Hosting provider and deployment topology.
4. Email provider and sender-domain setup.
5. Whether reminder worker runs as a separate process or scheduled task in the API deployment.
6. Data deletion and retention behavior.
