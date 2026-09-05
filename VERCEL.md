# Deploying the monorepo to Vercel

The repository can be deployed as **one Vercel project** from the repository
root. The project builds the Next.js app in `web/` and exposes the Express API
from `backend/` through same-domain serverless functions.

## Vercel project settings

1. Import this repository into Vercel.
2. Leave **Root Directory** set to the repository root (`.`).
3. Leave the framework preset unchanged. The root `vercel.json` supplies the
   install and build commands and disables unreliable framework auto-detection.
4. Add the environment variables below for Production, Preview, and
   Development as appropriate.

Do not set `NODE_ENV=development` in Vercel. The configured production build
command explicitly sets `NODE_ENV=production`.

The root configuration:

- installs dependencies in both `web/` and `backend/`;
- generates the Prisma client before the build;
- builds the Next.js app into `web/.next`;
- serves backend routes under `/api/backend/*` on the same deployment;
- exposes `/health` for deployment checks.

## Required environment variables

Set these in the single Vercel project:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon/Postgres pooler connection string |
| `JWT_SECRET` | Long random production secret |
| `PUBLIC_BASE_URL` | The deployed site URL, such as `https://your-project.vercel.app` |
| `CORS_ORIGIN` | The deployed site URL |

For production authentication, uploads, email, and Google sign-in, also set
the corresponding values from [`backend/.env.example`](C:/Users/HP/Desktop/Marketplace.worktrees/vercel-build-output-directory-fix/backend/.env.example).

The frontend API calls are same-origin in this setup, so
`NEXT_PUBLIC_API_BASE` and `BACKEND_INTERNAL_URL` are not required. If
`BACKEND_INTERNAL_URL` is set, it must point to this same deployment.

## Verification

After deployment, check:

```text
https://your-project.vercel.app/health
```

The expected response is JSON containing `"ok": true`.

Frontend requests use `/api/backend/...`; Vercel rewrites those requests to
the backend function while preserving the backend's `/api/...` route structure.

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
