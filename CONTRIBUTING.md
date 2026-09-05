# Contributing to TaskSphere

Thanks for your interest in improving TaskSphere! This is a multi-package
monorepo (backend, web, mobile) and we welcome pull requests, bug reports,
and feature ideas.

## Repo layout

```
.
├── backend/      Node 20 + Express + Prisma + Postgres API
├── web/          Next.js 14 marketing site + dashboard
├── mobile/       React Native (Expo) app
├── vercel.json   Vercel monorepo build config
├── render.yaml   Render Blueprint for the backend
└── README.md     You are here
```

## Local development

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

The mobile `app.json` `extra.apiBaseUrl` points to the backend. On Android
emulator the default is `http://10.0.2.2:4000` (host machine). On iOS sim
and web, `http://localhost:4000`.

## Code style

- **TypeScript everywhere.** `tsc --noEmit` is the source of truth.
- **No comments unless absolutely necessary** (the code should speak for
  itself; new comments must be justified in the PR description).
- **Match existing conventions.** Look at neighbouring files before you
  start — naming, imports, exports, error handling.
- **Small PRs.** One concern per PR. Reformat-only PRs are discouraged.

## Before opening a PR

- [ ] Run `npm run lint` (if defined) and `npx tsc --noEmit` in any
      package you touched.
- [ ] Add a test or run the existing smoke tests in `C:\Users\HP\Desktop\kyc-smoke.js`
      style if you changed the API.
- [ ] Update `.env.example` if you added a new environment variable.
- [ ] Don't commit `.env`, `node_modules/`, or generated Prisma clients.

## Reporting bugs

Please include:
- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS / device (for mobile)
- Screenshots if relevant
- Logs / stack traces

## Security

If you discover a security issue, **don't open a public issue** — email
security@tasksphere.app instead.

## Code of conduct

Be kind. Assume good intent. Critique ideas, not people.
