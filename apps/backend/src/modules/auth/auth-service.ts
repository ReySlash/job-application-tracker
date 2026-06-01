import bcrypt from 'bcrypt';
import prisma from '../../db.js';
import { AppError } from '../../lib/errors.js';
import { sendEmail } from '../../lib/email.js';
import { env, getPasswordResetTokenExpiresAt, getRefreshTokenExpiresAt } from '../../config/env.js';
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  hashPasswordResetToken,
  hashRefreshToken,
} from '../../lib/tokens.js';
import { createDemoUser } from '../../demo/demo-services.js';

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

type AuthUser = AuthResult['user'];

function createPasswordResetEmail(resetUrl: string) {
  const expiresInMinutes = env.passwordResetTokenTtlMinutes;

  return {
    subject: env.passwordResetEmailSubject,
    text: [
      'We received a request to reset your Job Application Tracker password.',
      '',
      `Reset your password: ${resetUrl}`,
      '',
      `This link expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.`,
    ].join('\n'),
    html: [
      '<p>We received a request to reset your Job Application Tracker password.</p>',
      `<p><a href="${resetUrl}">Reset your password</a></p>`,
      `<p>This link expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
    ].join(''),
  };
}

function toAuthUser(user: {
  id: string;
  email: string;
  isDemo: boolean;
  isEmailVerified: boolean;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    isDemo: user.isDemo,
    isEmailVerified: user.isEmailVerified,
  };
}

async function issueAuthTokens(user: AuthUser): Promise<AuthResult> {
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
    user,
  };
}

export async function createDemoLogin(): Promise<AuthResult> {
  const user = await createDemoUser();
  return issueAuthTokens(toAuthUser(user));
}

export async function createUser(email: string, password: string): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      isDemo: false,
    },
  });

  return issueAuthTokens(toAuthUser(user));
}

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

  return issueAuthTokens(toAuthUser(user));
}

export async function refresh(refreshToken: string | undefined): Promise<AuthResult> {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedRefreshToken = await prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedRefreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (storedRefreshToken.revokedAt) {
    throw new AppError('Refresh token has been revoked', 401);
  }

  if (storedRefreshToken.expiresAt.getTime() <= Date.now()) {
    throw new AppError('Refresh token has expired', 401);
  }

  if (!storedRefreshToken.user) {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = toAuthUser(storedRefreshToken.user);
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    isDemo: user.isDemo,
  });
  const nextRefreshToken = generateRefreshToken();
  const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedRefreshToken.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(nextRefreshToken),
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt,
    user,
  };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedRefreshToken = await prisma.refreshToken.findFirst({
    where: { tokenHash },
  });

  if (!storedRefreshToken || storedRefreshToken.revokedAt) {
    return;
  }

  await prisma.refreshToken.update({
    where: { id: storedRefreshToken.id },
    data: { revokedAt: new Date() },
  });
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toAuthUser(user);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return;
  }

  const rawResetToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawResetToken);
  const resetTokenExpiresAt = getPasswordResetTokenExpiresAt();

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: resetTokenExpiresAt,
    },
  });

  const resetUrl = new URL(env.frontendResetPasswordUrl);
  resetUrl.searchParams.set('token', rawResetToken);
  const resetUrlString = resetUrl.toString();

  if (env.smtpUrl && env.emailFrom) {
    try {
      const emailMessage = createPasswordResetEmail(resetUrlString);

      await sendEmail({
        to: user.email,
        subject: emailMessage.subject,
        text: emailMessage.text,
        html: emailMessage.html,
      });
    } catch (error) {
      console.error('Failed to send password reset email', {
        email: user.email,
        error,
      });
    }
  } else if (env.nodeEnv === 'production') {
    console.error('Password reset email delivery is not configured', {
      email: user.email,
      smtpConfigured: Boolean(env.smtpUrl),
      emailFromConfigured: Boolean(env.emailFrom),
    });
  } else {
    console.info(`Password reset link for ${user.email}: ${resetUrlString}`);
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const tokenHash = hashPasswordResetToken(token);
  const passwordResetToken = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
  });

  if (!passwordResetToken || passwordResetToken.usedAt || passwordResetToken.expiresAt.getTime() <= Date.now()) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: passwordResetToken.userId,
        usedAt: null,
      },
      data: { usedAt: now },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: passwordResetToken.userId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    }),
  ]);
}
