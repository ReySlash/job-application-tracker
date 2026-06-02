export const verifiedUser = {
  id: 'user-1',
  email: 'verified@example.com',
  isDemo: false,
  isEmailVerified: true,
};

export const unverifiedUser = {
  id: 'user-2',
  email: 'pending@example.com',
  isDemo: false,
  isEmailVerified: false,
};

export const demoUser = {
  id: 'demo-user',
  email: 'demo@example.com',
  isDemo: true,
  isEmailVerified: false,
};

export const refreshTokenRecord = {
  id: 'refresh-token-1',
  tokenHash: 'hashed:refresh-token',
  userId: verifiedUser.id,
  expiresAt: new Date('2030-01-10T00:00:00.000Z'),
  revokedAt: null,
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
};

export const passwordResetTokenRecord = {
  id: 'password-reset-1',
  tokenHash: 'reset-hash:reset-raw-token',
  userId: verifiedUser.id,
  expiresAt: new Date('2030-01-01T01:00:00.000Z'),
  usedAt: null,
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
};

export const emailVerificationTokenRecord = {
  id: 'verify-token-1',
  tokenHash: 'verify-hash:verify-raw-token',
  userId: unverifiedUser.id,
  expiresAt: new Date('2030-01-02T00:00:00.000Z'),
  usedAt: null,
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
};
