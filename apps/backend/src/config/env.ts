const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 7; // 7 days
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_BACKEND_URL = 'http://localhost:4000';
const DEFAULT_PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;
const DEFAULT_VERIFY_EMAIL_TOKEN_TTL_MINUTES = 60 * 24;
const DEFAULT_PASSWORD_RESET_EMAIL_SUBJECT = 'Reset your Job Application Tracker password';
const DEFAULT_VERIFY_EMAIL_SUBJECT = 'Verify your Job Application Tracker email';
const DEFAULT_JWT_SECRET = 'dev-secret-change-me';

function parseFrontendUrls(value: string | undefined) {
  const candidates = (value ?? DEFAULT_FRONTEND_URL)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return candidates.length > 0 ? candidates : [DEFAULT_FRONTEND_URL];
}

const frontendUrls = parseFrontendUrls(process.env.FRONTEND_URL);

// Centralized environment configuration
export const env = {
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS), 
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? DEFAULT_REFRESH_TOKEN_TTL_DAYS),
  frontendUrl: frontendUrls[0],
  frontendUrls,
  passwordResetTokenTtlMinutes: Number(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? DEFAULT_PASSWORD_RESET_TOKEN_TTL_MINUTES,
  ),
  verifyEmailTokenTtlMinutes: Number(
    process.env.VERIFY_EMAIL_TOKEN_TTL_MINUTES ?? DEFAULT_VERIFY_EMAIL_TOKEN_TTL_MINUTES,
  ),
  frontendResetPasswordUrl:
    process.env.FRONTEND_RESET_PASSWORD_URL ?? `${process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL}/reset-password`,
  frontendVerifyEmailUrl:
    process.env.FRONTEND_VERIFY_EMAIL_URL ?? `${process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL}/verify-email`,
  backendUrl: process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL,
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  cookieDomain: process.env.COOKIE_DOMAIN,
  passwordResetEmailSubject:
    process.env.PASSWORD_RESET_EMAIL_SUBJECT ?? DEFAULT_PASSWORD_RESET_EMAIL_SUBJECT,
  verifyEmailSubject: process.env.VERIFY_EMAIL_SUBJECT ?? DEFAULT_VERIFY_EMAIL_SUBJECT,
};

function assertProductionEnv() {
  if (env.nodeEnv !== 'production') {
    return;
  }

  const missingValues: string[] = [];

  if (!process.env.DATABASE_URL) {
    missingValues.push('DATABASE_URL');
  }

  if (!process.env.JWT_SECRET || env.jwtSecret === DEFAULT_JWT_SECRET) {
    missingValues.push('JWT_SECRET');
  }

  if (!process.env.FRONTEND_URL) {
    missingValues.push('FRONTEND_URL');
  }

  if (!process.env.BACKEND_URL) {
    missingValues.push('BACKEND_URL');
  }

  if (!env.gmailUser) {
    missingValues.push('GMAIL_USER');
  }

  if (!env.gmailAppPassword) {
    missingValues.push('GMAIL_APP_PASSWORD');
  }

  if (missingValues.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingValues.join(', ')}`);
  }
}

assertProductionEnv();

// Helper function to calculate refresh token expiration date
export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
}

export function getPasswordResetTokenExpiresAt() {
  return new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000);
}

export function getVerifyEmailTokenExpiresAt() {
  return new Date(Date.now() + env.verifyEmailTokenTtlMinutes * 60 * 1000);
}
