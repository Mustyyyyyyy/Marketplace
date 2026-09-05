import admin from 'firebase-admin';
import { prisma } from '../db';
import { signAccessToken, signRefreshToken, hashPassword } from './authService';
import { withRetry } from '../db';

let initialized = false;

function ensure() {
  if (initialized) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
    initialized = true;
    return;
  }
  // Dev fallback — emulator or test environment. We still create a credential-less app so the
  // module doesn't crash on import; verifyIdToken will fail loudly if no project is set up.
  try { admin.initializeApp({ projectId: 'demo-tasksphere' }); initialized = true; } catch {}
}

export interface FirebaseClaims {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseClaims> {
  ensure();
  if (!initialized) throw new Error('Firebase not configured');
  try {
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    return {
      sub: decoded.uid,
      email: decoded.email || '',
      email_verified: decoded.email_verified,
      name: (decoded as any).name,
      picture: (decoded as any).picture,
    };
  } catch (e: any) {
    throw Object.assign(new Error('Invalid Firebase ID token'), { code: 'FIREBASE_INVALID', cause: e });
  }
}

export async function signInOrSignUpWithFirebase(claims: FirebaseClaims, role: 'CUSTOMER' | 'TASKER' = 'CUSTOMER') {
  if (!claims.email) throw new Error('Firebase account has no email');
  const email = claims.email.toLowerCase();

  // Look up by firebaseUid first, then by email
  const existing = await withRetry(() => prisma.user.findFirst({
    where: { OR: [{ firebaseUid: claims.sub }, { email }] },
  }));

  let user;
  if (existing) {
    user = await withRetry(() => prisma.user.update({
      where: { id: existing.id },
      data: {
        firebaseUid: claims.sub,
        emailVerified: existing.emailVerified || claims.email_verified || false,
        avatarUrl: existing.avatarUrl || claims.picture || null,
        displayName: existing.displayName || claims.name || existing.displayName,
      },
    }));
  } else {
    // Generate a random unguessable password (the user will only sign in via Firebase)
    const random = (await import('crypto')).randomBytes(32).toString('hex');
    user = await withRetry(() => prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(random),
        role,
        displayName: claims.name || email.split('@')[0],
        country: 'US',
        currency: 'USD',
        locale: 'en',
        firebaseUid: claims.sub,
        emailVerified: !!claims.email_verified,
        avatarUrl: claims.picture || null,
      },
    }));
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } };
}
