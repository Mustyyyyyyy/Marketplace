import { PrismaClient, Role, UserStatus, SignupStep, VerificationKind } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccess, signRefresh, verifyToken } from '../utils/jwt';
import { randomToken, hashToken } from '../utils/tokens';
import { badRequest, conflict, unauthorized, forbidden } from '../errors';
import { env, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES, SUPPORTED_COUNTRIES } from '../config';
import { sendEmail, welcomeEmail, emailVerifyEmail, passwordResetEmail, kycDecisionEmail } from './emailService';
import { withRetry } from '../db';
import { getKycRules } from './kycRules';

export { signAccess as signAccessToken, signRefresh as signRefreshToken } from '../utils/jwt';
export { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  displayName?: string;
  country?: string;
  locale?: string;
  currency?: string;
  timezone?: string;
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, input.phone ? { phone: input.phone } : {}] } });
  if (existing) throw conflict('Email or phone already in use');

  if (input.country && !SUPPORTED_COUNTRIES.includes(input.country)) throw badRequest('Unsupported country');
  if (input.locale && !SUPPORTED_LOCALES.includes(input.locale)) throw badRequest('Unsupported locale');
  if (input.currency && !SUPPORTED_CURRENCIES.includes(input.currency)) throw badRequest('Unsupported currency');

  const passwordHash = await hashPassword(input.password);
  const role: Role = input.role === Role.TASKER ? Role.TASKER : Role.CUSTOMER;
  const country = input.country || 'NG';

  const user = await prisma.user.create({
    data: {
      email,
      phone: input.phone,
      passwordHash,
      role,
      status: UserStatus.PENDING_VERIFICATION,
      signupStep: SignupStep.PROFILE,
      kycStatus: 'NOT_STARTED',
      displayName: input.displayName,
      country,
      locale: input.locale || 'en',
      currency: input.currency || 'NGN',
      timezone: input.timezone || 'Africa/Lagos',
      customerProfile: role === Role.CUSTOMER ? { create: {} } : undefined,
      taskerProfile: role === Role.TASKER ? { create: {} } : undefined,
    },
  });

  // Issue email verification token (returned in dev, sent in prod)
  const verifyTokenRaw = await issueVerification(user.id, VerificationKind.EMAIL);

  // Send welcome email
  try {
    const tpl = welcomeEmail({ name: user.displayName || user.email.split('@')[0], role: user.role as 'CUSTOMER' | 'TASKER' });
    await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  } catch (e) { console.error('welcome email failed', e); }

  // Return the KYC requirements for the user's country + role so the
  // client can immediately render the verification step.
  const kyc = getKycRules(country, role);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    country,
    signupStep: user.signupStep,
    kycStatus: user.kycStatus,
    nextStep: 'KYC',
    kycRequirements: {
      country: kyc.country,
      countryName: kyc.countryName,
      description: kyc.description,
      modes: kyc.modes,
    },
    devVerifyToken: env.ENABLE_DEV_ROUTES ? verifyTokenRaw : undefined,
  };
}

export async function issueVerification(userId: string, kind: VerificationKind, ttlMinutes = 60 * 24) {
  const raw = randomToken(24);
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await prisma.verificationToken.create({ data: { userId, kind, tokenHash, expiresAt } });
  // In production: send via email/SMS. In dev: return for testing via dedicated endpoint.
  if (kind === VerificationKind.EMAIL) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const baseUrl = env.PUBLIC_BASE_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.example.com');
      const verifyUrl = `${baseUrl}/verify-email?token=${raw}`;
      const tpl = emailVerifyEmail({ name: user.displayName || undefined, verifyUrl });
      await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    }
  }
  return raw;
}

export async function consumeVerification(token: string, kind: VerificationKind) {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.consumedAt || record.expiresAt < new Date() || record.kind !== kind) {
    throw badRequest('Invalid or expired token');
  }
  await prisma.verificationToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

  const data: any = {};
  if (kind === VerificationKind.EMAIL) data.emailVerified = true;
  if (kind === VerificationKind.PHONE) data.phoneVerified = true;
  if (kind === VerificationKind.KYC) {
    await prisma.taskerProfile.update({ where: { userId: record.userId }, data: { kycStatus: 'APPROVED' } });
  }
  await prisma.user.update({ where: { id: record.userId }, data });
  return record.userId;
}

export async function login(email: string, password: string, meta: { ip?: string; userAgent?: string }) {
  const user = await withRetry(() => prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } }));
  await withRetry(() => prisma.loginLog.create({
    data: { userId: user?.id, success: false, email, ip: meta.ip, userAgent: meta.userAgent, reason: user ? 'bad-password' : 'no-user' },
  }));
  if (!user) throw unauthorized('Invalid credentials');
  if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) throw forbidden('Account suspended');

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) throw unauthorized('Invalid credentials');

  await prisma.loginLog.create({
    data: { userId: user.id, success: true, email, ip: meta.ip, userAgent: meta.userAgent },
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), status: user.status === UserStatus.PENDING_VERIFICATION ? UserStatus.ACTIVE : user.status } });

  return await issueSession(user.id, user.role, meta, !!user.twoFactorEnabled);
}

export async function issueSession(userId: string, role: string, meta: { ip?: string; userAgent?: string }, twoFactorRequired = false) {
  const refreshRaw = randomToken(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, refreshToken: hashToken(refreshRaw), userAgent: meta.userAgent, ip: meta.ip, expiresAt },
  });
  const access = signAccess({ sub: userId, role, sid: session.id });
  // Return raw refresh token only at creation
  const refresh = signRefresh({ sub: userId, sid: session.id });
  return { accessToken: access, refreshToken: refresh, twoFactorRequired };
}

export async function refresh(refreshJwt: string, meta: { ip?: string; userAgent?: string }) {
  let payload: any;
  try { payload = verifyToken(refreshJwt); } catch { throw unauthorized('Invalid refresh'); }
  // If there's a session id, validate it; otherwise this is a stateless
  // refresh (used by Google sign-in where we never create a Session row).
  if (payload.sid) {
    const session = await prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw unauthorized('Session expired');
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) throw unauthorized();
    const access = signAccess({ sub: user.id, role: user.role, sid: session.id });
    return { accessToken: access };
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw unauthorized();
  const access = signAccess({ sub: user.id, role: user.role, sid: '' });
  return { accessToken: access };
}

export async function logout(sid: string) {
  await prisma.session.update({ where: { id: sid }, data: { revokedAt: new Date() } }).catch(() => null);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return; // do not leak existence
  const raw = randomToken(24);
  const tokenHash = hashToken(raw);
  await prisma.verificationToken.create({
    data: { userId: user.id, kind: VerificationKind.EMAIL, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  const baseUrl = env.PUBLIC_BASE_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://app.example.com');
  const resetUrl = `${baseUrl}/reset-password?token=${raw}`;
  const tpl = passwordResetEmail({ name: user.displayName || undefined, resetUrl });
  await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  return raw;
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.consumedAt || record.expiresAt < new Date()) throw badRequest('Invalid or expired token');
  const hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hash } });
  await prisma.verificationToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  // invalidate other sessions
  await prisma.session.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return record.userId;
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized();
  const ok = await verifyPassword(user.passwordHash, current);
  if (!ok) throw badRequest('Current password incorrect');
  const passwordHash = await hashPassword(next);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return true;
}