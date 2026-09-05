import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import * as auth from '../services/authService';
import { issueVerification, consumeVerification } from '../services/authService';
import { VerificationKind } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { badRequest, notFound, forbidden } from '../errors';
import { withRetry } from '../db';
import { getKycRules, listSupportedCountries, countryMeta } from '../services/kycRules';
import * as kyc from '../services/kycService';

const prisma = new PrismaClient();
const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  phone: z.string().min(7).max(20).optional(),
  role: z.enum(['CUSTOMER', 'TASKER']).optional(),
  displayName: z.string().min(1).max(80).optional(),
  country: z.string().length(2).optional(),
  locale: z.string().min(2).max(5).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().min(1).max(60).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ResetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(200),
});

const PhoneVerifyRequestSchema = z.object({
  phone: z.string().min(7).max(20),
});

const RefreshSchema = z.object({ refreshToken: z.string().min(10) });

router.post('/register', validateBody(RegisterSchema), async (req, res, next) => {
  try {
    const user = await auth.register(req.body);
    res.status(201).json({ user, message: 'Verification email issued. Check your inbox (dev: see /dev/email-token).' });
  } catch (e) { next(e); }
});

router.post('/login', validateBody(LoginSchema), async (req, res, next) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const ua = req.headers['user-agent'] as string;
    const result = await auth.login(req.body.email, req.body.password, { ip, userAgent: ua });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/refresh', validateBody(RefreshSchema), async (req, res, next) => {
  try {
    const result = await auth.refresh(req.body.refreshToken, { ip: req.ip, userAgent: req.headers['user-agent'] as string });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/logout', requireAuth, async (req: AuthedRequest, res, next) => {
  try { await auth.logout(req.user!.sid); res.json({ ok: true }); } catch (e) { next(e); }
});

router.post('/password/request', validateBody(z.object({ email: z.string().email() })), async (req, res, next) => {
  try { await auth.requestPasswordReset(req.body.email); res.json({ ok: true }); } catch (e) { next(e); }
});

router.post('/password/reset', validateBody(ResetSchema), async (req, res, next) => {
  try { const uid = await auth.resetPassword(req.body.token, req.body.newPassword); res.json({ ok: true, userId: uid }); } catch (e) { next(e); }
});

router.post('/password/change', requireAuth, validateBody(z.object({ current: z.string(), next: z.string().min(8) })), async (req: AuthedRequest, res, next) => {
  try { await auth.changePassword(req.user!.id, req.body.current, req.body.next); res.json({ ok: true }); } catch (e) { next(e); }
});

router.post('/verify/email/request', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const token = await issueVerification(req.user!.id, VerificationKind.EMAIL);
    res.json({ ok: true, devToken: process.env.ENABLE_DEV_ROUTES === '1' ? token : undefined });
  } catch (e) { next(e); }
});

router.post('/verify/email/confirm', validateBody(z.object({ token: z.string().min(10) })), async (req, res, next) => {
  try { const userId = await consumeVerification(req.body.token, VerificationKind.EMAIL); res.json({ ok: true, userId }); } catch (e) { next(e); }
});

router.post('/verify/phone/request', requireAuth, validateBody(PhoneVerifyRequestSchema), async (req: AuthedRequest, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.user!.id }, data: { phone: req.body.phone } });
    const token = await issueVerification(req.user!.id, VerificationKind.PHONE, 15);
    res.json({ ok: true, devToken: process.env.NODE_ENV === 'development' ? token : undefined });
  } catch (e) { next(e); }
});

router.post('/verify/phone/confirm', validateBody(z.object({ token: z.string().min(10) })), async (req, res, next) => {
  try { const userId = await consumeVerification(req.body.token, VerificationKind.PHONE); res.json({ ok: true, userId }); } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await withRetry(() => prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { customerProfile: true, taskerProfile: true, preferences: true },
    }));
    if (!user) throw notFound();
    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        avatarPublicId: user.avatarPublicId,
        country: user.country,
        locale: user.locale,
        currency: user.currency,
        timezone: user.timezone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        // KYC funnel state
        signupStep: user.signupStep,
        kycStatus: user.kycStatus,
        kycCountry: user.kycCountry,
        kycApprovedAt: user.kycApprovedAt,
        kycRejectedReason: user.kycRejectedReason,
        customerProfile: user.customerProfile,
        taskerProfile: user.taskerProfile,
        preferences: user.preferences,
      },
    });
  } catch (e) { next(e); }
});

// Dev helper: list recent verification tokens for a given user email (DEV ONLY, requires ENABLE_DEV_ROUTES=1)
if (process.env.ENABLE_DEV_ROUTES === '1') {
  router.get('/dev/email-token', async (req, res, next) => {
    try {
      const email = String(req.query.email || '');
      if (!email) throw badRequest('email required');
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) throw notFound();
      const tokens = await prisma.verificationToken.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 });
      res.json({ tokens });
    } catch (e) { next(e); }
  });
}

const FirebaseLoginSchema = z.object({
  idToken: z.string().min(10),
  role: z.enum(['CUSTOMER', 'TASKER']).optional(),
});

