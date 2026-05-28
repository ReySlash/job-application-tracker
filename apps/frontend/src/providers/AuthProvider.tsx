import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getSession,
  onAuthStateChange,
  requestPasswordReset as requestPasswordResetFromSupabase,
  signInAnonymously,
  signIn as signInWithPassword,
  signOut as signOutFromSupabase,
  signUp as signUpWithPassword,
  updatePassword as updatePasswordInSupabase,
} from '../api/auth';
import { AuthContext } from '../context/authContext';
import type { AuthContextValue } from '../context/authContext';
import {
  getResetPasswordRedirectUrl,
  getSignupRedirectUrl,
  hasPasswordRecoveryHash,
} from '../lib/authRedirects';

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // Recovery links can briefly exist before Supabase finishes restoring the session.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(hasPasswordRecoveryHash);

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then((restoredSession) => {
        if (isMounted) {
          setSession(restoredSession);

          if (!restoredSession) {
            setIsPasswordRecovery(hasPasswordRecoveryHash());
          }
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

    const { data } = onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      // Keep the reset-password page open while Supabase swaps into its temporary recovery session.
      if (
        event === 'PASSWORD_RECOVERY' ||
        (event === 'INITIAL_SESSION' && hasPasswordRecoveryHash())
      ) {
        setIsPasswordRecovery(true);
      }

      if (event === 'SIGNED_IN' && !hasPasswordRecoveryHash()) {
        setIsPasswordRecovery(false);
      }

      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setIsPasswordRecovery(false);
      }

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
      isPasswordRecovery,
      signIn: async (email, password) => {
        const data = await signInWithPassword(email, password);
        setSession(data.session);
        setIsPasswordRecovery(false);
      },
      signUp: async (email, password) => {
        const data = await signUpWithPassword(email, password, getSignupRedirectUrl());
        setSession(data.session);
        return { hasSession: Boolean(data.session) };
      },
      requestPasswordReset: async (email) => {
        await requestPasswordResetFromSupabase(email, getResetPasswordRedirectUrl());
      },
      updatePassword: async (password) => {
        await updatePasswordInSupabase(password);
        setIsPasswordRecovery(false);
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
        setIsPasswordRecovery(false);
      },
    }),
    [isAuthLoading, isPasswordRecovery, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
