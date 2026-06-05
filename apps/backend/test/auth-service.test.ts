import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/lib/errors.js';
import {
  emailVerificationTokenRecord,
  refreshTokenRecord,
  unverifiedUser,
  verifiedUser,
} from './helpers/auth-fixtures.js';

const {
  mockPrisma,
  mockSendEmail,
  mockCreateDemoUser,
  mockEnv,
  mockRefreshTokenExpiresAt,
  mockPasswordResetTokenExpiresAt,
  mockVerifyEmailTokenExpiresAt,
} = vi.hoisted(() => {
  const prisma = {
    user: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  return {
    mockPrisma: prisma,
    mockSendEmail: vi.fn(),
    mockCreateDemoUser: vi.fn(),
    mockEnv: {
      jwtSecret: 'test-secret',
      nodeEnv: 'test',
      accessTokenTtlSeconds: 900,
      refreshTokenTtlDays: 7,
      frontendUrl: 'http://localhost:5173',
      passwordResetTokenTtlMinutes: 60,
      verifyEmailTokenTtlMinutes: 1440,
      frontendResetPasswordUrl: 'http://localhost:5173/reset-password',
      frontendVerifyEmailUrl: 'http://localhost:5173/verify-email',
      backendUrl: 'http://localhost:4000',
      gmailUser: 'mailer@example.com',
      gmailAppPassword: 'app-password',
      emailFrom: 'Job Application Tracker <mailer@example.com>',
      passwordResetEmailSubject: 'Reset password',
      verifyEmailSubject: 'Verify email',
    },
    mockRefreshTokenExpiresAt: new Date('2030-01-08T00:00:00.000Z'),
    mockPasswordResetTokenExpiresAt: new Date('2030-01-01T01:00:00.000Z'),
    mockVerifyEmailTokenExpiresAt: new Date('2030-01-02T00:00:00.000Z'),
  };
});

vi.mock('../src/db.js', () => ({
  default: mockPrisma,
}));

vi.mock('../src/lib/email.js', () => ({
  sendEmail: mockSendEmail,
}));

vi.mock('../src/demo/demo-services.js', () => ({
  createDemoUser: mockCreateDemoUser,
}));

vi.mock('../src/config/env.js', () => ({
  env: mockEnv,
  getRefreshTokenExpiresAt: () => mockRefreshTokenExpiresAt,
  getPasswordResetTokenExpiresAt: () => mockPasswordResetTokenExpiresAt,
  getVerifyEmailTokenExpiresAt: () => mockVerifyEmailTokenExpiresAt,
}));

vi.mock('../src/lib/tokens.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/tokens.js')>();

  return {
    ...actual,
    generateAccessToken: vi.fn(() => 'access-token'),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
    hashRefreshToken: vi.fn((token: string) => `hashed:${token}`),
    generatePasswordResetToken: vi.fn(() => 'reset-raw-token'),
    hashPasswordResetToken: vi.fn((token: string) => `reset-hash:${token}`),
    generateEmailVerificationToken: vi.fn(() => 'verify-raw-token'),
    hashEmailVerificationToken: vi.fn((token: string) => `verify-hash:${token}`),
  };
});

