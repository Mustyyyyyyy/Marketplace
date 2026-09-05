# Mobile — TaskSphere

Expo (React Native) iOS / Android / Web app for TaskSphere.

## Stack

- **Expo SDK 51** with iOS, Android, and Web support
- **React Native 0.74** + **React 18**
- **React Navigation 6** (native stack + bottom tabs)
- **Firebase Client SDK** (optional — for the Firebase Google sign-in path)
- **expo-secure-store** for token persistence
- **expo-image-picker** for KYC + portfolio uploads
- **expo-web-browser** for the server-side Google OAuth flow
- **Socket.IO client** for real-time chat

## Layout

```
App.tsx                              Root navigator with PostAuthNav
                                     (KYC gate)
src/
├── screens/
│   ├── auth/                        LoginScreen, RegisterScreen,
│   │                                VerifyIdentityScreen, AuthCallbackScreen
│   ├── dashboard/                   FindTasks, MyJobs, Taskers, Reviews,
│   │                                Availability, Payments, Settings
│   ├── tasks/                       TaskDetail, CreateTask, MyTasks
│   ├── messages/                    MessagesList, Chat
│   ├── marketing/                   About, HowItWorks, Categories, …
│   ├── ProfileScreen, EditProfileScreen, TaskerExtrasScreen, …
│   └── …
├── ui/                              Components, theme, GoogleButton,
│                                    ImageUploader, Avatar
├── lib/
│   ├── auth.ts                      Auth store + login/register helpers
│   ├── api.ts                       fetch wrapper + token refresh
│   ├── firebase.ts                  Firebase client SDK loader +
│                                    googleOAuthEnabled detection
│   ├── upload.ts                    uploadFile(uri, kind) helper
│   └── tinyStore.ts                 Minimal zustand-style store
└── app.json                         Expo config
```

## Two-step signup

1. `RegisterScreen` collects email, password, name, phone, country.
2. After register+login, the user lands on `VerifyIdentityScreen`.
   The screen fetches `/api/auth/kyc/progress` and renders the list of
   required `KycMode`s for the user's country.
3. Each mode has its own submission widget:
   - **Text** (NIN, BVN, SSN, etc.) — input + Submit button
   - **File** (ID_DOCUMENT, SELFIE, ADDRESS_PROOF) — `expo-image-picker` + upload
   - **OTP** (EMAIL_OTP, PHONE_OTP) — "send code" button
4. When all required modes are `APPROVED`, the screen calls `nav.reset`
   to the tabs.

## KYC gate

`App.tsx` has a `PostAuthNav` component that reads
`authStore.user.kycStatus`. If it's not `APPROVED`, it routes to
`VerifyIdentity` instead of the tabs.

## Google sign-in

`GoogleButton` checks the backend's `/api/auth/firebase/config` and
chooses between:

- **Firebase Client SDK** — `signInWithPopup` (web) or `signInWithPopup`
  on native, then POST the ID token to `/api/auth/firebase`.
- **Server-side Google OAuth** — opens the system browser to
  `/api/auth/google/start`, the backend handles Google, then redirects
  back to the deep link `marketplace://auth/callback?access=…&refresh=…`.
  `AuthCallbackScreen` picks up the tokens and updates the auth store.

## Local dev

```bash
npm install
npx expo start                       # scan QR with Expo Go
# or
npx expo start --web                 # run in browser
```

The mobile app uses `EXPO_PUBLIC_API_BASE` when it is set. Otherwise, local
development defaults to `http://10.0.2.2:4000` (Android emulator → host) and
`http://localhost:4000` (iOS simulator / web). For a deployed build, use the
unified Vercel URL:

```bash
EXPO_PUBLIC_API_BASE=https://marketplace-backend-sable.vercel.app npx expo start
```

Set the same variable in the EAS build environment before shipping a
production binary.

## Production build

```bash
npm install -g eas-cli
eas build:configure
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android
eas submit --platform ios
```

Set `EXPO_PUBLIC_API_BASE` to the deployed Vercel URL in the EAS environment.
before triggering the production build.
