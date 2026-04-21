import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useAuthMock, navigateMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import ResetPasswordPage from './ResetPasswordPage';

function renderResetPasswordPage() {
  return render(
    <MemoryRouter initialEntries={['/reset-password']}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<div>Forgot password page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      isPasswordRecovery: true,
      updatePassword: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('updates the password and returns to login with a success message', async () => {
    const user = userEvent.setup();
    const updatePasswordMock = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      isPasswordRecovery: true,
      updatePassword: updatePasswordMock,
    });

    renderResetPasswordPage();

    await user.type(screen.getByLabelText('New password'), 'new-secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'new-secret123');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(updatePasswordMock).toHaveBeenCalledWith('new-secret123');
      expect(navigateMock).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { successMessage: 'Password updated. Sign in with your new password.' },
      });
    });
  });

  it('blocks submission when the passwords do not match', async () => {
    const user = userEvent.setup();
    const updatePasswordMock = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({
      isPasswordRecovery: true,
      updatePassword: updatePasswordMock,
    });

    renderResetPasswordPage();

    await user.type(screen.getByLabelText('New password'), 'new-secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'different-secret');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(updatePasswordMock).not.toHaveBeenCalled();
  });

  it('shows the expired link message outside recovery mode', () => {
    useAuthMock.mockReturnValue({
      isPasswordRecovery: false,
      updatePassword: vi.fn(),
    });

    renderResetPasswordPage();

    expect(screen.getByText('This password reset link is invalid or has expired. Request a new one to continue.')).toBeInTheDocument();
    expect(screen.getByText('Request a new reset link')).toBeInTheDocument();
  });
});
