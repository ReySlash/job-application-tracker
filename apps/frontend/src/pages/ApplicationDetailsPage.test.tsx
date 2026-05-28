import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, TestQueryClientProvider } from '../test/queryClient';

const { deleteApplicationMock, fetchApplicationsMock, navigateMock } = vi.hoisted(() => ({
  deleteApplicationMock: vi.fn(),
  fetchApplicationsMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('../api/applications', () => ({
  createApplication: vi.fn(),
  fetchApplications: fetchApplicationsMock,
  updateApplication: vi.fn(),
  deleteApplicationById: deleteApplicationMock,
  resetDemoApplications: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import ApplicationDetailsPage from './ApplicationDetailsPage';

function renderApplicationDetailsPage() {
  const queryClient = createTestQueryClient();

  return render(
    <TestQueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/applications/app-1']}>
        <Routes>
          <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
          <Route path="/applications" element={<div>Applications page</div>} />
        </Routes>
      </MemoryRouter>
    </TestQueryClientProvider>,
  );
}

describe('ApplicationDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchApplicationsMock.mockResolvedValue([
      {
        id: 'app-1',
        company: 'Acme',
        role: 'Frontend Engineer',
        status: 'interview',
        appliedAt: '2026-04-21',
        location: 'Remote',
        jobUrl: 'https://example.com/jobs/1',
        notes: 'Prepare for the panel interview',
        createdAt: '2026-04-20T10:00:00.000Z',
        updatedAt: '2026-04-21T11:00:00.000Z',
      },
    ]);
    vi.stubGlobal('alert', vi.fn());
  });

  it('waits for a successful delete before navigating with the success banner state', async () => {
    let resolveDelete: (() => void) | undefined;
    deleteApplicationMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );

    const user = userEvent.setup();
    renderApplicationDetailsPage();

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[1]!);

    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalledTimes(1);
    });

    expect(deleteApplicationMock.mock.calls[0]?.[0]).toBe('app-1');

    expect(navigateMock).not.toHaveBeenCalled();

    resolveDelete?.();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/applications', {
        state: { successMessage: 'Application deleted successfully!' },
      });
    });
  });

  it('does not navigate and shows an alert when delete fails', async () => {
    const alertMock = vi.mocked(window.alert);
    deleteApplicationMock.mockRejectedValue(new Error('Supabase delete failed'));

    const user = userEvent.setup();
    renderApplicationDetailsPage();

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[1]!);

    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalledTimes(1);
    });

    expect(deleteApplicationMock.mock.calls[0]?.[0]).toBe('app-1');

    expect(navigateMock).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Failed to delete application. Please try again.');
  });
});
