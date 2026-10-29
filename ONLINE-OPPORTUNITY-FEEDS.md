# Online opportunity feeds

Opportunity Hub now imports listings from public online APIs instead of relying on the admin to type every opportunity manually.

## How it works

- The backend starts normally and begins a non-blocking feed sync after connecting to MongoDB.
- An admin can open **Manage opportunities** and choose **Sync online opportunities** at any time. The normal workflow does not require manual listing creation; the admin screen is for refreshing, reviewing, editing, or removing imported entries.
- The backend normalizes the source records into the Opportunity Hub schema, saves them in MongoDB, and de-duplicates repeat syncs using source IDs and title/organization matches.
- The React app continues to read the catalogue through `GET /api/v1/opportunities`; student save/application tracking remains in the local application's database.
- Each imported listing shows its source and links users to the original listing/organizer.

## Sources

- **European Tech Opportunities** — public API for open technology internships: `https://techopportunities.eu/api/v1/opportunities?type=internship&page-size=50`.
- **Himalayas** — public remote jobs API queried for internships: `https://himalayas.app/jobs/api/search?employment_type=Intern&sort=recent&page=1`. Source attribution is shown in the app, and the apply link points to the original Himalayas posting.
- **Hackalendar** — public API for upcoming hackathon events: `https://hackalendar.com/api/events`.
- **Brabble.ai** — India-focused college hackathons/case competitions. This source requires a free API key. Generate a key on the provider's developer dashboard and set `BRABBLE_API_KEY` in `server/.env`. Do not put the key in React or commit it to Git.

The providers have different coverage. These default feeds primarily supply internships and hackathons; Brabble broadens Indian college hackathon/competition coverage when configured. They do not constitute a comprehensive scholarship API for India, so existing scholarship records remain available, but new scholarship listings will not be invented or mislabeled as live API results.

## API endpoint

`POST /api/v1/opportunities/sync` requires an authenticated admin JWT. It returns counts for new, updated, skipped, and total listings, with provider-level error details when a source is unavailable. Provider outages do not stop the backend from starting. The backend retains the existing create/update/delete REST endpoints for API/CRUD coursework, but the UI no longer offers routine manual creation; use the online sync as the standard way to populate the catalogue.

## Refresh frequency and accuracy

Use the admin sync button as needed; do not poll source APIs from every browser. Sync state is persisted in MongoDB to cache Tech Opportunities and Himalayas for 24 hours and Hackalendar/Brabble for one hour, reflecting their source refresh cadence. Some source APIs can be unavailable. Missing deadlines are intentionally left blank rather than guessed. Always open the original listing to confirm requirements, eligibility, location restrictions, and application status before applying.
