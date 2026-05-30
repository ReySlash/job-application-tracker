import type { Response } from 'express';
import { env } from '../config/env.js';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

// Helper function to set the refresh token cookie in the response
export function setRefreshTokenCookie(res: Response, refreshToken: string, expiresAt: Date) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export { REFRESH_TOKEN_COOKIE_NAME };
