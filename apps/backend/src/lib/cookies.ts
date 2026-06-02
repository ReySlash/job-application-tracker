import type { Response } from 'express';
import { env } from '../config/env.js';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

function getRefreshTokenCookieOptions() {
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
    domain: env.cookieDomain,
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
