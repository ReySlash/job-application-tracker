import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

import ForgotPasswordPage from './ForgotPasswordPage';

function renderForgotPasswordPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      requestPasswordReset: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('submits the email and shows a confirmation message', async () => {
    const user = userEvent.setup();
    const requestPasswordResetMock = vi.fn().mockResolvedValue(undefined);
    useAuthMock.mockReturnValue({ requestPasswordReset: requestPasswordResetMock });

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith('user@example.com');
    });

    expect(
      await screen.findByText('If that email is registered, a password reset link has been sent.'),
    ).toBeInTheDocument();
  });

  it('shows an inline error message when the reset request fails', async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      requestPasswordReset: vi.fn().mockRejectedValue(new Error('Reset unavailable')),
    });

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText('Reset unavailable')).toBeInTheDocument();
  });
});
