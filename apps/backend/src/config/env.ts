const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 7; // 7 days

// Centralized environment configuration
export const env = {
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS), 
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? DEFAULT_REFRESH_TOKEN_TTL_DAYS),  
};

// Helper function to calculate refresh token expiration date
export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
}
