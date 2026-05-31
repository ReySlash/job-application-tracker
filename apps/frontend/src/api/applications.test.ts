import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

const { fromMock, fetchMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.stubGlobal('fetch', fetchMock);

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

import {
  createApplication,
  deleteApplicationById,
  fetchApplicationById,
  fetchApplications,
  resetDemoApplications,
  updateApplication,
} from './applications';

function createFormInput(overrides: Partial<ApplicationsFormSchema> = {}): ApplicationsFormSchema {
  return {
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'interview',
    appliedAt: '2026-04-21',
    location: 'Remote',
    jobUrl: 'https://example.com/jobs/1',
    notes: 'Prepare for interview',
    ...overrides,
  };
}

function backendApplication(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'application-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'INTERVIEWING',
    appliedAt: '2026-04-21',
    location: 'Remote',
    jobUrl: 'https://example.com/jobs/1',
    notes: 'Prepare for interview',
    createdAt: '2026-04-21T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
    userId: 'user-123',
    ...overrides,
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('applications API wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchApplications requests the backend list and maps the response', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        applicationsList: [
          backendApplication(),
          backendApplication({ id: 'application-2', status: 'OFFER' }),
        ],
      }),
    );

    await expect(fetchApplications('token-123')).resolves.toEqual([
      {
        id: 'application-1',
        company: 'Acme',
        role: 'Frontend Engineer',
        status: 'interview',
        appliedAt: '2026-04-21',
        location: 'Remote',
        jobUrl: 'https://example.com/jobs/1',
        notes: 'Prepare for interview',
        createdAt: '2026-04-21T00:00:00.000Z',
        updatedAt: '2026-04-22T00:00:00.000Z',
      },
      {
        id: 'application-2',
        company: 'Acme',
        role: 'Frontend Engineer',
        status: 'offer',
        appliedAt: '2026-04-21',
        location: 'Remote',
        jobUrl: 'https://example.com/jobs/1',
        notes: 'Prepare for interview',
        createdAt: '2026-04-21T00:00:00.000Z',
        updatedAt: '2026-04-22T00:00:00.000Z',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/applications',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-123' },
      }),
    );
  });

  it('fetchApplicationById requests the backend detail route and maps the response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ application: backendApplication() }));

    await expect(fetchApplicationById('application-123', 'token-123')).resolves.toEqual({
      id: 'application-1',
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'interview',
      appliedAt: '2026-04-21',
      location: 'Remote',
      jobUrl: 'https://example.com/jobs/1',
      notes: 'Prepare for interview',
      createdAt: '2026-04-21T00:00:00.000Z',
      updatedAt: '2026-04-22T00:00:00.000Z',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/applications/application-123',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-123' },
      }),
    );
  });

  it('normalizes ISO datetime appliedAt values into date-input format', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        application: backendApplication({ appliedAt: '2026-04-21T00:00:00.000Z' }),
      }),
    );

    await expect(fetchApplicationById('application-123', 'token-123')).resolves.toMatchObject({
      appliedAt: '2026-04-21',
    });
  });

  it('createApplication sends the backend payload without userId', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Application created successfully' }));

    await expect(createApplication(createFormInput(), 'token-123')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/applications',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'interview',
          appliedAt: '2026-04-21',
          location: 'Remote',
          jobUrl: 'https://example.com/jobs/1',
          notes: 'Prepare for interview',
        }),
      }),
    );
  });

  it('updateApplication sends the backend payload to the PUT route', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Application updated successfully' }));

    await expect(updateApplication('application-123', createFormInput({ jobUrl: '', notes: '' }), 'token-123')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/applications/application-123',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'interview',
          appliedAt: '2026-04-21',
          location: 'Remote',
          jobUrl: null,
          notes: null,
        }),
      }),
    );
  });

  it('deleteApplicationById calls the backend delete route', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Application deleted successfully' }));

    await expect(deleteApplicationById('application-123', 'token-123')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/applications/application-123',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer token-123' },
      }),
    );
  });

  it('resetDemoApplications deletes by user_id and then inserts demo data through Supabase', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-21T12:00:00.000Z'));

    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn(() => ({ eq: deleteEq }));
    const insert = vi.fn().mockResolvedValue({ error: null });

    fromMock
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce({ insert });

    await expect(resetDemoApplications('user-123')).resolves.toBeUndefined();

    expect(deleteEq).toHaveBeenCalledWith('user_id', 'user-123');
    expect(insert).toHaveBeenCalledTimes(1);

    const insertedPayload = insert.mock.calls[0]?.[0] as Array<Record<string, string>>;
    expect(insertedPayload).toHaveLength(6);
    expect(insertedPayload[0]).toMatchObject({
      company: 'Northstar Labs',
      role: 'Frontend Engineer',
      status: 'interview',
      applied_at: '2026-04-20',
      user_id: 'user-123',
    });

    vi.useRealTimers();
  });

  it('throws backend error messages for application CRUD failures', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Fetch failed' }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Fetch detail failed' }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Create failed' }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Update failed' }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Delete failed' }, { status: 500 }));

    await expect(fetchApplications('token-123')).rejects.toThrow('Fetch failed');
    await expect(fetchApplicationById('application-123', 'token-123')).rejects.toThrow('Fetch detail failed');
    await expect(createApplication(createFormInput(), 'token-123')).rejects.toThrow('Create failed');
    await expect(updateApplication('application-123', createFormInput(), 'token-123')).rejects.toThrow('Update failed');
    await expect(deleteApplicationById('application-123', 'token-123')).rejects.toThrow('Delete failed');
  });

  it('throws Supabase reset errors for the temporary demo path', async () => {
    const resetDeleteEq = vi.fn().mockResolvedValue({ error: { message: 'Reset delete failed' } });
    const resetDelete = vi.fn(() => ({ eq: resetDeleteEq }));
    fromMock.mockReturnValueOnce({ delete: resetDelete });

    await expect(resetDemoApplications('user-123')).rejects.toThrow('Reset delete failed');
  });

  it('uses fallback messages when backend or demo reset responses omit error text', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }));

    const resetDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const resetDelete = vi.fn(() => ({ eq: resetDeleteEq }));
    const resetInsert = vi.fn().mockResolvedValue({ error: { message: '' } });

    fromMock
      .mockReturnValueOnce({ delete: resetDelete })
      .mockReturnValueOnce({ insert: resetInsert });

    await expect(fetchApplications('token-123')).rejects.toThrow('Failed to fetch applications');
    await expect(fetchApplicationById('application-123', 'token-123')).rejects.toThrow('Failed to fetch application');
    await expect(createApplication(createFormInput(), 'token-123')).rejects.toThrow('Failed to create application');
    await expect(updateApplication('application-123', createFormInput(), 'token-123')).rejects.toThrow('Failed to update application');
    await expect(deleteApplicationById('application-123', 'token-123')).rejects.toThrow('Failed to delete application');
    await expect(resetDemoApplications('user-123')).rejects.toThrow('Failed to seed demo applications');
  });
});
