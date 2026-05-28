import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo, useState } from 'react';
import { MemoryRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicOnlyRoute from '../components/PublicOnlyRoute';
import { AuthContext } from '../context/authContext';
import type { AuthContextValue } from '../context/authContext';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import { createTestQueryClient, TestQueryClientProvider } from '../test/queryClient';

const { fetchApplicationsMock } = vi.hoisted(() => ({
  fetchApplicationsMock: vi.fn(),
}));

vi.mock('../api/applications', () => ({
  fetchApplications: fetchApplicationsMock,
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplicationById: vi.fn(),
  resetDemoApplications: vi.fn(),
}));

function ProtectedDashboardProbe() {
  const { data = [], error, isLoading } = useApplicationsQuery();

  if (isLoading) {
    return <p>Loading protected page...</p>;
  }

  if (error instanceof Error) {
    return <p>{error.message}</p>;
  }

  return (
    <section>
      <h1>Protected dashboard</h1>
      <p>{`Loaded ${data.length} applications`}</p>
    </section>
  );
}

type RenderOptions = {
  signInImplementation?: AuthContextValue['signIn'];
  initialEntry?: string;
};

function renderApp(options: RenderOptions = {}) {
  const { initialEntry = '/dashboard', signInImplementation } = options;
  const queryClient = createTestQueryClient();

  function AuthProviderStub() {
    const [session, setSession] = useState<AuthContextValue['session']>(null);

    const value = useMemo<AuthContextValue>(
      () => ({
        session,
        user: session?.user ?? null,
        isAuthLoading: false,
        isPasswordRecovery: false,
        signIn:
          signInImplementation ??
          (async () => {
            setSession({
              access_token: 'token',
              refresh_token: 'refresh',
              expires_in: 3600,
              token_type: 'bearer',
              user: {
                id: 'user-123',
                email: 'user@example.com',
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                created_at: '',
              },
            } as AuthContextValue['session']);
          }),
        signUp: vi.fn(),
        requestPasswordReset: vi.fn(),
        updatePassword: vi.fn(),
        startDemoSession: vi.fn(),
        signOut: vi.fn(),
      }),
      [session],
    );

    return <AuthContext.Provider value={value}>{<AppRoutes />}</AuthContext.Provider>;
  }

  function ProtectedShell() {
    return <Outlet />;
  }

  function HomeRedirect() {
    return <Navigate to="/login" replace />;
  }

  function AppRoutes() {
    return (
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedShell />}>
            <Route path="/dashboard" element={<ProtectedDashboardProbe />} />
          </Route>
        </Route>
      </Routes>
    );
  }

  const result = render(
    <TestQueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProviderStub />
      </MemoryRouter>
    </TestQueryClientProvider>,
  );

  return { ...result, queryClient };
}

describe('app protected flow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login, signs in, and renders protected content', async () => {
    fetchApplicationsMock.mockResolvedValue([{ id: 'app-1' }]);

    const user = userEvent.setup();
    renderApp();

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Protected dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loaded 1 applications')).toBeInTheDocument();
    expect(fetchApplicationsMock).toHaveBeenCalledTimes(1);
  });

  it('shows a protected page fallback when the protected data load fails after login', async () => {
    fetchApplicationsMock.mockRejectedValue(new Error('Dashboard data failed to load'));

    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Dashboard data failed to load')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchApplicationsMock).toHaveBeenCalledTimes(1);
    });
  });
});