router.post('/firebase', validateBody(FirebaseLoginSchema), async (req, res, next) => {
  try {
    const { verifyFirebaseIdToken, signInOrSignUpWithFirebase } = await import('../services/firebaseAuth');
    const claims = await verifyFirebaseIdToken(req.body.idToken);
    const result = await signInOrSignUpWithFirebase(claims, req.body.role);
    res.json(result);
  } catch (e) {
    // If Firebase is not configured at all, respond 503 with a clear message so the UI can degrade gracefully
    const msg = (e as Error)?.message || 'Firebase auth failed';
    if (msg.includes('Firebase not configured') || msg.includes('credential')) {
      return res.status(503).json({ error: 'Firebase authentication is not configured on this server', code: 'FIREBASE_NOT_CONFIGURED' });
    }
    next(e);
  }
});

router.get('/firebase/config', (_req, res) => {
  // Public config consumed by the web client. We expose Firebase web config
  // when the user has set NEXT_PUBLIC_FIREBASE_API_KEY + AUTH_DOMAIN (typical
  // for Firebase-hosting deploys). For projects that prefer the backend
  // Google-OAuth flow (no Firebase client SDK), the same endpoint reports
  // googleOAuthEnabled so the web button can decide which path to use.
  res.json({
    enabled: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
    projectId: process.env.FIREBASE_PROJECT_ID || null,
    googleOAuthEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
});

// ============================================================
// KYC — country-aware identity verification (step 2 of signup)
// ============================================================

// Public: list of supported countries (so the signup form can show a picker)
router.get('/kyc/countries', (_req, res) => {
  res.json({ countries: listSupportedCountries() });
});

// Public: rules for a given (country, role) — used by the signup preview
router.get('/kyc/requirements', (req, res, next) => {
  try {
    const country = String(req.query.country || 'GB').toUpperCase();
    const role = String(req.query.role || 'CUSTOMER').toUpperCase() === 'TASKER' ? 'TASKER' : 'CUSTOMER';
    const rules = getKycRules(country, role);
    res.json({
      country: rules.country,
      countryName: rules.countryName,
      description: rules.description,
      modes: rules.modes,
      meta: countryMeta(country),
    });
  } catch (e) { next(e); }
});

// Authed: progress for the current user
router.get('/kyc/progress', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw notFound();
    const progress = await kyc.getKycProgress(user.id, user.country, user.role as 'CUSTOMER' | 'TASKER');
    res.json({
      kycStatus: user.kycStatus,
      signupStep: user.signupStep,
      kycCountry: user.kycCountry,
      kycApprovedAt: user.kycApprovedAt,
      kycRejectedReason: user.kycRejectedReason,
      ...progress,
    });
  } catch (e) { next(e); }
});

// Authed: submit a single KYC mode
const SubmitKycSchema = z.object({
  mode: z.enum([
    'ID_DOCUMENT', 'NATIONAL_ID_NUMBER', 'TAX_ID', 'BANK_VERIFICATION',
    'ADDRESS_PROOF', 'DRIVER_LICENSE', 'PASSPORT',
    'PHONE_OTP', 'EMAIL_OTP', 'SELFIE', 'SANCTIONS_SCREEN',
  ]),
  value: z.string().max(200).optional(),
  fileUrl: z.string().url().optional(),
  filePublicId: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

router.post('/kyc/submit', requireAuth, validateBody(SubmitKycSchema), async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw notFound();
    if (user.kycStatus === 'APPROVED') {
      return res.status(400).json({ error: 'KYC already approved' });
    }
    const submission = await kyc.submitKycMode(user.id, user.country, user.role as 'CUSTOMER' | 'TASKER', req.body);
    const rolled = await kyc.rollupKycStatus(user.id, user.country, user.role as 'CUSTOMER' | 'TASKER');
    res.json({ submission, ...rolled });
  } catch (e) { next(e); }
});

// Dev-only: forcibly skip KYC so testing is fast (requires ENABLE_DEV_ROUTES=1)
if (process.env.ENABLE_DEV_ROUTES === '1') {
  router.post('/kyc/dev-approve', requireAuth, async (req: AuthedRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw notFound();
      const rules = getKycRules(user.country, user.role as 'CUSTOMER' | 'TASKER');
      const now = new Date();
      // Synthesize one approved submission per required mode so the rollup
      // marks the user as fully verified.
      await prisma.$transaction(
        rules.modes.filter((m) => m.required).map((m) =>
          prisma.kycSubmission.upsert({
            where: { id: `dev-${user.id}-${m.mode}` },
            create: {
              id: `dev-${user.id}-${m.mode}`,
              userId: user.id,
              mode: m.mode,
              value: m.fileBased ? null : 'DEV-APPROVED',
              fileUrl: m.fileBased ? 'https://res.cloudinary.com/dev/image/upload/dev.jpg' : null,
              status: 'APPROVED',
              submittedAt: now,
              reviewedAt: now,
            },
            update: { status: 'APPROVED', reviewedAt: now },
          })
        )
      );
      const rolled = await kyc.rollupKycStatus(user.id, user.country, user.role as 'CUSTOMER' | 'TASKER');
      res.json({ ok: true, ...rolled });
    } catch (e) { next(e); }
  });
}

export default router;