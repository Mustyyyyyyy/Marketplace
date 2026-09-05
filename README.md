# TaskSphere — Global Task Marketplace

A complete monorepo with a Node/TypeScript backend, an Expo (React Native) mobile app, and a Next.js 14 web app. All three connect to the same live backend, share one Postgres database, and offer the same feature set: country-aware KYC, country-specific verification rules, real-time chat, payments, and Cloudinary-backed image uploads.

```
backend/    Node + Express + Prisma + PostgreSQL (Neon) + Socket.IO
web/        Next.js 14 + Tailwind + Material Symbols
mobile/     Expo SDK 51 + React Native + Socket.IO client
```

## ✨ What's in the box

- **🔐 Country-aware KYC.** Step 1 of signup is your profile; step 2 is a verification screen whose rules depend on your country. Nigeria users submit NIN + BVN, US users submit SSN/ITIN + ID, UK users submit NINO, EU users submit their local tax ID, and there's a sensible fallback for everywhere else. 11 countries ship with explicit rules; everything else gets the standard document + selfie + sanctions flow.
- **⚡ Fast dashboard.** Web and mobile both pre-warm `/me` in the background while the dashboard renders, so the first paint shows real data instead of spinners. Tokens are cached, KYC is enforced server-side, and Google sign-in has a fallback path that works without a Firebase client SDK.
- **🖼️ Image uploads** via Cloudinary (avatars, portfolio, task media, chat attachments, KYC documents). Drag/drop on web, `expo-image-picker` on mobile.
- **💬 Real-time chat** with Socket.IO + email notifications, with a polling fallback for serverless deployments.
- **📱 Mobile deep links** for password reset and OAuth callbacks.
- **🚀 One-click deploy** with Vercel for the web, Render Blueprint for the backend.

## Quick start

### 1. Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, SMTP, Cloudinary, etc.
npm install
npx prisma db push            # apply schema to your Postgres
npx prisma generate
npm run dev                   # http://localhost:4000
```

### 2. Web
```bash
cd web
cp .env.example .env.local    # fill in BACKEND_INTERNAL_URL + NEXT_PUBLIC_API_BASE
npm install
npm run dev                   # http://localhost:3000
```

### 3. Mobile
```bash
cd mobile
npm install
npx expo start                # scan QR with Expo Go
```

The mobile `app.json` `extra.apiBaseUrl` defaults to `http://10.0.2.2:4000` (Android emulator → host) and `http://localhost:4000` for iOS / web. Edit `app.json` to point at a deployed backend.

## Environment variables

| Where | Variable | Purpose |
|---|---|---|
| **Backend** | `DATABASE_URL` | Postgres connection (Neon pooler recommended) |
| | `JWT_SECRET` | 64-char random string |
| | `PUBLIC_BASE_URL` | Frontend URL — used in email links |
| | `SMTP_*` | Gmail App Password works for ~500 emails/day |
| | `CLOUDINARY_*` | Image storage — get from cloudinary.com |
| | `FIREBASE_*` | Optional — for Firebase client SDK Google sign-in |
| | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional — backend Google OAuth flow (used if no Firebase web config) |
| | `ENABLE_DEV_ROUTES=1` | Dev only — exposes dev tokens + `/kyc/dev-approve` |
| **Web** | `NEXT_PUBLIC_API_BASE` | Public backend URL |
| | `BACKEND_INTERNAL_URL` | Vercel-internal URL (for server-side fetches) |
| **Mobile** | `app.json → extra.apiBaseUrl` | Backend URL baked into the build |

See [`backend/.env.example`](backend/.env.example) for the full annotated list.

## Google sign-in — two interchangeable paths

The web and mobile Google buttons auto-detect which path is configured:

1. **Firebase Client SDK** (default if `NEXT_PUBLIC_FIREBASE_API_KEY` + `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` are set). The browser/mobile app initialises Firebase, calls `signInWithPopup` / `signInWithRedirect`, then sends the ID token to the backend.
2. **Server-side Google OAuth 2.0** (used when only the backend has Google creds). The web/mobile button 302s to `/api/auth/google/start`, the user goes to Google, comes back to `/api/auth/google/callback?code=…`, the backend exchanges the code, signs our JWTs, and 302s to `<web>/auth/callback?access=…&refresh=…`. No Firebase client SDK needed.

For either path, the backend stores the user, links the `firebaseUid` (or `google:<sub>` for path 2), and issues our own access/refresh tokens.

## KYC — country-specific rules

The verification rules live in [`backend/src/services/kycRules.ts`](backend/src/services/kycRules.ts) and the rollup logic in [`backend/src/services/kycService.ts`](backend/src/services/kycService.ts). Per-country rules:

- **NG** — NIN (11 digits) + BVN (11 digits) for customers & taskers; taskers also need ID photo + selfie + address proof.
- **US** — SSN (last 4) or full ITIN; ID photo for both roles; taskers add selfie + address proof.
- **GB** — National Insurance Number (`QQ123456A`); ID photo for both roles; taskers add selfie + address proof.
- **IE** — PPS Number (`1234567A`).
- **DE** — Steuer-Identifikationsnummer (11 digits).
- **FR** — Numéro fiscal (13 digits).
- **NL** — BSN (9 digits).
- **ZA** — SA ID (13 digits).
- **KE** — KRA PIN (`A123456789A`).
- **GH** — Ghana Card (`GHA-XXXXXXXXX-X`).
- **IN** — PAN (`ABCDE1234F`).
- **Any other country** — falls back to ID document + selfie + sanctions check.

