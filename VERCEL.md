# Deploying to Vercel

Quick reference for hosting the **web** app on Vercel. The backend is hosted
on Render — see the root `README.md` for that side.

## One-time setup

1. **Import the repo** at [vercel.com/new](https://vercel.com/new).
2. After the import, Vercel will try to detect the framework. The first
   build will fail because Vercel is looking at the **monorepo root**.
   That's expected — follow the next step to fix it.

## Critical: set the Root Directory

1. In Vercel, open your project → **Settings** → **General**.
2. Scroll to **Root Directory** → click **Edit**.
3. Select `web` from the list, click **Save**.
4. Vercel will trigger a fresh build of just the Next.js app.

> ⚠️ If you skip this step, Vercel builds from the monorepo root and the
> build will fail with `Error: spawn npm ENOENT` or `Build machine configuration`.
> The legacy `builds` system tries to install `npm` globally and can't find it.

## Why two `vercel.json` files?

| File | Purpose |
|---|---|
| `vercel.json` (root) | Tiny shim — just `$schema`. Exists so Vercel detects the monorepo but doesn't try to use the legacy `builds` system. |
| `web/vercel.json` | The real config: rewrites `/api/backend/*` to the backend, plus security/cache headers. |

You should **never** need to add a `builds` array. The modern Vercel
project-settings + per-app `vercel.json` workflow handles everything.

## Environment variables

Set these in **Settings → Environment Variables** (apply to all branches):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://tasksphere-api.onrender.com` | Public URL of the backend. Browser uses this. |
| `BACKEND_INTERNAL_URL` | same | Vercel-internal. Only used for SSR fetches. |

Firebase web config (if you want the Firebase Client SDK path for Google sign-in):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | from Firebase console |

If you leave the Firebase web config blank, the Google button falls back
to the backend's server-side OAuth flow (configure `GOOGLE_CLIENT_ID` +
`GOOGLE_CLIENT_SECRET` on the backend).

## Build & output settings

Vercel auto-detects Next.js. Recommended overrides:

- **Framework Preset**: Next.js
- **Build Command**: `next build` (default)
- **Install Command**: `npm install` (default)
- **Output Directory**: `.next` (default)
- **Node.js Version**: 20.x

## Custom domain

1. **Settings → Domains** → add your domain.
2. Update `NEXT_PUBLIC_API_BASE` env var to the public backend URL
   (if the backend is on a different host).
3. Update the CORS allowlist on the backend to include your domain.

## Troubleshooting

### `Error: spawn npm ENOENT` on build

Vercel is using the legacy `builds` system. Fix:

1. **Settings → General → Root Directory = `web`**.
2. Make sure the root `vercel.json` has **no** `builds` array.
3. Redeploy.

### Build succeeds but the API calls 404

Your `NEXT_PUBLIC_API_BASE` env var is missing or set to the wrong URL.
Check the browser network tab — the request URL should be
`https://<your-app>.vercel.app/api/backend/api/...` and the Vercel
rewrite should forward it to `<NEXT_PUBLIC_API_BASE>/api/...`.

### `Can't reach database server` on a server-side render

This is the Neon pooler being throttled. The web app's SSR fetches
count against the same 5-connection cap as the backend. Either upgrade
Neon to Pro, or reduce the number of SSR fetches per page (most pages
fetch on the client only).
