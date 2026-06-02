import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
}));

vi.stubGlobal('fetch', fetchMock);

import {
  demoLogin,
  getCurrentUser,
  requestPasswordReset,
  restoreSession,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from './auth';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('auth API wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signUp posts credentials to the backend auth API', async () => {
    const data = { message: 'Account created. Check your email to verify your account before signing in.' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(signUp('user@example.com', 'secret123')).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/signup',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'secret123' }),
      }),
    );
  });

  it('signIn posts credentials to the backend auth API', async () => {
    const data = { user: { id: 'user-1' }, accessToken: 'token' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(signIn('user@example.com', 'secret123')).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'secret123' }),
      }),
    );
  });

  it('restoreSession uses the backend refresh endpoint with cookies included', async () => {
    const data = { user: { id: 'user-1' }, accessToken: 'token' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(restoreSession()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('getCurrentUser sends the bearer token to the backend me endpoint', async () => {
    const data = { user: { id: 'user-1' } };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(getCurrentUser('token-123')).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
      }),
    );
  });

  it('signOut calls the backend logout endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Logged out successfully' }));

    await expect(signOut()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('demoLogin calls the backend demo auth endpoint', async () => {
    const data = { user: { id: 'demo-1', isDemo: true }, accessToken: 'token' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(demoLogin()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/demo-login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('requestPasswordReset posts the email to the backend forgot-password route', async () => {
    const data = { message: 'If that email is registered, a password reset link has been sent.' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(requestPasswordReset('user@example.com')).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      }),
    );
  });

  it('updatePassword posts the token and new password to the backend', async () => {
    const data = { message: 'Password updated successfully' };
    fetchMock.mockResolvedValue(jsonResponse(data));

    await expect(updatePassword('reset-token-123', 'new-secret123')).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'reset-token-123', password: 'new-secret123' }),
      }),
    );
  });

  it('throws backend error messages for auth endpoint failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'User already exists' }, { status: 409 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid email or password' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Refresh token is required' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid access token' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Network error during sign out' }, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Demo login failed' }, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Reset password failed' }, { status: 500 }));

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('User already exists');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Invalid email or password');
    await expect(restoreSession()).rejects.toThrow('Refresh token is required');
    await expect(getCurrentUser('bad-token')).rejects.toThrow('Invalid access token');
    await expect(signOut()).rejects.toThrow('Network error during sign out');
    await expect(demoLogin()).rejects.toThrow('Demo login failed');
    await expect(updatePassword('reset-token-123', 'new-secret123')).rejects.toThrow('Reset password failed');
  });

  it('uses fallback messages when backend responses omit error text', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('Failed to sign up');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Failed to sign in');
    await expect(restoreSession()).rejects.toThrow('Failed to restore session');
    await expect(getCurrentUser('token')).rejects.toThrow('Failed to fetch current user');
    await expect(signOut()).rejects.toThrow('Failed to sign out');
    await expect(demoLogin()).rejects.toThrow('Failed to start demo session');
    await expect(requestPasswordReset('user@example.com')).rejects.toThrow('Failed to send password reset email');
    await expect(updatePassword('reset-token-123', 'new-secret123')).rejects.toThrow('Failed to update password');
  });
});
