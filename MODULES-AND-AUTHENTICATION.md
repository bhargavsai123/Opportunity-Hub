# Opportunity Hub — Modules and Authentication

This document describes the modules used in the Full Stack Web Development case study.

## 1. Authentication module

**Purpose:** identify users before allowing account-specific actions.

- Registration: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Current session: `GET /api/v1/auth/me`
- Logout: the client removes the stored JWT token.
- Passwords are hashed with bcrypt before being stored.
- The API returns a JWT token after successful registration or login. The frontend sends it as `Authorization: Bearer <token>`.

## 2. Student opportunity discovery module

- Browse published opportunities.
- Search by title, organization, and keywords.
- Filter by Scholarship, Internship, Hackathon, or Competition.
- View deadline, eligibility criteria, and official/application links.

## 3. Saved opportunities module

- Signed-in students can save an opportunity.
- Saved items are associated with the signed-in user in MongoDB.

## 4. Application tracking module

- Students can record a status for each opportunity: Interested, Planning, In Progress, Applied, Accepted, Rejected, or Withdrawn.
- Tracking records belong to the authenticated user.

## 5. Admin opportunity management module

- Admins can create, list, edit, and delete opportunity records.
- Admin-only API routes check the user's role on the server. Hiding the admin page in the UI is not the only access control.
- Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` to create the initial admin account on server startup.

## 6. Database module

MongoDB collections are represented by Mongoose models:

- `User`: account details, password hash, and role.
- `Opportunity`: listing content, type, deadline, eligibility, and links.
- `TrackingRecord`: per-user saved state and application status.

## Main workflow

1. A visitor browses the opportunity catalogue.
2. The visitor registers or signs in to save an opportunity or track an application.
3. The frontend sends the JWT in the Authorization header for protected requests.
4. Express middleware validates the token and loads the user.
5. Admin-only routes additionally check the user's `admin` role.
6. Mongoose reads or updates the appropriate MongoDB records.

## Scope intentionally excluded

Email reminders, recommendation engines, social login, payment processing, analytics dashboards, and moderation workflows are outside the scope of this academic MVP.


## Role-specific navigation and application tracking

Student accounts can use Saved and Applications. Admin accounts only see Discover and Manage Listings. Saving a listing sets `isSaved` only and does not register an application. Clicking Apply as a signed-in student sets `hasApplied: true` and an initial status of `Applied`; the Applications page filters by `hasApplied`, not by the existence of any tracking record. Student tracking endpoints reject admin accounts.
