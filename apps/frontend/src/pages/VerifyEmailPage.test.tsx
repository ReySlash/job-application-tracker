import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import VerifyEmailPage from './VerifyEmailPage';

describe('VerifyEmailPage', () => {
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
