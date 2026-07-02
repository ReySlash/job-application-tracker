import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as signOutFromFirebase,
  type User,
} from 'firebase/auth';
import type { AuthUser } from '../types/AuthUser';
import { getFirebaseAuth } from '../lib/firebase';
import { parseApiResponse } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type AuthSuccessResponse = {
  user: AuthUser;
  accessToken: string;
};

function createActionUrl(pathname: string) {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL ?? window.location.origin;
  return new URL(pathname, baseUrl).toString();
}

function mapFirebaseError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.startsWith('Missing Firebase frontend configuration')) {
    return error.message;
  }

  if (!error || typeof error !== 'object' || !('code' in error)) {
    return fallbackMessage;
  }

  const code = typeof error.code === 'string' ? error.code : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'User already exists';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/user-not-found':
      return 'Invalid email or password';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters';
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'This link is invalid or has expired.';
    default:
      return fallbackMessage;
  }
}

function mapFirebaseUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? '',
    isDemo: false,
    isEmailVerified: user.emailVerified,
  };
}

export async function getAuthStateFromFirebaseUser(user: User): Promise<AuthSuccessResponse> {
  return {
    user: mapFirebaseUser(user),
    accessToken: await user.getIdToken(),
  };
}

export function observeFirebaseAuthState(
  listener: (authState: AuthSuccessResponse | null) => Promise<void> | void,
) {
  try {
    return onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        await listener(null);
        return;
      }

      await listener(await getAuthStateFromFirebaseUser(user));
    });
  } catch {
    void listener(null);
    return () => undefined;
  }
}

export async function signUp(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(credential.user, {
      url: createActionUrl('/verify-email'),
      handleCodeInApp: true,
    });
    await signOutFromFirebase(auth);

    return {
      message: 'Account created. Check your email to verify your account before signing in.',
    };
  } catch (error) {
    throw new Error(mapFirebaseError(error, 'Failed to sign up'));
  }
}

export async function signIn(email: string, password: string) {
  try {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);

    if (!credential.user.emailVerified) {
      await signOutFromFirebase(auth);
      throw new Error('Verify your email before signing in');
    }

    return getAuthStateFromFirebaseUser(credential.user);
  } catch (error) {
    if (error instanceof Error && error.message === 'Verify your email before signing in') {
      throw error;
    }

    throw new Error(mapFirebaseError(error, 'Failed to sign in'));
  }
}

export async function demoLogin() {
  const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    credentials: 'include',
  });

  return parseApiResponse<AuthSuccessResponse>(response, 'Failed to start demo session');
}

export async function signOut() {
  const auth = getFirebaseAuth();

  if (auth.currentUser) {
    await signOutFromFirebase(auth);
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  await parseApiResponse<{ message: string }>(response, 'Failed to sign out');
}

export async function restoreSession() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  return parseApiResponse<AuthSuccessResponse>(response, 'Failed to restore session');
}

export async function requestPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email, {
      url: createActionUrl('/reset-password'),
      handleCodeInApp: true,
    });

    return {
      message: 'If that email is registered, a password reset link has been sent.',
    };
  } catch (error) {
    throw new Error(mapFirebaseError(error, 'Failed to send password reset email'));
  }
}

export async function updatePassword(oobCode: string, password: string) {
  try {
    await confirmPasswordReset(getFirebaseAuth(), oobCode, password);

    return {
      message: 'Password updated successfully',
    };
  } catch (error) {
    throw new Error(mapFirebaseError(error, 'Failed to update password'));
  }
}

export async function verifyEmail(oobCode: string) {
  try {
    await applyActionCode(getFirebaseAuth(), oobCode);

    return {
      message: 'Your email has been verified. You can sign in now.',
    };
  } catch (error) {
    throw new Error(mapFirebaseError(error, 'Unable to verify your email.'));
  }
}
