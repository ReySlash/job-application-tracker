import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyEmailMock } = vi.hoisted(() => ({
  verifyEmailMock: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  verifyEmail: verifyEmailMock,
}));

import VerifyEmailPage from './VerifyEmailPage';

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the success message from the redirect query params', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email?status=success&message=Verified']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('applies the Firebase action code when an oobCode is present', async () => {
    verifyEmailMock.mockResolvedValue({
      message: 'Your email has been verified. You can sign in now.',
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?mode=verifyEmail&oobCode=firebase-code-123']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Your email has been verified. You can sign in now.')).toBeInTheDocument();
    expect(verifyEmailMock).toHaveBeenCalledWith('firebase-code-123');
  });

  it('shows a fallback error when verification fails', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email?status=error']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('This verification link is invalid or has expired.')).toBeInTheDocument();
  });
});
