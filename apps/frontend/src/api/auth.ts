import type { AuthUser } from '../types/AuthUser';
import { parseApiResponse } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type AuthSuccessResponse = {
  user: AuthUser;
  accessToken: string;
};

type GenericMessageResponse = {
  message: string;
};

export async function signUp(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return parseApiResponse<GenericMessageResponse>(response, 'Failed to sign up');
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  return parseApiResponse<AuthSuccessResponse>(response, 'Failed to sign in');
}

export async function demoLogin() {
  const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    credentials: 'include',
  });

  return parseApiResponse<AuthSuccessResponse>(response, 'Failed to start demo session');
}

export async function signOut() {
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
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return parseApiResponse<GenericMessageResponse>(response, 'Failed to send password reset email');
}

export async function updatePassword(token: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  return parseApiResponse<GenericMessageResponse>(response, 'Failed to update password');
}
