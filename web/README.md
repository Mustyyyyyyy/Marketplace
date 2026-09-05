# Web — TaskSphere

Next.js 14 marketing site + dashboard for TaskSphere.

## Stack

- **Next.js 14** (App Router) + React 18
- **Tailwind CSS** + custom design tokens (`tailwind.config.ts`)
- **Plus Jakarta Sans** + **Material Symbols Outlined** fonts
- **Zod** for client-side validation
- **Firebase Client SDK** (optional — for the Firebase Google sign-in path)

## Layout

```
app/
├── page.tsx                       Marketing landing page
├── about/, how-it-works/, …       Marketing pages
├── browse/                        Public task browser
├── sign-in/, sign-out/            Auth pages
├── get-started/                   Signup step 1
├── verify-identity/               Signup step 2 (country-aware KYC)
├── auth/callback/                 OAuth callback handler
├── forgot-password/, reset-password/
├── dashboard/
│   ├── layout.tsx                 KYC gate (renders children immediately
│   │                              from localStorage cache; revalidates
│   │                              /me in the background)
│   ├── page.tsx                   Overview
│   ├── profile/                   Edit profile + avatar upload
│   ├── kyc/                       Legacy KYC screen (replaced by /verify-identity)
│   ├── tasks/, jobs/, find-tasks/, taskers/
│   ├── messages/, offers/, reviews/
│   ├── settings/, payments/, availability/, notifications/
│   └── …
components/
├── FirebaseAuthButton.tsx         Two-mode Google button (Firebase or
│                                  server-side OAuth fallback)
├── ImageUploader.tsx              Drag/drop + click to upload
├── DashboardShell.tsx             Sidebar + topbar
└── …
lib/
├── auth.ts                        Fast auth cache (localStorage)
├── firebase.ts                    Firebase client SDK loader
├── upload.ts                      uploadFile(kind)
└── api.ts
```

## Two-step signup

1. `/get-started` collects email, password, name, phone, country.
2. The web app POSTs to `/api/backend/api/auth/register`, which returns
   the user's `kycRequirements` (the list of verification modes for
   their country). The page then POSTs to `/api/backend/api/auth/login`
   and routes to `/verify-identity`.
3. `/verify-identity` calls `/api/backend/api/auth/kyc/progress` to
   render the list of required KYC modes, then calls
   `/api/backend/api/auth/kyc/submit` for each one.
4. When all required modes are approved, the page routes to
   `/dashboard`. Until then, the dashboard layout bounces the user
   back to `/verify-identity` (except for the KYC pages themselves).

## Performance

- The dashboard layout reads the user from `localStorage` synchronously
  and renders the children immediately. The actual `/me` revalidation
  happens in the background and only redirects if KYC isn't done.
- Login and signup pre-warm `/me` before routing, so the next page
  renders with real data.
- `lib/auth.ts` de-duplicates concurrent `/me` requests and caches
  responses for the duration of the tab.

## Local dev

```bash
cp .env.example .env.local
# Set BACKEND_INTERNAL_URL=http://localhost:4000
# Set NEXT_PUBLIC_API_BASE=http://localhost:4000
npm install
npm run dev
```

## Production build

```bash
npm run build
npm start
```

The Vercel monorepo config in `vercel.json` (root) + `web/vercel.json`
handles cache headers, security headers, and the `/api/backend/*`
rewrite to the deployed backend.
