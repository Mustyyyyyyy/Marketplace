'use client';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, type UserCredential } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, loadFirebaseConfig, isGoogleOAuthEnabled } from '@/lib/firebase';

interface Props {
  mode: 'signin' | 'signup';
  role?: 'CUSTOMER' | 'TASKER';
  onSuccess: (cred: { accessToken: string; refreshToken: string; user: { id: string; email: string; role: string; displayName?: string | null; signupStep?: string; kycStatus?: string; nextStep?: string; kycRequirements?: any } }) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

declare global { interface Window { __FIREBASE_API_KEY__?: string; __FIREBASE_AUTH_DOMAIN__?: string; __FIREBASE_PROJECT_ID__?: string } }

type Mode = 'loading' | 'firebase' | 'serverOAuth' | 'unconfigured';

export default function FirebaseAuthButton({ mode, role, onSuccess, onError, disabled }: Props) {
  const [authMode, setAuthMode] = useState<Mode>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadFirebaseConfig();
      if (cancelled) return;
      if (cfg.enabled && cfg.apiKey && cfg.projectId) {
        window.__FIREBASE_API_KEY__ = cfg.apiKey;
        window.__FIREBASE_AUTH_DOMAIN__ = cfg.authDomain || `${cfg.projectId}.firebaseapp.com`;
        window.__FIREBASE_PROJECT_ID__ = cfg.projectId;
        setAuthMode('firebase');
      } else if (cfg.googleOAuthEnabled) {
        setAuthMode('serverOAuth');
      } else {
        setAuthMode('unconfigured');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Handle the redirect result (mobile / popup-blocked fallback)
  useEffect(() => {
    if (authMode !== 'firebase') return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    getRedirectResult(auth).catch(() => { /* ignore "no redirect" */ });
  }, [authMode]);

  if (authMode === 'loading') {
    return (
      <button type="button" disabled className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md font-semibold opacity-50 cursor-not-allowed">
        <GoogleIcon /> Loading…
      </button>
    );
  }

  if (authMode === 'unconfigured') {
    return (
      <button type="button" disabled title="Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend env (or NEXT_PUBLIC_FIREBASE_API_KEY + NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN for the Firebase client SDK path)." className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md font-semibold opacity-50 cursor-not-allowed">
        <GoogleIcon /> Continue with Google (not configured)
      </button>
    );
  }

  // ---------- server-side Google OAuth (no Firebase client SDK) ----------
  if (authMode === 'serverOAuth') {
    return (
      <button
        type="button"
        onClick={() => {
          if (busy || disabled) return;
          // Full-page redirect to backend OAuth start route
          const roleQS = role ? `?role=${encodeURIComponent(role)}` : '';
          window.location.href = `/api/backend/api/auth/google/start${roleQS}`;
        }}
        disabled={disabled || busy}
        className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-all disabled:opacity-60"
      >
        <GoogleIcon />
        {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
      </button>
    );
  }

  // ---------- Firebase client SDK flow ----------
  const handle = async () => {
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialised');
      let cred: UserCredential;
      try {
        cred = await signInWithPopup(auth, getGoogleProvider());
      } catch (e: any) {
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(auth, getGoogleProvider());
          return; // Page will reload
        }
        throw e;
      }
      const idToken = await cred.user.getIdToken(true);
      const r = await fetch('/api/backend/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Sign-in failed');
      }
      const j = await r.json();
      onSuccess(j);
    } catch (e: any) {
      onError(e?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled || busy}
      className="w-full inline-flex items-center justify-center gap-space-sm px-space-md py-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-all disabled:opacity-60"
    >
      <GoogleIcon />
      {busy ? 'Connecting…' : (mode === 'signup' ? 'Sign up with Google' : 'Continue with Google')}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-6 7.7-11.3 7.7-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.2-11.3-7.7l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
