import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { API_BASE } from './api';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let config: { apiKey: string; authDomain: string; projectId: string } | null = null;
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
      enabled: !!config,
      apiKey: config?.apiKey ?? null,
      authDomain: config?.authDomain ?? null,
      projectId: config?.projectId ?? null,
      googleOAuthEnabled,
    };
  }
  configChecked = true;
  try {
    const r = await fetch(`${API_BASE}/api/auth/firebase/config`);
    if (!r.ok) return { enabled: false, apiKey: null, authDomain: null, projectId: null, googleOAuthEnabled: false };
    const j: FirebaseConfig = await r.json();
    googleOAuthEnabled = !!j.googleOAuthEnabled;
    if (j.enabled && j.apiKey && j.projectId) {
      config = { apiKey: j.apiKey, authDomain: j.authDomain || `${j.projectId}.firebaseapp.com`, projectId: j.projectId };
      return { enabled: true, apiKey: j.apiKey, authDomain: j.authDomain, projectId: j.projectId, googleOAuthEnabled };
    }
    return { enabled: false, apiKey: j.apiKey, authDomain: j.authDomain, projectId: j.projectId, googleOAuthEnabled };
  } catch {
    return { enabled: false, apiKey: null, authDomain: null, projectId: null, googleOAuthEnabled: false };
  }
}

export function getAuthOrNull(): Auth | null {
  if (!config) return null;
  if (auth) return auth;
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  auth = getAuth(app);
  return auth;
}

export function getGoogleProvider() {
  const p = new GoogleAuthProvider();
  p.addScope('email');
  p.addScope('profile');
  return p;
}

export function isGoogleOAuthEnabled(): boolean {
  return googleOAuthEnabled;
}

// Helper for mobile: open the server-side OAuth start URL in the system browser.
export function startServerGoogleOAuth(role: 'CUSTOMER' | 'TASKER' = 'CUSTOMER') {
  // On native we use expo-web-browser to open the OAuth flow and capture
  // the redirect. Mobile deep-link config should be set to /auth/callback.
  const url = `${API_BASE}/api/auth/google/start?role=${encodeURIComponent(role)}`;
  return url;
}
