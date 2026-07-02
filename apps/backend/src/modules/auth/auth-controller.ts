import type { RequestHandler } from 'express';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../lib/cookies.js';
import { AppError } from '../../lib/errors.js';
import {
  type AuthResult,
  createDemoLogin,
  getCurrentUser,
  logout,
  refresh,
} from './auth-service.js';

const GENERIC_SERVER_ERROR = { error: 'Internal server error' };

function respondWithAppError(res: Parameters<RequestHandler>[1], error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json(GENERIC_SERVER_ERROR);
}

function respondWithAuthResult(
  res: Parameters<RequestHandler>[1],
  authResult: AuthResult,
) {
  setRefreshTokenCookie(res, authResult.refreshToken, authResult.refreshTokenExpiresAt);

  return res.status(200).json({
    user: authResult.user,
    accessToken: authResult.accessToken,
  });
}

export const demoLoginHandler: RequestHandler = async (_req, res) => {
  try {
    const authResult = await createDemoLogin();
    return respondWithAuthResult(res, authResult);
  } catch {
    return res.status(500).json(GENERIC_SERVER_ERROR);
  }
};

export const refreshHandler: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  try {
    const authResult = await refresh(refreshToken);
    return respondWithAuthResult(res, authResult);
  } catch (error) {
    return respondWithAppError(res, error);
  }
};

export const logoutHandler: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  try {
    await logout(refreshToken);
    clearRefreshTokenCookie(res);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch {
    return res.status(500).json(GENERIC_SERVER_ERROR);
  }
};

export const meHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({ user });
  } catch (error) {
    return respondWithAppError(res, error);
  }
};
