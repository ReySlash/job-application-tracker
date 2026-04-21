import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import ProtectedRoute from './ProtectedRoute';

function renderProtectedRoute(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<div>Protected dashboard</div>} />
        </Route>
        <Route path="login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: false,
      user: null,
    });

    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: false,
      user: { id: 'user-123' },
    });

    renderProtectedRoute();

    expect(screen.getByText('Protected dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('shows the loading state without flashing protected content early', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: true,
      user: null,
    });

    renderProtectedRoute();

    expect(screen.getByText('Restoring your session...')).toBeInTheDocument();
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
