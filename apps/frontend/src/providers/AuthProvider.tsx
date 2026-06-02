import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  demoLogin,
  requestPasswordReset as requestPasswordResetFromBackend,
  restoreSession,
  signIn as signInWithPassword,
  signOut as signOutFromBackend,
  signUp as signUpWithPassword,
  updatePassword as updatePasswordInBackend,
} from '../api/auth';
import { AuthContext } from '../context/authContext';
import type { AuthContextValue } from '../context/authContext';
import type { AuthUser } from '../types/AuthUser';

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    restoreSession()
      .then((authState) => {
        if (!isMounted) {
          return;
        }

        setUser(authState.user);
        setAccessToken(authState.accessToken);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setAccessToken(null);
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
      signIn: async (email, password) => {
        const authState = await signInWithPassword(email, password);
        setUser(authState.user);
        setAccessToken(authState.accessToken);
      },
      signUp: async (email, password) => {
        await signUpWithPassword(email, password);
      },
      requestPasswordReset: async (email) => {
        await requestPasswordResetFromBackend(email);
      },
      updatePassword: async (token, password) => {
        await updatePasswordInBackend(token, password);
      },
      startDemoSession: async () => {
        const authState = await demoLogin();
        setUser(authState.user);
        setAccessToken(authState.accessToken);
      },
      signOut: async () => {
        await signOutFromBackend();

        setUser(null);
        setAccessToken(null);
      },
    }),
    [accessToken, isAuthLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
