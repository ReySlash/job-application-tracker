import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifiedUser } from './helpers/auth-fixtures.js';

const {
  createDemoLogin,
  getCurrentUser,
  logout,
  refresh,
  syncFirebaseUserMock,
  verifyIdTokenMock,
} = vi.hoisted(() => ({
  createDemoLogin: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  syncFirebaseUserMock: vi.fn(),
  verifyIdTokenMock: vi.fn(),
}));

vi.mock('../src/modules/auth/auth-service.js', () => ({
  createDemoLogin,
  getCurrentUser,
  logout,
  refresh,
}));

vi.mock('../src/lib/firebase-admin.js', () => ({
  getFirebaseAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

vi.mock('../src/modules/auth/firebase-auth-service.js', () => ({
  syncFirebaseUser: syncFirebaseUserMock,
}));

import { createApp } from '../src/app.js';

describe('auth routes', () => {
  beforeEach(() => {
    createDemoLogin.mockReset();
    getCurrentUser.mockReset();
    logout.mockReset();
    refresh.mockReset();
    syncFirebaseUserMock.mockReset();
    verifyIdTokenMock.mockReset();
  });

  it('returns ok from the health endpoint', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns ok from the readiness endpoint when the database check succeeds', async () => {
    const readinessCheck = vi.fn().mockResolvedValue(undefined);
    const app = createApp({ readinessCheck });

    const response = await request(app).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'ok' });
    expect(readinessCheck).toHaveBeenCalledTimes(1);
  });

  it('returns 503 from the readiness endpoint when the database check fails', async () => {
    const readinessCheck = vi.fn().mockRejectedValue(new Error('db unavailable'));
    const app = createApp({ readinessCheck });

    const response = await request(app).get('/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'unavailable' });
    expect(readinessCheck).toHaveBeenCalledTimes(1);
  });

  it('returns auth data and rotates the cookie on refresh', async () => {
    const app = createApp();
    refresh.mockResolvedValue({
      user: verifiedUser,
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=old-refresh-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: verifiedUser,
      accessToken: 'next-access-token',
    });
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=next-refresh-token');
  });

  it('returns demo auth data and sets the refresh cookie on demo login', async () => {
    const app = createApp();
    createDemoLogin.mockResolvedValue({
      user: verifiedUser,
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    const response = await request(app).post('/api/auth/demo-login');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: verifiedUser,
      accessToken: 'demo-access-token',
    });
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=demo-refresh-token');
  });

  it('clears the refresh cookie on logout', async () => {
    const app = createApp();
    logout.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', 'refreshToken=refresh-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Logged out successfully' });
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
  });

  it('rejects /me without a bearer token', async () => {
    const app = createApp();
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Missing authorization header' });
  });

  it('returns the current user for a valid bearer token', async () => {
    const app = createApp();
    getCurrentUser.mockResolvedValue(verifiedUser);
    verifyIdTokenMock.mockResolvedValue({
      uid: 'firebase-user-1',
      email: verifiedUser.email,
      email_verified: true,
    });
    syncFirebaseUserMock.mockResolvedValue({
      id: verifiedUser.id,
      email: verifiedUser.email,
      isDemo: false,
      isEmailVerified: true,
      firebaseUid: 'firebase-user-1',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer firebase-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: verifiedUser });
  });
});
