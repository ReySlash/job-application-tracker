import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthLoading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ hasSession: boolean }>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  startDemoSession: () => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
