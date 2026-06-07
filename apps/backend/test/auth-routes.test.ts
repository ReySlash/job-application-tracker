import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../src/generated/prisma/client.js';
import { AppError } from '../src/lib/errors.js';
import { verifiedUser } from './helpers/auth-fixtures.js';

const {
  createUser,
  createDemoLogin,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  resetPassword,
  syncFirebaseUserMock,
  verifyIdTokenMock,
  verifyEmail,
} = vi.hoisted(() => ({
  createUser: vi.fn(),
  createDemoLogin: vi.fn(),
  forgotPassword: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  resetPassword: vi.fn(),
  syncFirebaseUserMock: vi.fn(),
  verifyIdTokenMock: vi.fn(),
  verifyEmail: vi.fn(),
}));

vi.mock('../src/modules/auth/auth-service.js', () => ({
  createUser,
  createDemoLogin,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refresh,
  resetPassword,
  verifyEmail,
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

function createKnownRequestError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('request failed', {
    code,
    clientVersion: '7.8.0',
  });
}

describe('auth routes', () => {
  beforeEach(() => {
    createUser.mockReset();
    createDemoLogin.mockReset();
    forgotPassword.mockReset();
    getCurrentUser.mockReset();
    login.mockReset();
    logout.mockReset();
    refresh.mockReset();
    resetPassword.mockReset();
    syncFirebaseUserMock.mockReset();
    verifyIdTokenMock.mockReset();
    verifyEmail.mockReset();
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

  it('returns 201 from signup without setting a session cookie', async () => {
    const app = createApp();
    createUser.mockResolvedValue({
      message: 'Account created. Check your email to verify your account before signing in.',
    });

    const response = await request(app).post('/api/auth/signup').send({
      email: 'pending@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Account created. Check your email to verify your account before signing in.',
    });
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('maps duplicate signup errors to 409', async () => {
    const app = createApp();
    createUser.mockRejectedValue(createKnownRequestError('P2002'));

    const response = await request(app).post('/api/auth/signup').send({
      email: 'existing@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'User already exists' });
  });

  it('returns login auth data and sets the refresh cookie', async () => {
    const app = createApp();
    login.mockResolvedValue({
      user: verifiedUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });

    const response = await request(app).post('/api/auth/login').send({
      email: verifiedUser.email,
      password: 'Password123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: verifiedUser,
      accessToken: 'access-token',
    });
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=refresh-token');
  });

  it('returns AppError responses from login', async () => {
    const app = createApp();
    login.mockRejectedValue(new AppError('Verify your email before signing in', 403));

    const response = await request(app).post('/api/auth/login').send({
      email: 'pending@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Verify your email before signing in' });
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

  it('always returns the generic forgot-password response', async () => {
    const app = createApp();
    forgotPassword.mockRejectedValue(new Error('smtp failure'));

    const response = await request(app).post('/api/auth/forgot-password').send({
      email: 'anyone@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'If that email is registered, a password reset link has been sent.',
    });
  });

  it('returns success from reset-password', async () => {
    const app = createApp();
    resetPassword.mockResolvedValue(undefined);

    const response = await request(app).post('/api/auth/reset-password').send({
      token: 'reset-token',
      password: 'UpdatedPassword123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Password updated successfully' });
  });

  it('redirects verify-email to the frontend result URL', async () => {
    const app = createApp();
    verifyEmail.mockResolvedValue('http://localhost:5173/verify-email?status=success');

    const response = await request(app).get('/api/auth/verify-email?token=verify-token');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('http://localhost:5173/verify-email?status=success');
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
