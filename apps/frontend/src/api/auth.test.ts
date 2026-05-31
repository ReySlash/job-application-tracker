import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authMock, fetchMock } = vi.hoisted(() => ({
  authMock: {
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signInAnonymously: vi.fn(),
  },
  fetchMock: vi.fn(),
}));

vi.stubGlobal('fetch', fetchMock);

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: authMock,
  },
}));

import {
  getCurrentUser,
  requestPasswordReset,
  restoreSession,
  signIn,
  signInAnonymously,
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
    const data = { user: { id: 'user-1' }, accessToken: 'token' };
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

  it('requestPasswordReset forwards email and redirect URL to Supabase', async () => {
    const data = {};
    authMock.resetPasswordForEmail.mockResolvedValue({ data, error: null });

    await expect(requestPasswordReset('user@example.com', 'https://example.com/reset-password')).resolves.toEqual(data);
    expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://example.com/reset-password',
    });
  });

  it('updatePassword forwards the new password to Supabase', async () => {
    const data = { user: { id: 'user-1' } };
    authMock.updateUser.mockResolvedValue({ data, error: null });

    await expect(updatePassword('new-secret123')).resolves.toEqual(data);
    expect(authMock.updateUser).toHaveBeenCalledWith({ password: 'new-secret123' });
  });

  it('signInAnonymously returns Supabase demo data', async () => {
    const data = { user: { id: 'anon-1' }, session: { access_token: 'token' } };
    authMock.signInAnonymously.mockResolvedValue({ data, error: null });

    await expect(signInAnonymously()).resolves.toEqual(data);
    expect(authMock.signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('throws backend error messages for auth endpoint failures', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'User already exists' }, { status: 409 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid email or password' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Refresh token is required' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid access token' }, { status: 401 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Network error during sign out' }, { status: 500 }));

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('User already exists');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Invalid email or password');
    await expect(restoreSession()).rejects.toThrow('Refresh token is required');
    await expect(getCurrentUser('bad-token')).rejects.toThrow('Invalid access token');
    await expect(signOut()).rejects.toThrow('Network error during sign out');
  });

  it('uses fallback messages when backend responses omit error text', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    authMock.resetPasswordForEmail.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.updateUser.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.signInAnonymously.mockResolvedValue({ data: null, error: { message: '' } });

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('Failed to sign up');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Failed to sign in');
    await expect(restoreSession()).rejects.toThrow('Failed to restore session');
    await expect(getCurrentUser('token')).rejects.toThrow('Failed to fetch current user');
    await expect(signOut()).rejects.toThrow('Failed to sign out');
    await expect(requestPasswordReset('user@example.com', 'https://example.com/reset-password')).rejects.toThrow(
      'Failed to send password reset email',
    );
    await expect(updatePassword('new-secret123')).rejects.toThrow('Failed to update password');
    await expect(signInAnonymously()).rejects.toThrow('Failed to start demo session');
  });
});
