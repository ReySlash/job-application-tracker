import type { RequestHandler } from 'express';
import { z } from 'zod';

import { Prisma } from '../../generated/prisma/client.js';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../lib/cookies.js';
import { AppError } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import authCredentialsSchema, {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth-schemas.js';
import {
  createDemoLogin,
  createUser,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  resetPassword,
  verifyEmail,
} from './auth-service.js';

const GENERIC_SERVER_ERROR = { error: 'Internal server error' };
const FORGOT_PASSWORD_SUCCESS_MESSAGE = {
  message: 'If that email is registered, a password reset link has been sent.',
};

function getValidationError(error: z.ZodError) {
  return { error: z.flattenError(error) };
}

function respondWithAppError(res: Parameters<RequestHandler>[1], error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json(GENERIC_SERVER_ERROR);
}

function respondWithAuthResult(
  res: Parameters<RequestHandler>[1],
  authResult: Awaited<ReturnType<typeof login>>,
) {
  setRefreshTokenCookie(res, authResult.refreshToken, authResult.refreshTokenExpiresAt);

  return res.status(200).json({
    user: authResult.user,
    accessToken: authResult.accessToken,
  });
}


export const signupHandler: RequestHandler = async (req, res) => {
  const validationResult = authCredentialsSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json(getValidationError(validationResult.error));
  }

  const { email, password } = validationResult.data;

  try {
    const result = await createUser(email, password);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }

    console.error('Signup flow failed', {
      email,
      error,
      gmailUserConfigured: Boolean(env.gmailUser),
      gmailAppPasswordConfigured: Boolean(env.gmailAppPassword),
      backendUrl: env.backendUrl,
      frontendVerifyEmailUrl: env.frontendVerifyEmailUrl,
    });

    return res.status(500).json(GENERIC_SERVER_ERROR);
  }
};

export const verifyEmailHandler: RequestHandler = async (req, res) => {
  const validationResult = verifyEmailSchema.safeParse(req.query);

  if (!validationResult.success) {
    return res.redirect(
      302,
      `${env.frontendVerifyEmailUrl}?status=error&message=This%20verification%20link%20is%20invalid%20or%20has%20expired.`,
    );
  }

  try {
    const redirectUrl = await verifyEmail(validationResult.data.token);
    return res.redirect(302, redirectUrl);
  } catch {
    return res.redirect(302, `${env.frontendVerifyEmailUrl}?status=error&message=Unable%20to%20verify%20your%20email.`);
  }
};

// Handler for user login
export const loginHandler: RequestHandler = async (req, res) => {
  const validationResult = authCredentialsSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json(getValidationError(validationResult.error));
  }

  const { email, password } = validationResult.data;

  try {
    const authResult = await login(email, password);
    return respondWithAuthResult(res, authResult);
  } catch (error) {
    return respondWithAppError(res, error);
  }
};

export const demoLoginHandler: RequestHandler = async (_req, res) => {
  try {
    const authResult = await createDemoLogin();
    return respondWithAuthResult(res, authResult);
  } catch {
    return res.status(500).json(GENERIC_SERVER_ERROR);
  }
};

export const forgotPasswordHandler: RequestHandler = async (req, res) => {
  const validationResult = forgotPasswordSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json(getValidationError(validationResult.error));
  }

  try {
    await forgotPassword(validationResult.data.email);
    return res.status(200).json(FORGOT_PASSWORD_SUCCESS_MESSAGE);
  } catch (error) {
    console.error('Forgot password flow failed', {
      email: validationResult.data.email,
      error,
      gmailUserConfigured: Boolean(env.gmailUser),
      gmailAppPasswordConfigured: Boolean(env.gmailAppPassword),
      frontendResetPasswordUrl: env.frontendResetPasswordUrl,
    });

    return res.status(200).json(FORGOT_PASSWORD_SUCCESS_MESSAGE);
  }
};

export const resetPasswordHandler: RequestHandler = async (req, res) => {
  const validationResult = resetPasswordSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json(getValidationError(validationResult.error));
  }

  try {
    await resetPassword(validationResult.data.token, validationResult.data.password);
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return respondWithAppError(res, error);
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
