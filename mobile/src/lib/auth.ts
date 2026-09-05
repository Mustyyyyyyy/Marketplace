import { create } from './tinyStore';
import { api, setTokens, loadTokens, setUnauthorizedHandler, fetchMe, API_BASE } from './api';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { getAuthOrNull, getGoogleProvider, loadFirebaseConfig } from './firebase';

export type Role = 'CUSTOMER' | 'TASKER' | 'ADMIN' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'BANNED';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type SignupStep = 'PROFILE' | 'KYC' | 'COMPLETE';

export interface User {
  id: string; email: string; role: Role; status: UserStatus; emailVerified: boolean; phoneVerified?: boolean;
  displayName?: string; avatarUrl?: string; country: string; locale: string; currency: string; timezone: string;
  kycStatus?: KycStatus;
  signupStep?: SignupStep;
  kycCountry?: string;
}

interface AuthState {
  user: User | null;
  bootstrapped: boolean;
}

export const authStore = create<AuthState>({ user: null, bootstrapped: false });

export async function bootstrap() {
  // Mark bootstrapped immediately so the UI never hangs on a fresh start.
  authStore.setState({ bootstrapped: true });
  setUnauthorizedHandler(() => { authStore.setState({ user: null }); });
  const t = await loadTokens();
  if (t.access) {
    try {
      const me = await fetchMe(true);
      if (me) authStore.setState({ user: me });
      else setTokens(null, null);
    } catch { /* ignore */ }
  }
}

export async function register(input: { email: string; password: string; role?: Role; displayName?: string; country?: string; locale?: string; currency?: string; timezone?: string; }) {
  const res = await api.post<any>('/api/auth/register', input, { auth: false });
  return res;
}

export async function login(email: string, password: string) {
  const res = await api.post<{ accessToken: string; refreshToken: string; twoFactorRequired?: boolean }>('/api/auth/login', { email, password }, { auth: false });
  setTokens(res.accessToken, res.refreshToken);
  const me = await fetchMe(true);
  if (me) authStore.setState({ user: me });
  return res;
}

export async function logout() {
  try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
  setTokens(null, null);
  authStore.setState({ user: null });
}

export async function signInWithGoogle(role: Role = 'CUSTOMER') {
  const cfg = await loadFirebaseConfig();
  if (!cfg.enabled) throw new Error('Google sign-in is not configured on this server.');
  const auth = getAuthOrNull();
  if (!auth) throw new Error('Firebase not initialised.');
  let cred: UserCredential;
  try {
    cred = await signInWithPopup(auth, getGoogleProvider());
  } catch (e: any) {
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, getGoogleProvider() as GoogleAuthProvider);
      throw new Error('Redirecting to Google…');
    }
    throw e;
  }
  const idToken = await cred.user.getIdToken(true);
  const res: any = await api.post('/api/auth/firebase', { idToken, role }, { auth: false });
  setTokens(res.accessToken, res.refreshToken);
  const me = await fetchMe(true);
  if (me) authStore.setState({ user: me });
  return res;
}

export async function handleGoogleRedirect() {
  const auth = getAuthOrNull();
  if (!auth) return;
  try {
    const result = await getRedirectResult(auth);
    if (!result) return;
    const idToken = await result.user.getIdToken(true);
    const res: any = await api.post('/api/auth/firebase', { idToken }, { auth: false });
    setTokens(res.accessToken, res.refreshToken);
    const me = await fetchMe(true);
    if (me) authStore.setState({ user: me });
  } catch { /* ignore */ }
}

export async function requestPasswordReset(email: string) {
  return api.post('/api/auth/password/request', { email }, { auth: false });
}

export async function resetPassword(token: string, newPassword: string) {
  return api.post('/api/auth/password/reset', { token, newPassword }, { auth: false });
}

export async function requestEmailVerification() {
  return api.post('/api/auth/verify/email/request', {});
}

export async function confirmEmailVerification(token: string) {
  return api.post('/api/auth/verify/email/confirm', { token });
}

export { API_BASE };
