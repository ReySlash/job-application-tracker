import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, TestQueryClientProvider } from '../test/queryClient';

const { createApplicationMock, fetchApplicationsMock, useAuthMock, navigateMock } = vi.hoisted(() => ({
  createApplicationMock: vi.fn(),
  fetchApplicationsMock: vi.fn(),
  useAuthMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('../api/applications', () => ({
  createApplication: createApplicationMock,
  fetchApplications: fetchApplicationsMock,
  updateApplication: vi.fn(),
  deleteApplicationById: vi.fn(),
  resetDemoApplications: vi.fn(),
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

import ApplicationFormPage from './ApplicationFormPage';

function renderApplicationFormPage() {
  const queryClient = createTestQueryClient();

  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

  const result = render(
    <TestQueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/applications/new']}>
        <Routes>
          <Route path="/applications/new" element={<ApplicationFormPage />} />
          <Route path="/applications" element={<div>Applications page</div>} />
        </Routes>
      </MemoryRouter>
    </TestQueryClientProvider>,
  );

  return { ...result, queryClient, invalidateQueriesSpy };
}

describe('ApplicationFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { id: 'user-123' },
    });
    fetchApplicationsMock.mockResolvedValue([]);
  });

  it('submits the create flow, disables while pending, invalidates the list, and navigates on success', async () => {
    let resolveCreate: (() => void) | undefined;
    createApplicationMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const user = userEvent.setup();
    const { invalidateQueriesSpy } = renderApplicationFormPage();

    await user.type(screen.getByLabelText('Company'), 'Acme');
    await user.type(screen.getByLabelText('Role'), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText('Status'), 'interview');
    await user.clear(screen.getByLabelText('Applied Date'));
    await user.type(screen.getByLabelText('Applied Date'), '2026-04-21');
    await user.type(screen.getByLabelText('Location'), 'Remote');
    await user.type(screen.getByLabelText('Job URL'), 'https://example.com/jobs/1');
    await user.type(screen.getByLabelText('Notes'), 'Prepare for the screen');

    await user.click(screen.getByRole('button', { name: 'Save Application' }));

    await waitFor(() => {
      expect(createApplicationMock).toHaveBeenCalledWith(
        {
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'interview',
          appliedAt: '2026-04-21',
          location: 'Remote',
          jobUrl: 'https://example.com/jobs/1',
          notes: 'Prepare for the screen',
        },
        'user-123',
      );
    });

    const submitButton = screen.getByRole('button', { name: 'Saving...' });
    expect(submitButton).toBeDisabled();

    resolveCreate?.();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['applications'] });
      expect(navigateMock).toHaveBeenCalledWith('/applications', {
        state: { successMessage: 'Application created successfully!' },
      });
    });
  });

  it('shows an inline error message when create fails and does not navigate', async () => {
    createApplicationMock.mockRejectedValue(new Error('Supabase insert failed'));

    const user = userEvent.setup();
    const { invalidateQueriesSpy } = renderApplicationFormPage();

    await user.type(screen.getByLabelText('Company'), 'Acme');
    await user.type(screen.getByLabelText('Role'), 'Frontend Engineer');
    await user.clear(screen.getByLabelText('Applied Date'));
    await user.type(screen.getByLabelText('Applied Date'), '2026-04-21');
    await user.type(screen.getByLabelText('Location'), 'Remote');

    await user.click(screen.getByRole('button', { name: 'Save Application' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Supabase insert failed');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({ queryKey: ['applications'] });

    await user.type(screen.getByLabelText('Company'), ' Updated');

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
