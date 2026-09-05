// Centralized auth helpers for the web app.
// Cache: we keep the last /me response in localStorage so the dashboard
// can render instantly after a navigation. We re-validate on focus, on
// auth-changing actions (login, register, google), and on every 30s
// while a tab is visible.

export interface CachedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'TASKER' | 'ADMIN' | 'SUPPORT';
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'BANNED';
  displayName?: string | null;
  avatarUrl?: string | null;
  country?: string;
  currency?: string;
  kycStatus?: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  signupStep?: 'PROFILE' | 'KYC' | 'COMPLETE';
}

const USER_KEY = 'user';
const ACCESS_KEY = 'access';
const REFRESH_KEY = 'refresh';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getCachedUser(): CachedUser | null {
  if (typeof window === 'undefined') return null;
  try { const v = localStorage.getItem(USER_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

export function setCachedUser(u: CachedUser | null) {
  if (typeof window === 'undefined') return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

export function setTokens(access: string | null, refresh: string | null) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem(ACCESS_KEY, access); else localStorage.removeItem(ACCESS_KEY);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh); else localStorage.removeItem(REFRESH_KEY);
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  setTokens(null, null);
  setCachedUser(null);
}

export function authHeader(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Fetch /me with a tiny in-flight de-dup so multiple components mounting
// at once don't all hit the network. Returns the cached value first.
export async function fetchMe(force = false): Promise<CachedUser | null> {
  if (typeof window === 'undefined') return null;
  if (!getAccessToken()) return null;
  if (!force) {
    const cached = getCachedUser();
    if (cached) return cached;
  }
  if (fetchMe._inflight) return fetchMe._inflight;
  fetchMe._inflight = (async () => {
    try {
      const r = await fetch('/api/backend/api/auth/me', { headers: authHeader(), cache: 'no-store' });
      if (r.status === 401) { clearAuth(); return null; }
      if (!r.ok) return getCachedUser();
      const j = await r.json();
      if (j?.user) { setCachedUser(j.user); return j.user; }
      return getCachedUser();
    } finally { fetchMe._inflight = null as any; }
  })();
  return fetchMe._inflight;
}
fetchMe._inflight = null as any;

// Best-effort refresh. If the access token is about to expire (we always
// treat any 401 as a cue), we try a refresh; if that fails, we wipe state.
export async function ensureFreshAccess(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!access) return null;
  // Probe /me; if 401, try refresh.
  const r = await fetch('/api/backend/api/auth/me', { headers: authHeader(), cache: 'no-store' });
  if (r.status !== 401) return access;
  if (!refresh) { clearAuth(); return null; }
  const rr = await fetch('/api/backend/api/auth/refresh', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!rr.ok) { clearAuth(); return null; }
  const j = await rr.json();
  if (j?.accessToken) { setTokens(j.accessToken, null); return j.accessToken; }
  clearAuth();
  return null;
}
