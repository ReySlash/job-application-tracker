const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 7; // 7 days
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_PASSWORD_RESET_TOKEN_TTL_MINUTES = 60;
const DEFAULT_PASSWORD_RESET_EMAIL_SUBJECT = 'Reset your Job Application Tracker password';

// Centralized environment configuration
export const env = {
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS), 
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? DEFAULT_REFRESH_TOKEN_TTL_DAYS),
  frontendUrl: process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL,
  passwordResetTokenTtlMinutes: Number(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? DEFAULT_PASSWORD_RESET_TOKEN_TTL_MINUTES,
  ),
  frontendResetPasswordUrl:
    process.env.FRONTEND_RESET_PASSWORD_URL ?? `${process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL}/reset-password`,
  smtpUrl: process.env.SMTP_URL,
  emailFrom: process.env.EMAIL_FROM,
  passwordResetEmailSubject:
    process.env.PASSWORD_RESET_EMAIL_SUBJECT ?? DEFAULT_PASSWORD_RESET_EMAIL_SUBJECT,
};

// Helper function to calculate refresh token expiration date
export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
}

export function getPasswordResetTokenExpiresAt() {
  return new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000);
}
