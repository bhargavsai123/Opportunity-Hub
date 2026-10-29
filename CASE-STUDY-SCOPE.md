# Case Study Scope — Opportunity Hub

## Problem
Students may miss scholarships, internships, hackathons, and competitions because details are spread across different sites.

## Proposed solution
A searchable web application that stores opportunity summaries, types, deadlines, eligibility criteria, and official application links in one place.

## User roles
- **Student:** browse, search, filter, inspect eligibility, save listings, and track application status.
- **Admin:** add, view, edit, and delete opportunity listings.

## Functional requirements
1. Display a list of opportunities from the database.
2. Search listings by title, organization, or keyword.
3. Filter listings by category.
4. Show opportunity details and eligibility criteria.
5. Allow a registered student to save a listing.
6. Allow a registered student to track application status.
7. Allow an admin to perform CRUD operations on opportunity listings.

## Non-functional requirements
- Simple, responsive user interface.
- Clear form validation and error messages.
- Passwords are hashed before being stored.
- Admin routes require authentication and admin authorization.
- Use environment variables for secrets and database connection settings.

## Scope intentionally removed for the academic demo
Automated email reminders, personalization/recommendation models, detailed student profiles, issue reporting, moderation queues, bulk imports, calendar integration, and production deployment automation.

## Acceptance checks
- The catalogue loads listings from the API when the backend is available.
- Search and category filter narrow the displayed results.
- Details show the deadline, source, application URL, and eligibility list.
- Signed-in students can save a real database listing and update its status.
- Admins can create, edit, and delete listings.
- The UI marks preview records as sample data rather than presenting them as real openings.
