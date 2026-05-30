import type { RequestHandler } from 'express';
import { z } from 'zod';

import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import { setRefreshTokenCookie } from '../../lib/cookies.js';
import authCredentialsSchema from './auth-schemas.js';
import { createUser, login } from './auth-service.js';


// Handler for user signup
export const signupHandler: RequestHandler = async (req, res) => {
  const validationResult = authCredentialsSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: z.flattenError(validationResult.error) });
  }

  const { email, password } = validationResult.data;

  try {
    await createUser(email, password);
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }

    return res.status(500).json({ error: 'Internal server error' });
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
