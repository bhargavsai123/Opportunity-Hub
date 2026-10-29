# Frontend ↔ Backend Connection

The React frontend connects to the Express API through the Vite dev-server proxy.

## Local development flow

```text
Browser (React / Vite :5173)
        │ fetch('/api/v1/...')
        ▼
Vite proxy (/api → http://localhost:5000)
        │
        ▼
Express REST API (:5000)
        │ Mongoose
        ▼
MongoDB (opportunity_hub)
```

## Where the connection is configured

- `client/src/main.jsx`: `API` uses `VITE_API_URL`, defaulting to `/api/v1`.
- `client/vite.config.js`: forwards `/api/*` requests to `http://localhost:5000` during development.
- `server/src/index.js`: mounts authentication, opportunities, and user/tracking routes under `/api/v1`.
- `server/.env`: configures MongoDB, port, JWT secret, and admin credentials.

## Test it

1. Start MongoDB.
2. Start the server from `server/` using `npm install` and `npm run dev`.
3. Open `http://localhost:5000/api/v1/health`; it should return JSON with `"status":"ok"`.
4. In a second terminal, start the frontend from `client/` using `npm install` and `npm run dev`.
5. Use registration/login and watch the browser's Network tab: frontend requests should go to `/api/v1/...` and return responses from Express.

The frontend falls back to clearly labeled sample opportunities if the API cannot be reached. Sample opportunities are not stored in MongoDB and cannot be saved or tracked; use the admin account to create actual listings after the backend and database are running.
