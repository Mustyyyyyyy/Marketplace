# Deploying the monorepo to Vercel

The repository supports either one unified Vercel project or two Vercel
projects. The current production setup uses the backend deployment at
`https://marketplace-2wmu41owh-adebayos-projects-1eb7ca4e.vercel.app` and the
Next.js frontend from `web/`.

## Vercel project settings

1. Import this repository into Vercel.
2. Set **Root Directory** to `web` for the frontend project.
3. Use the **Next.js** framework preset. `web/vercel.json` supplies the
   backend rewrite and security headers.
4. Add the environment variables below for Production, Preview, and
   Development as appropriate.

Do not set `NODE_ENV=development` in Vercel. The configured production build
command explicitly sets `NODE_ENV=production`.

The backend project should use Root Directory `backend` and expose `/health`.

## Required environment variables

Set these in the single Vercel project:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon/Postgres pooler connection string |
| `JWT_SECRET` | Long random production secret |
| `PUBLIC_BASE_URL` | The frontend Vercel URL |
| `CORS_ORIGIN` | The frontend Vercel URL |

For production authentication, uploads, email, and Google sign-in, also set
the corresponding values from [`backend/.env.example`](C:/Users/HP/Desktop/Marketplace.worktrees/vercel-build-output-directory-fix/backend/.env.example).

Set `NEXT_PUBLIC_API_BASE` and `BACKEND_INTERNAL_URL` on the frontend project
to the backend URL above. The checked-in fallback also points there, but
environment variables are preferred for custom domains.

## Verification

After deployment, check:

```text
https://marketplace-2wmu41owh-adebayos-projects-1eb7ca4e.vercel.app/health
```

The expected response is JSON containing `"ok": true`.

Frontend requests use `/api/backend/...`; Vercel rewrites those requests to
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
