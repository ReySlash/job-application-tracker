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

import SideBar from './SideBar';

function renderSideBar() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<SideBar />} />
        <Route path="/applications" element={<div>Applications page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SideBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useAuthMock.mockReturnValue({
      accessToken: 'demo-token',
      signOut: vi.fn().mockResolvedValue(undefined),
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        isDemo: true,
        isEmailVerified: false,
      },
    });
  });

  it('resets demo data through the backend route for demo users', async () => {
    const user = userEvent.setup();
    resetDemoApplicationsMock.mockResolvedValue(undefined);

    renderSideBar();
    await user.click(screen.getByRole('button', { name: 'Reset demo data' }));

    await waitFor(() => {
      expect(resetDemoApplicationsMock).toHaveBeenCalledWith('demo-token');
    });

    expect(await screen.findByText('Demo data restored.')).toBeInTheDocument();
  });
});
