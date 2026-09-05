# Backend — TaskSphere API

Node 20 + Express + Prisma + PostgreSQL API for TaskSphere.

## Stack

- **Node 20** with `ts-node-dev` for local dev
- **Express 4** with helmet, cors, express-rate-limit, pino-http
- **Prisma 5** ORM over PostgreSQL (Neon)
- **JWT** (jsonwebtoken) for access + refresh tokens
- **Argon2id** for password hashing
- **Nodemailer** for transactional email
- **Cloudinary** for image uploads
- **Socket.IO** for real-time chat
- **Zod** for request validation
- **Jest + Supertest** for tests

## Layout

```
src/
├── app.ts                 Express app wiring
├── server.ts              HTTP + Socket.IO entry point
├── config.ts              Env loader
├── db.ts                  Prisma client + withRetry
├── errors.ts              Typed HTTP errors
├── logger.ts              Pino logger
├── middleware/            auth, validate, error, rate-limit
├── routes/                auth, profile, public, categories, tasks,
│                          offers, messages, notifications, reviews,
│                          trust, admin, recommendations, uploads,
│                          googleAuth
├── services/              business logic (auth, profile, task, message,
│                          email, cloudinary, kyc, kycRules, …)
├── domain/                state machines, risk rules
└── utils/                 password, jwt, tokens
```

## Endpoints (high level)

| Group | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `/password/*`, `/verify/email/*`, `/verify/phone/*`, `/firebase`, `/kyc/*` |
| Profile | `GET /api/profile/me`, `PATCH /api/profile/me`, `PATCH /api/profile/me/avatar` |
| Tasks | `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`, `/publish`, `/cancel`, `/media` |
| Offers | `POST /api/tasks/:taskId/offers`, `/accept`, `/reject`, `/withdraw` |
| Messages | `GET/POST /api/conversations`, `/messages` |
| Reviews | `GET/POST /api/reviews` |
| Trust | `POST /api/kyc/submit`, `/dev-approve` |
| Uploads | `POST /api/uploads/:kind` (avatar, portfolio, task-media, message-attachment, kyc), `DELETE /api/uploads/:publicId`, `GET /api/uploads/config` |
| Public | `GET /api/public/stats`, `/api/categories` |
| Admin | `/api/admin/*` |
| Google OAuth | `GET /api/auth/google/start`, `/api/auth/google/callback` |

## KYC

Per-country rules in `src/services/kycRules.ts` — 11 countries with explicit rule sets, plus a sensible fallback. The verification flow is two-step:

1. `POST /api/auth/register` returns `signupStep: 'PROFILE'` and the user's `kycRequirements`.
2. The client routes to the KYC screen, where the user submits each `KycMode` (text, file, or OTP).
3. `POST /api/auth/kyc/submit` validates against the rule's pattern, stores a `KycSubmission`, and rolls up the user's `kycStatus`.
4. Once all required modes are `APPROVED`, `User.signupStep` flips to `COMPLETE` and the `requireKyc` middleware stops blocking.

## Dev quickstart

```bash
cp .env.example .env
npm install
npx prisma db push
npx prisma generate
npm run dev          # http://localhost:4000
```

## Testing

```bash
# All Jest tests
npm test

# End-to-end KYC smoke (needs backend running on :4000)
node ../kyc-smoke.js
```

## Deployment

`Dockerfile` and `render.yaml` are included. Render reads the Blueprint
and provisions Postgres + a Docker web service. See the root `README.md`
for the full deploy walkthrough.
