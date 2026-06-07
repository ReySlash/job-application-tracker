import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  fetchMock,
  getFirebaseAuthMock,
  createUserWithEmailAndPasswordMock,
  signInWithEmailAndPasswordMock,
  sendEmailVerificationMock,
  sendPasswordResetEmailMock,
  confirmPasswordResetMock,
  applyActionCodeMock,
  signOutFromFirebaseMock,
} = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  getFirebaseAuthMock: vi.fn(),
  createUserWithEmailAndPasswordMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  sendEmailVerificationMock: vi.fn(),
  sendPasswordResetEmailMock: vi.fn(),
  confirmPasswordResetMock: vi.fn(),
  applyActionCodeMock: vi.fn(),
  signOutFromFirebaseMock: vi.fn(),
}));

vi.stubGlobal('fetch', fetchMock);

vi.mock('../lib/firebase', () => ({
  getFirebaseAuth: getFirebaseAuthMock,
}));

vi.mock('firebase/auth', () => ({
  applyActionCode: applyActionCodeMock,
  confirmPasswordReset: confirmPasswordResetMock,
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  onIdTokenChanged: vi.fn(),
  sendEmailVerification: sendEmailVerificationMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signOut: signOutFromFirebaseMock,
}));

import {
  demoLogin,
  requestPasswordReset,
  restoreSession,
  signIn,
  signOut,
  signUp,
  updatePassword,
  verifyEmail,
} from './auth';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function createFirebaseUser(overrides: Partial<{ email: string; emailVerified: boolean; uid: string; token: string }> = {}) {
  return {
    uid: overrides.uid ?? 'firebase-user-1',
    email: overrides.email ?? 'user@example.com',
    emailVerified: overrides.emailVerified ?? true,
    getIdToken: vi.fn().mockResolvedValue(overrides.token ?? 'firebase-token'),
  };
}

describe('auth API wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFirebaseAuthMock.mockReturnValue({ currentUser: null });
  });

  it('signUp creates a Firebase user, sends verification email, and signs the user out', async () => {
    const auth = { currentUser: null };
    const user = createFirebaseUser({ emailVerified: false });
    getFirebaseAuthMock.mockReturnValue(auth);
    createUserWithEmailAndPasswordMock.mockResolvedValue({ user });
    sendEmailVerificationMock.mockResolvedValue(undefined);
    signOutFromFirebaseMock.mockResolvedValue(undefined);

    await expect(signUp('user@example.com', 'secret123')).resolves.toEqual({
      message: 'Account created. Check your email to verify your account before signing in.',
    });

    expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith(auth, 'user@example.com', 'secret123');
    expect(sendEmailVerificationMock).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        handleCodeInApp: true,
      }),
    );
    expect(signOutFromFirebaseMock).toHaveBeenCalledWith(auth);
  });

  it('signIn authenticates with Firebase and returns the mapped auth state', async () => {
    const auth = { currentUser: null };
    const user = createFirebaseUser();
    getFirebaseAuthMock.mockReturnValue(auth);
    signInWithEmailAndPasswordMock.mockResolvedValue({ user });

    await expect(signIn('user@example.com', 'secret123')).resolves.toEqual({
      user: {
        id: 'firebase-user-1',
        email: 'user@example.com',
        isDemo: false,
        isEmailVerified: true,
      },
      accessToken: 'firebase-token',
    });
  });

  it('signIn blocks unverified Firebase users', async () => {
    const auth = { currentUser: null };
    const user = createFirebaseUser({ emailVerified: false });
    getFirebaseAuthMock.mockReturnValue(auth);
    signInWithEmailAndPasswordMock.mockResolvedValue({ user });
    signOutFromFirebaseMock.mockResolvedValue(undefined);

    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Verify your email before signing in');
    expect(signOutFromFirebaseMock).toHaveBeenCalledWith(auth);
  });

  it('restoreSession uses the backend refresh endpoint with cookies included', async () => {
    const data = { user: { id: 'demo-user-1', isDemo: true }, accessToken: 'demo-token' };
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

  it('signOut signs out Firebase and clears the backend demo session cookie', async () => {
    const auth = { currentUser: createFirebaseUser() };
    getFirebaseAuthMock.mockReturnValue(auth);
    signOutFromFirebaseMock.mockResolvedValue(undefined);
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Logged out successfully' }));

    await expect(signOut()).resolves.toBeUndefined();
    expect(signOutFromFirebaseMock).toHaveBeenCalledWith(auth);
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

  it('requestPasswordReset uses Firebase password reset email delivery', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    await expect(requestPasswordReset('user@example.com')).resolves.toEqual({
      message: 'If that email is registered, a password reset link has been sent.',
    });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      auth,
      'user@example.com',
      expect.objectContaining({
        handleCodeInApp: true,
      }),
    );
  });

  it('updatePassword completes the Firebase password reset flow', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);
    confirmPasswordResetMock.mockResolvedValue(undefined);

    await expect(updatePassword('oob-code-123', 'new-secret123')).resolves.toEqual({
      message: 'Password updated successfully',
    });
    expect(confirmPasswordResetMock).toHaveBeenCalledWith(auth, 'oob-code-123', 'new-secret123');
  });

  it('verifyEmail applies the Firebase action code', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);
    applyActionCodeMock.mockResolvedValue(undefined);

    await expect(verifyEmail('oob-code-123')).resolves.toEqual({
      message: 'Your email has been verified. You can sign in now.',
    });
    expect(applyActionCodeMock).toHaveBeenCalledWith(auth, 'oob-code-123');
  });
});
