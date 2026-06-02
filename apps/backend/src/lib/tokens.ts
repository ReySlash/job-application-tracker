import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthUserPayload = {
  userId: string;
  email: string;
  isDemo: boolean;
};

export function generateAccessToken(payload: AuthUserPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.accessTokenTtlSeconds,
  });
}

export function verifyAccessToken(token: string): AuthUserPayload {
  const decodedToken = jwt.verify(token, env.jwtSecret);

  if (
    typeof decodedToken !== 'object' ||
    decodedToken === null ||
    typeof decodedToken.userId !== 'string' ||
    typeof decodedToken.email !== 'string' ||
    typeof decodedToken.isDemo !== 'boolean'
  ) {
    throw new Error('Invalid access token payload');
  }

  return {
    userId: decodedToken.userId,
    email: decodedToken.email,
    isDemo: decodedToken.isDemo,
  };
}

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateEmailVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
