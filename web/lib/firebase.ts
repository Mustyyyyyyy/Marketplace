'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let webConfig: { apiKey: string; authDomain: string; projectId: string } | null = null;
let configChecked = false;
let googleOAuthEnabled = false;

export interface FirebaseConfig {
  enabled: boolean;
  apiKey: string | null;
  authDomain: string | null;
  projectId: string | null;
  googleOAuthEnabled: boolean;
}

export async function loadFirebaseConfig(): Promise<FirebaseConfig> {
  if (configChecked) {
    return {
      enabled: !!webConfig,
      apiKey: webConfig?.apiKey ?? null,
      authDomain: webConfig?.authDomain ?? null,
      projectId: webConfig?.projectId ?? null,
      googleOAuthEnabled,
    };
  }
  configChecked = true;
  try {
    const r = await fetch('/api/backend/api/auth/firebase/config', { cache: 'no-store' });
    if (!r.ok) return { enabled: false, apiKey: null, authDomain: null, projectId: null, googleOAuthEnabled: false };
    const j = (await r.json()) as FirebaseConfig;
    googleOAuthEnabled = !!j.googleOAuthEnabled;
    if (j.enabled && j.apiKey && j.projectId) {
      webConfig = { apiKey: j.apiKey, authDomain: j.authDomain || `${j.projectId}.firebaseapp.com`, projectId: j.projectId };
    }
    return j;
  } catch {
    return { enabled: false, apiKey: null, authDomain: null, projectId: null, googleOAuthEnabled: false };
  }
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (auth) return auth;
  if (!webConfig) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(webConfig);
  }
  auth = getAuth(app);
  return auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
}

export function isGoogleOAuthEnabled(): boolean {
  return googleOAuthEnabled;
}
