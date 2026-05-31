import { createContext } from 'react';
import type { AuthUser } from '../types/AuthUser';

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  startDemoSession: () => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
