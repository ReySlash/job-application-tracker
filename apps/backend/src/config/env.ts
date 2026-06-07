const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 7; // 7 days
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_JWT_SECRET = 'dev-secret-change-me';
const PRODUCTION_REQUIRED_ENV_KEYS = [
  'DATABASE_URL',
  'FRONTEND_URL',
] as const;

function parseFrontendUrls(value: string | undefined) {
  const candidates = (value ?? DEFAULT_FRONTEND_URL)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return candidates.length > 0 ? candidates : [DEFAULT_FRONTEND_URL];
}

const frontendUrlValue = process.env.FRONTEND_URL;
const frontendUrls = parseFrontendUrls(frontendUrlValue);

function getNumberEnvValue(value: string | undefined, fallback: number) {
  return Number(value ?? fallback);
}

function normalizePrivateKey(value: string | undefined) {
  return value?.replace(/\\n/g, '\n');
}

// Centralized environment configuration
export const env = {
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  accessTokenTtlSeconds: getNumberEnvValue(
    process.env.ACCESS_TOKEN_TTL_SECONDS,
    DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  ),
  refreshTokenTtlDays: getNumberEnvValue(process.env.REFRESH_TOKEN_TTL_DAYS, DEFAULT_REFRESH_TOKEN_TTL_DAYS),
  frontendUrl: frontendUrls[0],
  frontendUrls,
  cookieDomain: process.env.COOKIE_DOMAIN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

function assertProductionEnv() {
  if (env.nodeEnv !== 'production') {
    return;
  }

  const missingValues: string[] = PRODUCTION_REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

  if (!process.env.JWT_SECRET || env.jwtSecret === DEFAULT_JWT_SECRET) {
    missingValues.push('JWT_SECRET');
  }

  if (!env.firebaseProjectId) {
    missingValues.push('FIREBASE_PROJECT_ID');
  }

  if (!env.firebaseClientEmail) {
    missingValues.push('FIREBASE_CLIENT_EMAIL');
  }

  if (!env.firebasePrivateKey) {
    missingValues.push('FIREBASE_PRIVATE_KEY');
  }

  if (missingValues.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingValues.join(', ')}`);
  }
}

assertProductionEnv();

// Helper function to calculate refresh token expiration date
export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}
