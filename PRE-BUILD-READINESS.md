# Case Study Readiness Checklist

Before presenting Opportunity Hub for the Full Stack Web Development subject:

- [ ] Install frontend and backend dependencies.
- [ ] Start MongoDB and configure `server/.env`.
- [ ] Start the API and confirm `http://localhost:5000/api/v1/health` returns an `ok` status.
- [ ] Start Vite and confirm the web page opens.
- [ ] Sign in as a student and test save/unsave and application status updates.
- [ ] Sign in as the configured admin and test create, edit, and delete listing actions.
- [ ] Add only verified opportunities for the live demonstration.
- [ ] Explain the stack: React frontend, Express REST API, Node.js runtime, MongoDB/Mongoose data layer, and JWT authentication.

**Known verification limit:** JSX and backend JavaScript syntax were checked in the delivered working environment, but the full Vite build could not be completed here because npm dependency installation timed out. Run `npm run build` after installing dependencies locally before the presentation.
