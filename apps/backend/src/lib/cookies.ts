import type { Response } from 'express';
import { env } from '../config/env.js';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.nodeEnv === 'production',
    path: '/',
  };
}

// Helper function to set the refresh token cookie in the response
export function setRefreshTokenCookie(res: Response, refreshToken: string, expiresAt: Date) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...getRefreshTokenCookieOptions(),
    expires: expiresAt,
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
}

export { REFRESH_TOKEN_COOKIE_NAME };
