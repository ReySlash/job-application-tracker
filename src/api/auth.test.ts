import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authMock } = vi.hoisted(() => ({
  authMock: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: authMock,
  },
}));

import {
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  signIn,
  signInAnonymously,
  signOut,
  signUp,
  updatePassword,
} from './auth';

describe('auth API wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signUp forwards credentials and returns Supabase data', async () => {
    const data = { user: { id: 'user-1' }, session: null };
    authMock.signUp.mockResolvedValue({ data, error: null });

    await expect(signUp('user@example.com', 'secret123')).resolves.toEqual(data);
    expect(authMock.signUp).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' });
  });

  it('signIn forwards credentials and returns Supabase data', async () => {
    const data = { user: { id: 'user-1' }, session: { access_token: 'token' } };
    authMock.signInWithPassword.mockResolvedValue({ data, error: null });

    await expect(signIn('user@example.com', 'secret123')).resolves.toEqual(data);
    expect(authMock.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    });
  });

  it('requestPasswordReset forwards email and redirect URL', async () => {
    const data = {};
    authMock.resetPasswordForEmail.mockResolvedValue({ data, error: null });

    await expect(requestPasswordReset('user@example.com', 'https://example.com/reset-password')).resolves.toEqual(data);
    expect(authMock.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://example.com/reset-password',
    });
  });

  it('updatePassword forwards the new password', async () => {
    const data = { user: { id: 'user-1' } };
    authMock.updateUser.mockResolvedValue({ data, error: null });

    await expect(updatePassword('new-secret123')).resolves.toEqual(data);
    expect(authMock.updateUser).toHaveBeenCalledWith({ password: 'new-secret123' });
  });

  it('signInAnonymously returns Supabase data', async () => {
    const data = { user: { id: 'anon-1', is_anonymous: true }, session: { access_token: 'token' } };
    authMock.signInAnonymously.mockResolvedValue({ data, error: null });

    await expect(signInAnonymously()).resolves.toEqual(data);
    expect(authMock.signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('signOut calls Supabase signOut', async () => {
    authMock.signOut.mockResolvedValue({ error: null });

    await expect(signOut()).resolves.toBeUndefined();
    expect(authMock.signOut).toHaveBeenCalledTimes(1);
  });

  it('getSession returns the current session', async () => {
    const session = { access_token: 'token', refresh_token: 'refresh' };
    authMock.getSession.mockResolvedValue({ data: { session }, error: null });

    await expect(getSession()).resolves.toEqual(session);
    expect(authMock.getSession).toHaveBeenCalledTimes(1);
  });

  it('onAuthStateChange forwards auth events to the callback', () => {
    const subscription = { data: { subscription: { unsubscribe: vi.fn() } } };
    authMock.onAuthStateChange.mockImplementation((handler) => {
      handler('SIGNED_IN', { access_token: 'token' });
      return subscription;
    });
    const callback = vi.fn();

    const result = onAuthStateChange(callback);

    expect(callback).toHaveBeenCalledWith('SIGNED_IN', { access_token: 'token' });
    expect(result).toBe(subscription);
  });

  it('throws the Supabase error message for auth failures', async () => {
    authMock.signUp.mockResolvedValue({ data: null, error: { message: 'Email already registered' } });
    authMock.signInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } });
    authMock.resetPasswordForEmail.mockResolvedValue({ data: null, error: { message: 'Reset flow unavailable' } });
    authMock.updateUser.mockResolvedValue({ data: null, error: { message: 'Password update rejected' } });
    authMock.signInAnonymously.mockResolvedValue({ data: null, error: { message: 'Demo mode unavailable' } });
    authMock.signOut.mockResolvedValue({ error: { message: 'Network error during sign out' } });
    authMock.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'Session restore failed' } });

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('Email already registered');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Invalid login credentials');
    await expect(requestPasswordReset('user@example.com', 'https://example.com/reset-password')).rejects.toThrow(
      'Reset flow unavailable',
    );
    await expect(updatePassword('new-secret123')).rejects.toThrow('Password update rejected');
    await expect(signInAnonymously()).rejects.toThrow('Demo mode unavailable');
    await expect(signOut()).rejects.toThrow('Network error during sign out');
    await expect(getSession()).rejects.toThrow('Session restore failed');
  });

  it('uses fallback messages when Supabase returns an empty error message', async () => {
    authMock.signUp.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.signInWithPassword.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.resetPasswordForEmail.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.updateUser.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.signInAnonymously.mockResolvedValue({ data: null, error: { message: '' } });
    authMock.signOut.mockResolvedValue({ error: { message: '' } });
    authMock.getSession.mockResolvedValue({ data: { session: null }, error: { message: '' } });

    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('Failed to sign up');
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Failed to sign in');
    await expect(requestPasswordReset('user@example.com', 'https://example.com/reset-password')).rejects.toThrow(
      'Failed to send password reset email',
    );
    await expect(updatePassword('new-secret123')).rejects.toThrow('Failed to update password');
    await expect(signInAnonymously()).rejects.toThrow('Failed to start demo session');
    await expect(signOut()).rejects.toThrow('Failed to sign out');
    await expect(getSession()).rejects.toThrow('Failed to restore session');
  });
});
