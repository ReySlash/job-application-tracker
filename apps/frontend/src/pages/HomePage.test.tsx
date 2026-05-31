import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '../lib/queryClient';

const { resetDemoApplicationsMock, useAuthMock } = vi.hoisted(() => ({
  resetDemoApplicationsMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock('../api/applications', () => ({
  resetDemoApplications: resetDemoApplicationsMock,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import HomePage from './HomePage';

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route path="/signup" element={<div>Signup page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthLoading: false,
      startDemoSession: vi.fn().mockResolvedValue(undefined),
      user: null,
    });
  });

  it('starts a backend-owned demo session for unauthenticated visitors', async () => {
    const user = userEvent.setup();
    const startDemoSessionMock = vi.fn().mockResolvedValue(undefined);

    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthLoading: false,
      startDemoSession: startDemoSessionMock,
      user: null,
    });

    renderHomePage();
    await user.click(screen.getByRole('button', { name: 'Try live demo' }));

    await waitFor(() => {
      expect(startDemoSessionMock).toHaveBeenCalledTimes(1);
    });

    expect(resetDemoApplicationsMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });

  it('resets demo data through the backend for active demo users', async () => {
    const user = userEvent.setup();
    resetDemoApplicationsMock.mockResolvedValue(undefined);

    useAuthMock.mockReturnValue({
      accessToken: 'demo-token',
      isAuthLoading: false,
      startDemoSession: vi.fn(),
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        isDemo: true,
        isEmailVerified: false,
      },
    });

    renderHomePage();
    await user.click(screen.getByRole('button', { name: 'Reset demo data' }));

    await waitFor(() => {
      expect(resetDemoApplicationsMock).toHaveBeenCalledWith('demo-token');
    });

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });
});
