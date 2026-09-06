# Deploying the monorepo to Vercel

The repository supports two Vercel projects: one for the backend and one for
the Next.js frontend. This is the recommended deployment because each project
has a clear Root Directory and its own `vercel.json`. Do not configure either
project with the repository-root install command.

## Vercel project settings

Create two Vercel projects from the same GitHub repository.

### Backend project

| Field | Value |
|---|---|
| Project name | `marketplace-backend` |
| Root Directory | `backend` |
| Framework Preset | Other |
| Install Command | `npm install && npm run prisma:generate` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Development Command | Leave blank |

`backend/vercel.json` supplies the serverless function and route rewrite.

### Frontend project

| Field | Value |
|---|---|
| Project name | `marketplace-web` |
| Root Directory | `web` |
| Framework Preset | Next.js |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Development Command | Leave blank |

`web/vercel.json` supplies security headers, while `web/next.config.mjs`
uses the backend environment variable for API rewrites.
4. Add the environment variables below for Production, Preview, and
   Development as appropriate.

Do not set `NODE_ENV=development` in Vercel. The configured production build
command explicitly sets `NODE_ENV=production`.

## Database migration

Migrations are intentionally not run during every Vercel build. Run them once
from a trusted shell using the same production `DATABASE_URL` configured in
Vercel:

```powershell
cd backend
$env:DATABASE_URL = "<production-postgres-connection-string>"
npm install
npm run prisma:deploy
```

Confirm the command reports that the migrations were applied before testing
payments. The Flutterwave webhook will not persist payment or payout status
until the payment tables exist.

The backend project should use Root Directory `backend` and expose `/health`.

## Required environment variables

Set these in the backend project:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon/Postgres pooler connection string |
| `JWT_SECRET` | Long random production secret |
| `PUBLIC_BASE_URL` | `https://marketplace-beryl-one.vercel.app` |
| `CORS_ORIGIN` | `https://marketplace-beryl-one.vercel.app` |
| `FLW_SECRET_KEY` | Flutterwave live secret key |
| `FLW_SECRET_HASH` | Flutterwave webhook verification hash |

For production authentication, uploads, email, and Google sign-in, also set
the corresponding values from [`backend/.env.example`](C:/Users/HP/Desktop/Marketplace.worktrees/vercel-build-output-directory-fix/backend/.env.example).

Set these in the frontend project:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Backend project URL, ending without `/` |
| `BACKEND_INTERNAL_URL` | Same backend project URL |

Do not add `NODE_ENV=development`. Vercel sets production mode for production
deployments.

## Verification

After deployment, check:

```text
https://marketplace-backend-sable.vercel.app/health
```

The expected response is JSON containing `"ok": true`.

Frontend requests use `/api/backend/...`; Next.js rewrites those requests to
the backend deployment while preserving the backend's `/api/...` route structure.

## Local development

Run the applications separately:

```powershell
cd backend
npm install
npm run prisma:generate
npm run dev
```

In another terminal:

```powershell
cd web
npm install
npm run dev
```

The web app proxies `/api/backend/*` to `http://localhost:4000` through
`web/next.config.mjs`.