import {
  createUser,
  forgotPassword,
  login,
  refresh,
  resetPassword,
  verifyEmail,
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
    mockSendEmail.mockReset();
    mockCreateDemoUser.mockReset();
  });

  it('creates an unverified user and sends a verification email on signup', async () => {
    mockPrisma.user.create.mockResolvedValue({
      ...unverifiedUser,
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.emailVerificationToken.create.mockResolvedValue({
      id: 'verify-token-1',
      tokenHash: 'verify-hash:verify-raw-token',
    });
    mockSendEmail.mockResolvedValue(undefined);

    const result = await createUser('pending@example.com', 'Password123!');

    expect(result).toEqual({
      message: 'Account created. Check your email to verify your account before signing in.',
    });
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'pending@example.com',
        passwordHash: expect.any(String),
        isDemo: false,
      },
    });
    expect(mockPrisma.emailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'verify-hash:verify-raw-token',
        userId: unverifiedUser.id,
        expiresAt: mockVerifyEmailTokenExpiresAt,
      },
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'pending@example.com',
        subject: 'Verify email',
      }),
    );
  });

  it('rolls back signup when verification email delivery fails', async () => {
    mockPrisma.user.create.mockResolvedValue({
      ...unverifiedUser,
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.emailVerificationToken.create.mockResolvedValue({
      id: 'verify-token-1',
      tokenHash: 'verify-hash:verify-raw-token',
    });
    mockPrisma.user.delete.mockResolvedValue(unverifiedUser);
    mockSendEmail.mockRejectedValue(new Error('smtp failure'));

    await expect(createUser('pending@example.com', 'Password123!')).rejects.toThrow('smtp failure');

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: {
        id: unverifiedUser.id,
      },
    });
  });

  it('rejects login for unverified non-demo users', async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    mockPrisma.user.findUnique.mockResolvedValue({
      ...unverifiedUser,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(login(unverifiedUser.email, 'Password123!')).rejects.toMatchObject<AppError>({
      message: 'Verify your email before signing in',
      statusCode: 403,
    });
  });

  it('rejects refresh when the token belongs to an unverified user', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      ...refreshTokenRecord,
      user: {
        ...unverifiedUser,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await expect(refresh('refresh-token')).rejects.toMatchObject<AppError>({
      message: 'Verify your email before signing in',
      statusCode: 403,
    });
  });

  it('returns early from forgot-password when the email does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await forgotPassword('missing@example.com');

    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('creates a reset token and sends an email for existing users', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...verifiedUser,
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.passwordResetToken.create.mockResolvedValue({
      id: 'password-reset-1',
      tokenHash: 'reset-hash:reset-raw-token',
    });
    mockSendEmail.mockResolvedValue(undefined);

    await forgotPassword(verifiedUser.email);

    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        tokenHash: 'reset-hash:reset-raw-token',
        userId: verifiedUser.id,
        expiresAt: mockPasswordResetTokenExpiresAt,
      },
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: verifiedUser.email,
        subject: 'Reset password',
      }),
    );
  });

  it('removes a password reset token when email delivery fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...verifiedUser,
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.passwordResetToken.create.mockResolvedValue({
      id: 'password-reset-1',
      tokenHash: 'reset-hash:reset-raw-token',
    });
    mockPrisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    mockSendEmail.mockRejectedValue(new Error('smtp failure'));

    await forgotPassword(verifiedUser.email);

    expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: 'reset-hash:reset-raw-token',
        userId: verifiedUser.id,
      },
    });
  });

  it('marks the password as updated and revokes active tokens on password reset', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'password-reset-1',
      tokenHash: 'reset-hash:reset-raw-token',
      userId: verifiedUser.id,
      expiresAt: new Date('2030-01-01T01:00:00.000Z'),
      usedAt: null,
      createdAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    mockPrisma.user.update.mockResolvedValue(undefined);
    mockPrisma.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    await resetPassword('reset-raw-token', 'UpdatedPassword123!');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: verifiedUser.id },
      data: {
        passwordHash: expect.any(String),
      },
    });
    expect(mockPrisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: verifiedUser.id,
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: verifiedUser.id,
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('rejects expired reset tokens', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'password-reset-1',
      tokenHash: 'reset-hash:reset-raw-token',
      userId: verifiedUser.id,
      expiresAt: new Date('2000-01-01T00:00:00.000Z'),
      usedAt: null,
      createdAt: new Date('1999-12-31T00:00:00.000Z'),
    });

    await expect(resetPassword('reset-raw-token', 'UpdatedPassword123!')).rejects.toMatchObject<AppError>({
      message: 'Invalid or expired reset token',
      statusCode: 400,
    });
  });

  it('returns an error verification redirect for invalid email tokens', async () => {
    mockPrisma.emailVerificationToken.findFirst.mockResolvedValue(null);

    const redirectUrl = await verifyEmail('invalid-token');

    expect(redirectUrl).toBe(
      'http://localhost:5173/verify-email?status=error&message=This+verification+link+is+invalid+or+has+expired.',
    );
  });

  it('marks the user verified and returns a success redirect for valid email tokens', async () => {
    mockPrisma.emailVerificationToken.findFirst.mockResolvedValue({
      ...emailVerificationTokenRecord,
      user: {
        ...unverifiedUser,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    mockPrisma.user.update.mockResolvedValue(undefined);
    mockPrisma.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });

    const redirectUrl = await verifyEmail('verify-raw-token');

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: unverifiedUser.id },
      data: { isEmailVerified: true },
    });
    expect(mockPrisma.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: unverifiedUser.id,
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(redirectUrl).toBe(
      'http://localhost:5173/verify-email?status=success&message=Your+email+has+been+verified.+You+can+sign+in+now.',
    );
  });
});
