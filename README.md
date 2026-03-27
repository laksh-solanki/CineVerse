# Cineverse

Movie website with public browsing and a private admin panel.

- Frontend: Vue + Vuetify + Tailwind (JavaScript)
- Backend: Node + Express + MongoDB

## Public Pages

- Home
- Categories
- About
- Contact

## Private Admin Panel

- Path: `/admin-cineverse-control-9271`
- Not shown in navbar
- Login required
- Only authenticated admin can add movies

## Backend Setup

1. `cd backend`
2. Create `.env` from `.env.example`
3. Fill required values:
   - `MONGODB_URI` or `MONGODB_URL`
   - `MONGODB_DATABASE`
   - `MONGODB_COLLECTION`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_TOKEN_SECRET` (use a long random value)
4. Install/start:
   - `npm install`
   - `npm run dev`

Runs on:

- `http://127.0.0.1:4000`

## Frontend Setup

1. `cd frontend`
2. Install/start:
   - `npm install`
   - `npm run dev`

Runs on:

- `http://127.0.0.1:5173`

## API Endpoints

Public:

- `GET /api/health`
- `GET /api/movies?page=1&limit=8&search=...&category=...`
- `GET /api/categories`

Admin:

- `POST /api/admin/login`
- `GET /api/admin/session` (token required)
- `POST /api/admin/movies` (token required)

## Security Implemented

- CORS allowlist via `FRONTEND_ORIGIN`
- `helmet` security headers
- HMAC-signed admin token with expiry
- Timing-safe credential/signature checks
- Login rate limiting (5 attempts / 15 minutes per IP)
- Input validation on movie create API
