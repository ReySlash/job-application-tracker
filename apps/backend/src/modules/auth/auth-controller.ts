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


// Handler for user signup
export const signupHandler: RequestHandler = async (req, res) => {
  const validationResult = authCredentialsSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: z.flattenError(validationResult.error) });
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
    });

    return res.status(500).json({ error: 'Internal server error' });
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
    return res.status(400).json({ error: z.flattenError(validationResult.error) });
  }

  const { email, password } = validationResult.data;

  try {
    const authResult = await login(email, password);

    setRefreshTokenCookie(res, authResult.refreshToken, authResult.refreshTokenExpiresAt);

    return res.status(200).json({
      user: authResult.user,
      accessToken: authResult.accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const demoLoginHandler: RequestHandler = async (_req, res) => {
  try {
    const authResult = await createDemoLogin();

    setRefreshTokenCookie(res, authResult.refreshToken, authResult.refreshTokenExpiresAt);

    return res.status(200).json({
      user: authResult.user,
      accessToken: authResult.accessToken,
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPasswordHandler: RequestHandler = async (req, res) => {
  const validationResult = forgotPasswordSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: z.flattenError(validationResult.error) });
  }

  try {
    await forgotPassword(validationResult.data.email);
    return res.status(200).json({
      message: 'If that email is registered, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password flow failed', {
      email: validationResult.data.email,
      error,
    });

    return res.status(200).json({
      message: 'If that email is registered, a password reset link has been sent.',
    });
  }
};

export const resetPasswordHandler: RequestHandler = async (req, res) => {
  const validationResult = resetPasswordSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: z.flattenError(validationResult.error) });
  }

  try {
    await resetPassword(validationResult.data.token, validationResult.data.password);
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handler for access-token refresh
export const refreshHandler: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  try {
    const authResult = await refresh(refreshToken);

    setRefreshTokenCookie(res, authResult.refreshToken, authResult.refreshTokenExpiresAt);

    return res.status(200).json({
      user: authResult.user,
      accessToken: authResult.accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handler for user logout
export const logoutHandler: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  try {
    await logout(refreshToken);
    clearRefreshTokenCookie(res);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Handler for the current authenticated user
export const meHandler: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
