import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getSession,
  onAuthStateChange,
  signInAnonymously,
  signIn as signInWithPassword,
  signOut as signOutFromSupabase,
  signUp as signUpWithPassword,
} from '../api/auth';
import { AuthContext } from '../context/authContext';
import type { AuthContextValue } from '../context/authContext';

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then((restoredSession) => {
        if (isMounted) {
          setSession(restoredSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const { data } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthLoading,
      signIn: async (email, password) => {
        const data = await signInWithPassword(email, password);
        setSession(data.session);
      },
      signUp: async (email, password) => {
        const data = await signUpWithPassword(email, password);
        setSession(data.session);
        return { hasSession: Boolean(data.session) };
      },
      startDemoSession: async () => {
        const data = await signInAnonymously();

        if (!data.session || !data.user) {
          throw new Error('Failed to start demo session');
        }

        setSession(data.session);
        return { userId: data.user.id };
      },
      signOut: async () => {
        await signOutFromSupabase();
        setSession(null);
      },
    }),
    [isAuthLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
