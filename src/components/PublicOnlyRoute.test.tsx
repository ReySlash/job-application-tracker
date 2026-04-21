import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render, screen } from '@testing-library/react';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import PublicOnlyRoute from './PublicOnlyRoute';

function renderPublicOnlyRoute(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<PublicOnlyRoute />}>
          <Route path="login" element={<div>Login form</div>} />
          <Route path="signup" element={<div>Signup form</div>} />
        </Route>
        <Route path="dashboard" element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects authenticated users away from auth pages', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: false,
      user: { id: 'user-123' },
    });

    renderPublicOnlyRoute('/login');

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });

  it('renders public auth pages for unauthenticated users', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: false,
      user: null,
    });

    renderPublicOnlyRoute('/signup');

    expect(screen.getByText('Signup form')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('shows the loading state before deciding access', () => {
    useAuthMock.mockReturnValue({
      isAuthLoading: true,
      user: null,
    });

    renderPublicOnlyRoute('/login');

    expect(screen.getByText('Restoring your session...')).toBeInTheDocument();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });
});
