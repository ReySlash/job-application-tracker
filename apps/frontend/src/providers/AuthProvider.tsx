import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  demoLogin,
  requestPasswordReset as requestPasswordResetFromSupabase,
  restoreSession,
  signIn as signInWithPassword,
  signOut as signOutFromBackend,
  signUp as signUpWithPassword,
  updatePassword as updatePasswordInSupabase,
} from '../api/auth';
import { AuthContext } from '../context/authContext';
import type { AuthContextValue } from '../context/authContext';
import { getResetPasswordRedirectUrl, hasPasswordRecoveryHash } from '../lib/authRedirects';
import type { AuthUser } from '../types/AuthUser';

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(hasPasswordRecoveryHash);

  useEffect(() => {
    let isMounted = true;

    restoreSession()
      .then((authState) => {
        if (!isMounted) {
          return;
        }

        setUser(authState.user);
        setAccessToken(authState.accessToken);
        setIsPasswordRecovery(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setAccessToken(null);
        setIsPasswordRecovery(hasPasswordRecoveryHash());
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthLoading,
      isPasswordRecovery,
      signIn: async (email, password) => {
        const authState = await signInWithPassword(email, password);
        setUser(authState.user);
        setAccessToken(authState.accessToken);
        setIsPasswordRecovery(false);
      },
      signUp: async (email, password) => {
        const authState = await signUpWithPassword(email, password);
        setUser(authState.user);
        setAccessToken(authState.accessToken);
        setIsPasswordRecovery(false);
      },
      requestPasswordReset: async (email) => {
        await requestPasswordResetFromSupabase(email, getResetPasswordRedirectUrl());
      },
      updatePassword: async (password) => {
        await updatePasswordInSupabase(password);
        setIsPasswordRecovery(false);
      },
      startDemoSession: async () => {
        const authState = await demoLogin();
        setUser(authState.user);
        setAccessToken(authState.accessToken);
        setIsPasswordRecovery(false);
      },
      signOut: async () => {
        await signOutFromBackend();

        setUser(null);
        setAccessToken(null);
        setIsPasswordRecovery(false);
      },
    }),
    [accessToken, isAuthLoading, isPasswordRecovery, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
