import type { AuthUser } from '../types/AuthUser';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type AuthSuccessResponse = {
  user: AuthUser;
  accessToken: string;
};

type MeResponse = {
  user: AuthUser;
};

type GenericMessageResponse = {
  message: string;
};

type ApiErrorResponse = {
  error?: string;
};

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T | ApiErrorResponse) : null;

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string' &&
      payload.error
        ? payload.error
        : fallbackMessage;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function signUp(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthSuccessResponse>(response, 'Failed to sign up');
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthSuccessResponse>(response, 'Failed to sign in');
}

export async function demoLogin() {
  const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse<AuthSuccessResponse>(response, 'Failed to start demo session');
}

export async function signOut() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  await parseResponse<{ message: string }>(response, 'Failed to sign out');
}

export async function restoreSession() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse<AuthSuccessResponse>(response, 'Failed to restore session');
}

export async function getCurrentUser(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseResponse<MeResponse>(response, 'Failed to fetch current user');
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return parseResponse<GenericMessageResponse>(response, 'Failed to send password reset email');
}

export async function updatePassword(token: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  return parseResponse<GenericMessageResponse>(response, 'Failed to update password');
}
