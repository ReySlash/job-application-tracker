import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '../src/config/env.js';
import { generateAccessToken } from '../src/lib/tokens.js';

const { verifyIdTokenMock, syncFirebaseUserMock } = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
  syncFirebaseUserMock: vi.fn(),
}));

vi.mock('../src/lib/firebase-admin.js', () => ({
  getFirebaseAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

vi.mock('../src/modules/auth/firebase-auth-service.js', () => ({
  syncFirebaseUser: syncFirebaseUserMock,
}));

import { requireAuth } from '../src/middleware/auth-middleware.js';

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests with no authorization header', async () => {
    const req = {
      header: vi.fn().mockReturnValue(undefined),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects malformed bearer tokens', async () => {
    const req = {
      header: vi.fn().mockReturnValue('Token abc'),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid authorization header format' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches a synced Firebase user for valid Firebase tokens', async () => {
    verifyIdTokenMock.mockResolvedValue({
      uid: 'firebase-user-1',
      email: 'verified@example.com',
      email_verified: true,
    });
    syncFirebaseUserMock.mockResolvedValue({
      id: 'db-user-1',
      email: 'verified@example.com',
      isDemo: false,
      isEmailVerified: true,
      firebaseUid: 'firebase-user-1',
    });

    const req = {
      header: vi.fn().mockReturnValue('Bearer firebase-token'),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(syncFirebaseUserMock).toHaveBeenCalledWith({
      uid: 'firebase-user-1',
      email: 'verified@example.com',
      emailVerified: true,
    });
    expect(req).toMatchObject({
      user: {
        id: 'db-user-1',
        email: 'verified@example.com',
        firebaseUid: 'firebase-user-1',
        isDemo: false,
      },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects unverified Firebase users', async () => {
    verifyIdTokenMock.mockResolvedValue({
      uid: 'firebase-user-1',
      email: 'pending@example.com',
      email_verified: false,
    });

    const req = {
      header: vi.fn().mockReturnValue('Bearer firebase-token'),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Verify your email before continuing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('falls back to legacy demo access tokens', async () => {
    verifyIdTokenMock.mockRejectedValue(new Error('Firebase token invalid'));

    const accessToken = generateAccessToken({
      userId: 'demo-user-1',
      email: 'demo@example.com',
      isDemo: true,
    });
    const req = {
      header: vi.fn().mockReturnValue(`Bearer ${accessToken}`),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(req).toMatchObject({
      user: {
        id: 'demo-user-1',
        email: 'demo@example.com',
        isDemo: true,
      },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects expired legacy demo access tokens', async () => {
    verifyIdTokenMock.mockRejectedValue(new Error('Firebase token invalid'));

    const expiredToken = jwt.sign(
      {
        userId: 'demo-user-1',
        email: 'demo@example.com',
        isDemo: true,
      },
      env.jwtSecret,
      { expiresIn: -1 },
    );
    const req = {
      header: vi.fn().mockReturnValue(`Bearer ${expiredToken}`),
    };
    const res = createResponse();
    const next = vi.fn();

    await requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired access token' });
    expect(next).not.toHaveBeenCalled();
  });
});
