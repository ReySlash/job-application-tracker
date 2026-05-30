import bcrypt from 'bcrypt';
import prisma from '../../db.js';
import { AppError } from '../../lib/errors.js';
import { getRefreshTokenExpiresAt } from '../../config/env.js';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../../lib/tokens.js';

export async function createUser(email: string, password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      isDemo: false,
    },
  });
}

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: {
    id: string;
    email: string;
    isDemo: boolean;
    isEmailVerified: boolean;
  };
};

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    isDemo: user.isDemo,
  });
  const refreshToken = generateRefreshToken();
  const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
    user: {
      id: user.id,
      email: user.email,
      isDemo: user.isDemo,
      isEmailVerified: user.isEmailVerified,
    },
  };
}
