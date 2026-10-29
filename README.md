# Opportunity Hub — Simplified MERN Case Study

Opportunity Hub is a student-level Full Stack Web Development case study. It demonstrates the main MERN concepts through a small opportunity directory for scholarships, internships, hackathons, and competitions.

## Features

- Browse opportunity listings and search by title, organization, or keyword.
- Filter by opportunity category.
- View a listing's deadline, eligibility criteria, and official links.
- Register and sign in with an email and password.
- Students can save opportunities separately from applications. A listing appears in Applications only after a student clicks Apply.
- Admin accounts only see Discover and Manage listings; they do not have Saved or Applications pages.
- Online opportunity sync: fetch and upsert listings from public internship and hackathon APIs, with source attribution and duplicate prevention.
- Admin can refresh online feeds and edit/delete imported records; the UI does not require manual opportunity creation. The backend retains its POST endpoint for API/CRUD coursework.
- Responsive UI built with React and plain CSS.
- Express REST API and MongoDB/Mongoose data models.

Automated email reminders, advanced recommendation logic, student profile personalization, issue reporting/moderation, and complex dashboards are intentionally omitted from this case-study version.

## Tech stack

- Frontend: React, Vite, CSS, Lucide icons
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens and bcrypt password hashing

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Community running locally, or a MongoDB connection string

## Run locally

### 1. Configure and start the backend

Open a terminal in the project directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set `MONGODB_URI`, a long random `JWT_SECRET`, and the admin credentials `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Then run:

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:5000`. Health check: `http://localhost:5000/api/v1/health`. The backend starts an online feed sync in the background after connecting to MongoDB. Confirm catalogue data at `http://localhost:5000/api/v1/opportunities?limit=50`; the response should include a `data` array. Source APIs are online services, so a provider outage can delay imports without stopping the app.

### 2. Connect and start the frontend

The React app calls the Express API through a Vite development proxy. The browser requests `/api/v1/...` from the frontend origin, and Vite forwards those requests to `http://localhost:5000`, avoiding local CORS issues. Open a second terminal from the project root:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The `client/.env.example` default is `VITE_API_URL=/api/v1`; copy it to `client/.env` when configuring the frontend. Keep that value for local development. The proxy target is configured in `client/vite.config.js` as `http://localhost:5000`. If your backend runs at another host or port, update the proxy target and restart Vite. For a directly reachable deployed backend, set `VITE_API_URL` to its full API base URL ending in `/api/v1` instead.

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. Verify the backend independently at `http://localhost:5000/api/v1/health` before testing registration, login, tracking, and admin CRUD.

### 3. Online feeds

See [`ONLINE-OPPORTUNITY-FEEDS.md`](./ONLINE-OPPORTUNITY-FEEDS.md) for the connected public APIs, data mapping, attribution, and limitations. By default the backend fetches technology internships and hackathons automatically. For India-focused college hackathons and case competitions, optionally set `BRABBLE_API_KEY` in `server/.env`. This key must stay in the backend and must not be committed to Git.

No sample/demo opportunities are inserted automatically. If the database already contains old `Demo:` records from a previous project version, remove them from **Manage listings** or delete them manually in MongoDB Compass. Startup sync never deletes existing user records.

### 4. Admin access

Create an admin account via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` before starting the server. The backend creates this account if it does not already exist. Admin users can open **Manage listings** and use **Sync online opportunities** to import and refresh records from APIs. Edit/delete controls and optional manual create are available for corrections and for demonstrating CRUD.

If the backend cannot be reached, the page reports the API error rather than displaying fake frontend-only records.

## Project modules

See [`MODULES-AND-AUTHENTICATION.md`](./MODULES-AND-AUTHENTICATION.md) for the module breakdown, authentication workflow, role-based access control, and the main request flow.

## Useful endpoints

- `POST /api/v1/auth/register` and `POST /api/v1/auth/login`
- `GET /api/v1/opportunities` and `GET /api/v1/opportunities/:id`
- `GET /api/v1/opportunities/admin/all` (admin)
- `POST /api/v1/opportunities/sync` (admin; imports/refreshes online feeds)
- `POST /api/v1/opportunities`, `PATCH /api/v1/opportunities/:id`, `DELETE /api/v1/opportunities/:id` (admin)
- `GET /api/v1/me/tracking`, `PUT /api/v1/me/tracking/:id`, and `DELETE /api/v1/me/tracking/:id` (signed in)

## Build check

From the project root:

```bash
npm run build
```

Run this check after installing client dependencies. The backend also requires a working MongoDB service and environment variables to start.
