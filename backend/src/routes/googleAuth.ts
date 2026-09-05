// Server-side Google OAuth 2.0 flow.
//
// We use the standard Google OAuth2 endpoints (NOT the Firebase client SDK)
// so the web app doesn't need a Firebase web config — it just 302s the
// user to Google and back.
//
// Required env:
//   GOOGLE_CLIENT_ID     — from Google Cloud Console → APIs & Services → Credentials
//   GOOGLE_CLIENT_SECRET — same
// Optional:
//   GOOGLE_REDIRECT_URI  — defaults to <PUBLIC_BASE_URL>/api/auth/google/callback
//
// On success we mint our own JWT and 302 to:
//   <WEB_BASE_URL>/auth/callback?access=…&refresh=…&provider=google
// (the web app stores them and routes to the dashboard).

import { randomBytes } from 'crypto';
import { Router, Request, Response } from 'express';
import { env } from '../config';
import { signAccess, signRefresh } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { badRequest, notFound } from '../errors';
import { withRetry } from '../db';

const prisma = new PrismaClient();
const router = Router();

// In-memory CSRF state cache (cleared on callback).
// For a production multi-instance deployment this should be Redis or a
// cookie-stored state — but the scope is small enough that this is fine
// for the dev/single-instance target.
const stateCache = new Map<string, { createdAt: number; role: string | null }>();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanStates() {
  const now = Date.now();
  for (const [k, v] of stateCache.entries()) {
    if (now - v.createdAt > STATE_TTL_MS) stateCache.delete(k);
  }
}

function googleConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function webBaseUrl(req: Request) {
  // Prefer the Origin of the request (so localhost:3000 stays in dev),
  // then PUBLIC_BASE_URL, then the public_api_base.
  const origin = (req.headers.origin || req.headers.referer || '').toString();
  try {
    if (origin) return new URL(origin).origin;
  } catch { /* ignore */ }
  return env.PUBLIC_BASE_URL || 'http://localhost:3000';
}

function redirectUri(req: Request) {
  return env.GOOGLE_REDIRECT_URI || `${env.PUBLIC_BASE_URL}/api/auth/google/callback`;
}

// GET /api/auth/google/start?role=CUSTOMER|TASKER
// 302s the browser to Google.
router.get('/google/start', (req: Request, res: Response) => {
  if (!googleConfigured()) {
    res.status(503).json({ error: 'Google sign-in is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend env.' });
    return;
  }
  cleanStates();
  const state = randomBytes(24).toString('hex');
  const role = String(req.query.role || '').toUpperCase();
  stateCache.set(state, { createdAt: Date.now(), role: role === 'TASKER' ? 'TASKER' : 'CUSTOMER' });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  });
  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// GET /api/auth/google/callback?code=…&state=…
// Exchanges the code, signs our JWTs, 302s to the web app.
router.get('/google/callback', async (req: Request, res: Response, next) => {
  try {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    if (!code) throw badRequest('Missing code');
    if (!state || !stateCache.has(state)) throw badRequest('Invalid state');
    const { role } = stateCache.get(state)!;
    stateCache.delete(state);

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri(req),
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      throw Object.assign(new Error('Google token exchange failed: ' + t), { code: 'GOOGLE_EXCHANGE_FAILED', status: 502 });
    }
    const tokens = await tokenRes.json() as { access_token?: string; id_token?: string };
    if (!tokens.access_token) throw badRequest('No access_token from Google');

    // Fetch userinfo
    const uiRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!uiRes.ok) throw badRequest('Failed to fetch Google profile');
    const profile = await uiRes.json() as { sub: string; email: string; email_verified?: boolean; name?: string; picture?: string };
    if (!profile.email) throw badRequest('Google account has no email');

    // Sign in or sign up
    const user = await signInOrSignUp(profile, role as 'CUSTOMER' | 'TASKER');
    const access = signAccess({ sub: user.id, role: user.role, sid: '' });
    const refresh = signRefresh({ sub: user.id, sid: '' });
    // NB: refresh here is a JWT carrying the same sid; for simplicity we
    // skip creating a server-side Session row (Google users only ever
    // refresh via /api/auth/refresh which accepts the JWT).

    const redirect = `${webBaseUrl(req)}/auth/callback?access=${encodeURIComponent(access)}&refresh=${encodeURIComponent(refresh)}&provider=google`;
    res.redirect(302, redirect);
  } catch (e) { next(e); }
});

async function signInOrSignUp(p: { sub: string; email: string; email_verified?: boolean; name?: string; picture?: string }, role: 'CUSTOMER' | 'TASKER' = 'CUSTOMER') {
  const email = p.email.toLowerCase();
  let user = await withRetry(() => prisma.user.findFirst({
    where: { OR: [{ firebaseUid: `google:${p.sub}` }, { email }] },
  }));
  if (user) {
    user = await withRetry(() => prisma.user.update({
      where: { id: user!.id },
      data: {
        firebaseUid: `google:${p.sub}`,
        emailVerified: user!.emailVerified || p.email_verified || false,
        avatarUrl: user!.avatarUrl || p.picture || null,
        displayName: user!.displayName || p.name || email.split('@')[0],
      },
    }));
  } else {
    const random = randomBytes(32).toString('hex');
    const passwordHash = await hashPassword(random);
    user = await withRetry(() => prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        displayName: p.name || email.split('@')[0],
        country: 'US',
        currency: 'USD',
        locale: 'en',
        firebaseUid: `google:${p.sub}`,
        emailVerified: !!p.email_verified,
        avatarUrl: p.picture || null,
      },
    }));
  }
  return user!;
}

export default router;
export { googleConfigured };
