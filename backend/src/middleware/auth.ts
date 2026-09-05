import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { unauthorized, forbidden } from '../errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthedRequest extends Request {
  user?: { id: string; role: string; sid: string };
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('Missing bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken<{ sub: string; role: string; sid: string }>(token);
    req.user = { id: payload.sub, role: payload.role, sid: payload.sid };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
    next();
  };
}

// requireKyc — blocks dashboard-style routes until the user has finished
// the country-aware KYC step. Reads the latest status from the DB so a
// PENDING user gets 403 even if their JWT was issued before submission.
export function requireKyc(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  prisma.user.findUnique({ where: { id: req.user.id }, select: { kycStatus: true, signupStep: true } })
    .then((u) => {
      if (!u) return next(unauthorized());
      if (u.kycStatus === 'APPROVED') return next();
      res.status(403).json({
        error: 'Identity verification required',
        code: 'KYC_REQUIRED',
        kycStatus: u.kycStatus,
        signupStep: u.signupStep,
        redirect: '/verify-identity',
      });
    })
    .catch(next);
}