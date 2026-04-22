import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, emailRedirectTo: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign up');
  }

  // Supabase may obfuscate existing confirmed accounts by returning a user-like payload
  // with no session and no identities instead of an explicit error.
  if (!data.session && Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
    throw new Error('An account with this email already exists. Sign in instead.');
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message || 'Failed to sign in');
  }

  return data;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    throw new Error(error.message || 'Failed to send password reset email');
  }

  return data;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(error.message || 'Failed to update password');
  }

  return data;
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(error.message || 'Failed to start demo session');
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Failed to restore session');
  }

  return data.session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
