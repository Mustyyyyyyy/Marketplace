# Deploying to Vercel

Quick reference for hosting the **web** + **backend** on Vercel. We deploy
both as separate Vercel projects pointing at different sub-folders of the
same repo. They share a `*.vercel.app` prefix.

## Live URLs

| App | URL |
|---|---|
| Web (Next.js) | `https://marketplace-khaki-ten.vercel.app` |
| Backend (Express, as Vercel Functions) | `https://marketplace-api.vercel.app` |

> If your backend project's URL is different (Vercel sometimes appends a
> random suffix), replace `marketplace-api.vercel.app` everywhere it
> appears in this repo: `web/vercel.json`, `web/next.config.mjs`,
> `web/.env.example`.

## One-time setup (per project)

You will create **two Vercel projects** from the same GitHub repo:

1. **Web project** — `vercel.json` at the repo root sets
   `"rootDirectory": "web"`, so just import the repo and Vercel builds
   the Next.js app.
2. **Backend project** — in Project Settings → General → Root Directory
   set it to `backend`. Vercel runs the Express app as a Serverless
   Function (see `backend/vercel.json`).

## Critical: set the Root Directory

If Vercel is building from the monorepo root, you'll get `Error: spawn
npm ENOENT` or a 404. The fix is the same as before:

1. Project → **Settings** → **General** → **Root Directory**.
2. For the web project, set to `web`.
3. For the backend project, set to `backend`.

The root `vercel.json` already sets `rootDirectory: "web"` so the web
project just works on the next push.

## Why two `vercel.json` files?

| File | Purpose |
|---|---|
| `vercel.json` (root) | Pins the web project's Root Directory to `web`. |
| `web/vercel.json` | Rewrites `/api/backend/*` to the backend's Vercel URL. |
| `backend/vercel.json` | Tells Vercel to run the Express app as a Serverless Function. |

## Web environment variables

Set these in **Settings → Environment Variables** for the **web** project:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://marketplace-api.vercel.app` |
| `BACKEND_INTERNAL_URL` | same |

Firebase web config (optional, for the Firebase Client SDK path):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | from Firebase console |

If you leave these blank, the Google button falls back to the backend's
server-side OAuth flow (set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
on the backend).

## Backend environment variables

Set these in the **backend** project's env. See `backend/.env.example`
for the full list. Required:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooler URL |
| `DIRECT_URL` | Neon direct URL (for migrations) |
| `JWT_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | long random string |
| `CORS_ORIGINS` | `https://marketplace-khaki-ten.vercel.app` |
| `FRONTEND_URL` | `https://marketplace-khaki-ten.vercel.app` |
| `MOBILE_SCHEME` | `marketplace` |
| `APP_BASE_URL` | `https://marketplace-khaki-ten.vercel.app` |
| `ENABLE_DEV_ROUTES` | `0` in prod |
| `PORT` | `4000` (Vercel ignores this) |

## Custom domain

1. **Settings → Domains** → add your domain.
2. Update `NEXT_PUBLIC_API_BASE` env var.
3. Update `CORS_ORIGINS` on the backend to include the custom domain.

## Troubleshooting

### 404 on the web URL

Root Directory is wrong. Set it to `web` in the web project's settings.
The root `vercel.json` already does this for fresh imports, but the
existing project needs a manual fix.

### Build fails with `Error: spawn npm ENOENT`

Legacy `builds` system. Make sure the root `vercel.json` has no `builds`
array (it doesn't) and that the project's Root Directory = `web`.

### Build succeeds but `/api/backend/...` returns 404

`NEXT_PUBLIC_API_BASE` is wrong, or the backend project isn't deployed.
Hit `https://marketplace-api.vercel.app/health` directly to verify.

### `Can't reach database server` on SSR

The Neon pooler is throttling. Either upgrade Neon or reduce SSR fetches.
