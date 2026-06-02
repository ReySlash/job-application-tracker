import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { env } from '../src/config/env.js';
import { requireAuth } from '../src/middleware/auth-middleware.js';
import { generateAccessToken } from '../src/lib/tokens.js';

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('requireAuth middleware', () => {
  it('rejects requests with no authorization header', () => {
    const req = {
      header: vi.fn().mockReturnValue(undefined),
    };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects malformed bearer tokens', () => {
    const req = {
      header: vi.fn().mockReturnValue('Token abc'),
    };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid authorization header format' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects expired access tokens', () => {
    const expiredToken = jwt.sign(
      {
        userId: 'user-1',
        email: 'verified@example.com',
        isDemo: false,
      },
      env.jwtSecret,
      { expiresIn: -1 },
    );
    const req = {
      header: vi.fn().mockReturnValue(`Bearer ${expiredToken}`),
    };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired access token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the decoded user and calls next for valid tokens', () => {
    const accessToken = generateAccessToken({
      userId: 'user-1',
      email: 'verified@example.com',
      isDemo: false,
    });
    const req = {
      header: vi.fn().mockReturnValue(`Bearer ${accessToken}`),
    };
    const res = createResponse();
    const next = vi.fn();

    requireAuth(req as never, res as never, next);

    expect(req).toMatchObject({
      user: {
        id: 'user-1',
        email: 'verified@example.com',
        isDemo: false,
      },
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
