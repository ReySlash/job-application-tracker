import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/errors.js';
import { verifiedUser } from './helpers/auth-fixtures.js';

const {
  mockPrisma,
  mockCreateDemoUser,
  mockRefreshTokenExpiresAt,
} = vi.hoisted(() => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  return {
    mockPrisma: prisma,
    mockCreateDemoUser: vi.fn(),
    mockRefreshTokenExpiresAt: new Date('2030-01-08T00:00:00.000Z'),
  };
});

vi.mock('../src/db.js', () => ({
  default: mockPrisma,
}));

vi.mock('../src/demo/demo-services.js', () => ({
  createDemoUser: mockCreateDemoUser,
}));

vi.mock('../src/config/env.js', () => ({
  getRefreshTokenExpiresAt: () => mockRefreshTokenExpiresAt,
}));

vi.mock('../src/lib/tokens.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/tokens.js')>();

  return {
    ...actual,
    generateAccessToken: vi.fn(() => 'access-token'),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
    hashRefreshToken: vi.fn((token: string) => `hashed:${token}`),
  };
});

import {
  createDemoLogin,
  getCurrentUser,
  logout,
  refresh,
} from '../src/modules/auth/auth-service.js';

function resetPrismaMocks() {
  for (const group of Object.values(mockPrisma)) {
    if (typeof group === 'function') {
      group.mockReset();
      continue;
    }

    for (const fn of Object.values(group)) {
      fn.mockReset();
    }
  }

  mockPrisma.$transaction.mockImplementation(async (operations: Promise<unknown>[]) => Promise.all(operations));
}

describe('auth-service', () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockCreateDemoUser.mockReset();
  });

  it('creates a demo login and stores a refresh token', async () => {
    mockCreateDemoUser.mockResolvedValue(verifiedUser);
    mockPrisma.refreshToken.create.mockResolvedValue({
      id: 'refresh-token-1',
    });

    await expect(createDemoLogin()).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: mockRefreshTokenExpiresAt,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        isDemo: verifiedUser.isDemo,
        isEmailVerified: verifiedUser.isEmailVerified,
      },
    });

    expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'hashed:refresh-token',
        userId: verifiedUser.id,
        expiresAt: mockRefreshTokenExpiresAt,
      },
    });
  });

  it('rotates refresh tokens for a valid stored session', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'stored-refresh-token',
      tokenHash: 'hashed:refresh-token',
      revokedAt: null,
      expiresAt: new Date('2030-01-07T00:00:00.000Z'),
      user: verifiedUser,
    });
    mockPrisma.refreshToken.update.mockResolvedValue({
      id: 'stored-refresh-token',
    });
    mockPrisma.refreshToken.create.mockResolvedValue({
      id: 'next-refresh-token',
    });

    await expect(refresh('refresh-token')).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: mockRefreshTokenExpiresAt,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        isDemo: verifiedUser.isDemo,
        isEmailVerified: verifiedUser.isEmailVerified,
      },
    });
  });

  it('rejects invalid refresh tokens', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

    await expect(refresh('missing-token')).rejects.toMatchObject<AppError>({
      message: 'Invalid refresh token',
      statusCode: 401,
    });
  });

  it('revokes a stored refresh token on logout', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'stored-refresh-token',
      revokedAt: null,
    });
    mockPrisma.refreshToken.update.mockResolvedValue({
      id: 'stored-refresh-token',
    });

    await expect(logout('refresh-token')).resolves.toBeUndefined();

    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'stored-refresh-token' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('returns the current user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(verifiedUser);

    await expect(getCurrentUser(verifiedUser.id)).resolves.toEqual({
      id: verifiedUser.id,
      email: verifiedUser.email,
      isDemo: verifiedUser.isDemo,
      isEmailVerified: verifiedUser.isEmailVerified,
    });
  });

  it('throws when the current user cannot be found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(getCurrentUser('missing-user')).rejects.toMatchObject<AppError>({
      message: 'User not found',
      statusCode: 404,
    });
  });
});
