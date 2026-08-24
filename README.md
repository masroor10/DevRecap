# DevRecap

A "GitHub Wrapped" — an animated, story-style year-in-review for any public GitHub profile.

## Stack

- **Frontend:** Angular 19 (standalone components, signals) — `frontend/`
- **Backend:** Node.js + Express + TypeScript — `backend/`
- **Database:** Postgres (Neon free tier) — caches GitHub API responses for 6 hours per user

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — a Neon Postgres connection string. Create a free project at [neon.tech](https://neon.tech), copy the connection string (includes `?sslmode=require`).
- `GITHUB_TOKEN` — a GitHub personal access token (classic, no scopes needed since only public data is read). Create one at github.com → Settings → Developer settings → Personal access tokens.

```bash
npm run dev
```

API runs on `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App runs on `http://localhost:4200`.

## Deployment (free tier)

- **Backend:** Render (Web Service, free tier). Set the same env vars (`DATABASE_URL`, `GITHUB_TOKEN`, `FRONTEND_ORIGIN`) in Render's dashboard. Note: free tier spins down when idle (~30-50s cold start).
- **Frontend:** Vercel or Netlify, pointed at `frontend/`. Update `src/environments/environment.prod.ts` with the deployed Render API URL before building.
- **Database:** Neon free tier Postgres (already used in dev).

## How it works

1. User enters a GitHub username on the home screen.
2. Backend checks `recap_cache` in Postgres; if fresh (<6h old), returns cached data.
3. Otherwise calls GitHub's GraphQL API (contribution calendar, commit stats) with a server-side PAT, computes derived stats (longest streak, busiest month, top language, most active/starred repo), caches the result, and returns it.
4. Frontend renders the recap as full-screen animated "story" slides (Instagram-Stories-style), one stat per slide, with auto-advance, tap-to-navigate, and a share button on the last slide.
