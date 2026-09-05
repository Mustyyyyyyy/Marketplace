import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  sid: string;
}

export function signAccess(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL } as SignOptions);
}

export function signRefresh(payload: { sub: string; sid: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_TTL } as SignOptions);
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}