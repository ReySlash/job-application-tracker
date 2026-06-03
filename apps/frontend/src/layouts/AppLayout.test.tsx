import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes, useOutletContext } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppLayoutOutletContext } from './AppLayout';

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

vi.mock('../lib/queryClient', () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

import AppLayout from './AppLayout';

function FiltersProbe() {
  const { closeSidebar, registerMobileOverlayCloser } = useOutletContext<AppLayoutOutletContext>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    registerMobileOverlayCloser(() => setFiltersOpen(false));

    return () => {
      registerMobileOverlayCloser(null);
    };
  }, [registerMobileOverlayCloser]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          closeSidebar();
          setFiltersOpen(true);
        }}
      >
        Open filters
      </button>
      <div>{filtersOpen ? 'Filters open' : 'Filters closed'}</div>
    </div>
  );
}

function renderAppLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<FiltersProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout mobile overlays', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      signOut: vi.fn(),
      user: {
        id: 'user-1',
        email: 'user@example.com',
        isDemo: false,
        isEmailVerified: true,
      },
    });
  });

  it('closes mobile filters before opening the sidebar', async () => {
    const user = userEvent.setup();

    renderAppLayout();

    await user.click(screen.getByRole('button', { name: 'Open filters' }));
    expect(screen.getByText('Filters open')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'open sidebar' }));

    expect(screen.getByText('Filters closed')).toBeInTheDocument();
  });
});
