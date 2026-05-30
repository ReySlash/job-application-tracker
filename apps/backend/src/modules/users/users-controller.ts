import type { RequestHandler } from 'express';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma/client.js';
import createUserSchema from './users-schema.js';
import { createUser } from './users-service.js';

export const createUserHandler: RequestHandler = async (req, res) => {
  const validationResult = createUserSchema.safeParse(req.body);

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
