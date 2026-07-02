import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import SignupSuccessPage from './SignupSuccessPage';

describe('SignupSuccessPage', () => {
  it('shows the email address when navigation state includes it', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/signup-success', state: { email: 'user@example.com' } }]}>
        <Routes>
          <Route path="/signup-success" element={<SignupSuccessPage />} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('We sent a Firebase verification link to user@example.com.')).toBeInTheDocument();
    expect(
      screen.getByText("If you don't see it within a few minutes, check your spam or promotions folder."),
    ).toBeInTheDocument();
  });
});