**All countries always require:** `EMAIL_OTP`, `PHONE_OTP`, `SANCTIONS_SCREEN`.

**Server-side enforcement:** the `requireKyc` middleware blocks `POST /api/tasks/*`, `POST /api/tasks/:id/offers`, and `POST /api/conversations/:id/messages` with `403 { code: 'KYC_REQUIRED', redirect: '/verify-identity' }` until `kycStatus === 'APPROVED'`.

**For local dev**, hit `POST /api/auth/kyc/dev-approve` (requires `ENABLE_DEV_ROUTES=1`) to fast-track approval and skip every check.

## Deploying to production

```
┌─────────────────────┐         ┌──────────────────────┐
│  Vercel (web)       │  /api/* │  Render / Railway /  │
│  Next.js 14         │ ───────▶│  Fly.io (backend)    │
│  tasksphere.app     │         │  api.tasksphere.app  │
└─────────────────────┘         └──────────────────────┘
                                       │
                                       ▼
                               ┌──────────────────┐
                               │  Neon PostgreSQL │
                               │  Cloudinary CDN  │
                               │  Resend / Gmail  │
                               └──────────────────┘
```

> **Why split?** Vercel is the best place to host a Next.js app, but its serverless functions don't support long-lived WebSocket connections — so the real-time chat (Socket.IO) needs a Node host for the backend. The web app talks to the backend through the `/api/backend/*` rewrite, which works the same in dev and in prod.

### Step 1 — Deploy the backend

The backend is a regular Node.js app, so any Node host works. Two of the easiest:

**Render (free tier available):**
1. Push the repo to GitHub.
2. On Render click **New +** → **Blueprint** and point it at this repo. Render reads `render.yaml` and provisions a Postgres database + a Docker web service automatically.
3. Fill in the secret env vars in the Render dashboard: `SMTP_USER`, `SMTP_PASS` (Gmail App Password), `CLOUDINARY_*`, `FIREBASE_*` (or `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
4. Once deployed, copy the URL — e.g. `https://tasksphere-api.onrender.com`. Use this as `BACKEND_URL` below.

**Fly.io / Railway:** any standard `node dist/server.js` host will work; just point it at the included `backend/Dockerfile`.

### Step 2 — Deploy the web app to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
2. The root `vercel.json` already tells Vercel this is a monorepo: it builds `web/` and rewrites `/api/backend/*` to your backend. **No need to set the Root Directory.**
3. Add the env var:
   - `NEXT_PUBLIC_API_BASE` = `https://tasksphere-api.onrender.com`
4. Open the deployed URL. Done.

#### What's in `vercel.json`?

| File | Purpose |
|---|---|
| `vercel.json` (root) | Vercel monorepo config: builds the `web/` sub-project and rewrites `/api/backend/*` to the backend. |
| `web/vercel.json` | Next.js-specific config: cache headers, security headers, image caching. |

#### Why the `/api/backend/*` rewrite?

The web app's API client always calls relative paths like `fetch('/api/backend/api/tasks')`. The Vercel rewrite forwards those to `https://api.YOUR-BACKEND-HOST.com/api/tasks`. In dev, `next.config.mjs` does the same forwarding to `http://localhost:4000`. This means **no environment-specific code** in the React components.

### Step 3 — Build the mobile app

```bash
cd mobile

# Preview build (no native compile)
npx expo start

# Production builds via EAS
npm install -g eas-cli
eas build:configure
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android
eas submit --platform ios
```

The mobile app reads the API base from `app.json` → `extra.apiBaseUrl`. Update that to `https://tasksphere-api.onrender.com` before shipping a production build.

## Verifying the deployment

```bash
# Backend health
curl https://tasksphere-api.onrender.com/health

# Public stats (no auth)
curl https://tasksphere-api.onrender.com/api/public/stats

# Country-aware KYC requirements
curl "https://tasksphere-api.onrender.com/api/auth/kyc/requirements?country=NG&role=CUSTOMER"

# Supported countries
curl https://tasksphere-api.onrender.com/api/auth/kyc/countries

# Web sign-in
open https://tasksphere-web.vercel.app/sign-in
```

## Known limitations

- **Vercel serverless can't host Socket.IO.** The chat falls back to polling on Vercel-deployed backends. For full real-time chat, deploy the backend to a host that supports persistent connections (Render, Fly.io, Railway, a VM, etc.). The included `render.yaml` works as-is.
- **Email:** Gmail App Passwords work great for ~500 emails/day. For higher volume, swap in [Resend](https://resend.com) or [Postmark](https://postmarkapp.com) — just change the SMTP env vars.
- **Vercel body limit:** 4.5 MB on the free plan for direct API routes. Image uploads go through Cloudinary's direct upload from the client, so the Vercel path is only used for the `POST /api/uploads/:kind` round-trip which is well under that limit.
- **Neon free tier pooler:** 5 connections per process. The `requireKyc` middleware and `withRetry` Prisma wrapper survive cold-pool disconnects; for high-traffic deploys, upgrade to Neon Pro.

## Tests

The repository ships with smoke tests for the most important flows:

- `backend/src/__tests__/` — Jest + Supertest (auth, tasks, offers, messages, KYC, uploads).
- `kyc-smoke.js` — end-to-end test for the country-aware KYC funnel: register → 403 on task create → submit each mode → APPROVED → task create 201.
- `country-test.js` — validates that all 8 country/role combos return the correct set of verification modes.

## License

[MIT](LICENSE)
