function resolveApiBase(): string {
  try {
    const configuredBase = process.env.EXPO_PUBLIC_API_BASE?.trim();
    if (configuredBase) return configuredBase.replace(/\/+$/, '');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default || require('expo-constants');
    const extra = (Constants.expoConfig?.extra as any) || {};
    // Android emulator → 10.0.2.2 maps to host's localhost. iOS sim + web use localhost directly.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Platform } = require('react-native');
    return Platform.OS === 'web' ? (extra.apiBaseUrlWeb || 'http://localhost:4000') : (extra.apiBaseUrl || 'http://10.0.2.2:4000');
  } catch {
    return 'http://localhost:4000';
  }
}

export const API_BASE = resolveApiBase();

let _access: string | null = null;
let _refresh: string | null = null;
let _onUnauthorized: (() => void) | null = null;

async function safeSet(key: string, value: string | null) {
  if (typeof jest !== 'undefined') return; // tests: skip SecureStore
  try { const SecureStore = require('expo-secure-store'); if (value) await SecureStore.setItemAsync(key, value); else await SecureStore.deleteItemAsync(key); } catch { /* ignore */ }
}

export function setTokens(access: string | null, refresh: string | null) {
  _access = access;
  _refresh = refresh;
  safeSet('access', access);
  safeSet('refresh', refresh);
}

export async function loadTokens() {
  if (typeof jest !== 'undefined') return { access: _access, refresh: _refresh };
  try { const SecureStore = require('expo-secure-store'); _access = (await SecureStore.getItemAsync('access')) || null; _refresh = (await SecureStore.getItemAsync('refresh')) || null; } catch { /* ignore */ }
  return { access: _access, refresh: _refresh };
}

export function setUnauthorizedHandler(fn: () => void) { _onUnauthorized = fn; }

export class ApiError extends Error {
  status: number; details?: any;
  constructor(status: number, message: string, details?: any) { super(message); this.status = status; this.details = details; }
}

async function request<T>(method: string, path: string, body?: any, opts: { auth?: boolean } = { auth: true }): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== false && _access) headers.Authorization = `Bearer ${_access}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    if (res.status === 401 && _refresh && opts.auth !== false) {
      // try refresh once
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request<T>(method, path, body, opts);
      }
      _onUnauthorized?.();
    }
    throw new ApiError(res.status, data?.error || res.statusText, data?.details);
  }
  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  if (!_refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: _refresh }) });
    if (!res.ok) { setTokens(null, null); return false; }
    const data = await res.json();
    if (data?.accessToken) { _access = data.accessToken; await safeSet('access', _access); return true; }
  } catch { /* ignore */ }
  setTokens(null, null);
  return false;
}

function safeJson(text: string) { try { return JSON.parse(text); } catch { return null; } }

export const api = {
  get: <T>(p: string, _b?: any, opts?: { auth?: boolean }) => request<T>('GET', p, undefined, opts),
  post: <T>(p: string, b?: any, opts?: { auth?: boolean }) => request<T>('POST', p, b, opts),
  patch: <T>(p: string, b?: any, opts?: { auth?: boolean }) => request<T>('PATCH', p, b, opts),
  put: <T>(p: string, b?: any, opts?: { auth?: boolean }) => request<T>('PUT', p, b, opts),
  del: <T>(p: string) => request<T>('DELETE', p),
};

// Coalesced /me fetcher. Multiple components calling fetchMe() at the
// same time only hit the network once.
let _meInflight: Promise<any> | null = null;
export async function fetchMe(force = false): Promise<any | null> {
  if (_meInflight && !force) return _meInflight;
  _meInflight = (async () => {
    try { const j = await api.get<any>('/api/auth/me'); return j?.user ?? null; }
    catch { return null; }
    finally { _meInflight = null; }
  })();
  return _meInflight;
}
