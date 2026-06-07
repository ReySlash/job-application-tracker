import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  fetchMock,
  getFirebaseAuthMock,
  createUserWithEmailAndPasswordMock,
  onIdTokenChangedMock,
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
  onIdTokenChangedMock: vi.fn(),
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
  onIdTokenChanged: onIdTokenChangedMock,
  sendEmailVerification: sendEmailVerificationMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signOut: signOutFromFirebaseMock,
}));

import {
  demoLogin,
  getAuthStateFromFirebaseUser,
  observeFirebaseAuthState,
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
    onIdTokenChangedMock.mockReturnValue(() => undefined);
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

  it('signUp maps Firebase signup errors and preserves missing-config messages', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);

    createUserWithEmailAndPasswordMock.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('User already exists');

    createUserWithEmailAndPasswordMock.mockRejectedValueOnce(
      new Error('Missing Firebase frontend configuration: VITE_FIREBASE_API_KEY'),
    );
    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow(
      'Missing Firebase frontend configuration: VITE_FIREBASE_API_KEY',
    );

    createUserWithEmailAndPasswordMock.mockRejectedValueOnce(new Error('Unexpected failure'));
    await expect(signUp('user@example.com', 'secret123')).rejects.toThrow('Failed to sign up');
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

  it('signIn maps Firebase credential and rate-limit errors', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);

    signInWithEmailAndPasswordMock.mockRejectedValueOnce({ code: 'auth/invalid-login-credentials' });
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow('Invalid email or password');

    signInWithEmailAndPasswordMock.mockRejectedValueOnce({ code: 'auth/too-many-requests' });
    await expect(signIn('user@example.com', 'secret123')).rejects.toThrow(
      'Too many attempts. Please try again later.',
    );
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

  it('requestPasswordReset maps Firebase reset-email errors', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);

    sendPasswordResetEmailMock.mockRejectedValueOnce({ code: 'auth/user-not-found' });
    await expect(requestPasswordReset('user@example.com')).rejects.toThrow('Invalid email or password');

    sendPasswordResetEmailMock.mockRejectedValueOnce({ code: 'auth/weak-password' });
    await expect(requestPasswordReset('user@example.com')).rejects.toThrow(
      'Password must be at least 8 characters',
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

  it('updatePassword maps expired and fallback errors', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);

    confirmPasswordResetMock.mockRejectedValueOnce({ code: 'auth/expired-action-code' });
    await expect(updatePassword('oob-code-123', 'new-secret123')).rejects.toThrow(
      'This link is invalid or has expired.',
    );

    confirmPasswordResetMock.mockRejectedValueOnce(new Error('Unexpected failure'));
    await expect(updatePassword('oob-code-123', 'new-secret123')).rejects.toThrow(
      'Failed to update password',
    );
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

  it('verifyEmail maps invalid action-code errors', async () => {
    const auth = { currentUser: null };
    getFirebaseAuthMock.mockReturnValue(auth);
    applyActionCodeMock.mockRejectedValueOnce({ code: 'auth/invalid-action-code' });

    await expect(verifyEmail('oob-code-123')).rejects.toThrow('This link is invalid or has expired.');
  });

  it('getAuthStateFromFirebaseUser maps the Firebase user and token', async () => {
    const firebaseUser = {
      uid: 'firebase-user-1',
      email: null,
      emailVerified: true,
      getIdToken: vi.fn().mockResolvedValue('fresh-token'),
    };

    await expect(
      getAuthStateFromFirebaseUser(firebaseUser as never),
    ).resolves.toEqual({
      user: {
        id: 'firebase-user-1',
        email: '',
        isDemo: false,
        isEmailVerified: true,
      },
      accessToken: 'fresh-token',
    });
  });

  it('observeFirebaseAuthState emits both null and authenticated Firebase states', async () => {
    const listener = vi.fn().mockResolvedValue(undefined);
    let capturedHandler: ((user: ReturnType<typeof createFirebaseUser> | null) => Promise<void>) | undefined;

    onIdTokenChangedMock.mockImplementation((_auth, handler) => {
      capturedHandler = handler;
      return () => undefined;
    });

    const unsubscribe = observeFirebaseAuthState(listener);

    await capturedHandler?.(null);
    await capturedHandler?.(createFirebaseUser({ token: 'observed-token' }));

    expect(listener).toHaveBeenNthCalledWith(1, null);
    expect(listener).toHaveBeenNthCalledWith(2, {
      user: {
        id: 'firebase-user-1',
        email: 'user@example.com',
        isDemo: false,
        isEmailVerified: true,
      },
      accessToken: 'observed-token',
    });
    expect(typeof unsubscribe).toBe('function');
  });

  it('observeFirebaseAuthState falls back to a null auth state when Firebase setup throws', async () => {
    const listener = vi.fn().mockResolvedValue(undefined);
    getFirebaseAuthMock.mockImplementation(() => {
      throw new Error('Missing Firebase frontend configuration: VITE_FIREBASE_API_KEY');
    });

    const unsubscribe = observeFirebaseAuthState(listener);

    expect(listener).toHaveBeenCalledWith(null);
    expect(typeof unsubscribe).toBe('function');
  });
});
