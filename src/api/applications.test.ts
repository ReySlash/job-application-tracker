import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApplicationRow } from '../types/ApplicationRow';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

import {
  createApplication,
  deleteApplicationById,
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

function createRow(overrides: Partial<ApplicationRow> = {}): ApplicationRow {
  return {
    id: 'application-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'interviewing',
    applied_at: '2026-04-21',
    location: 'Remote',
    job_url: 'https://example.com/jobs/1',
    notes: 'Prepare for interview',
    created_at: '2026-04-21T00:00:00.000Z',
    updated_at: '2026-04-22T00:00:00.000Z',
    user_id: 'user-123',
    ...overrides,
  };
}

describe('applications API wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchApplications requests rows in descending created_at order and maps them', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [createRow(), createRow({ id: 'application-2', status: 'offered' })],
      error: null,
    });
    const select = vi.fn(() => ({ order }));
    fromMock.mockReturnValue({ select });

    await expect(fetchApplications()).resolves.toEqual([
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

    expect(fromMock).toHaveBeenCalledWith('applications');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('createApplication sends the mapped insert payload', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ insert });

    await expect(createApplication(createFormInput(), 'user-123')).resolves.toBeUndefined();

    expect(insert).toHaveBeenCalledWith({
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'interview',
      applied_at: '2026-04-21',
      location: 'Remote',
      job_url: 'https://example.com/jobs/1',
      notes: 'Prepare for interview',
      user_id: 'user-123',
    });
  });

  it('updateApplication sends the mapped update payload and scopes by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ update });

    await expect(updateApplication('application-123', createFormInput({ jobUrl: '', notes: '' }))).resolves.toBeUndefined();

    expect(update).toHaveBeenCalledWith({
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'interview',
      applied_at: '2026-04-21',
      location: 'Remote',
      job_url: null,
      notes: null,
    });
    expect(eq).toHaveBeenCalledWith('id', 'application-123');
  });

  it('deleteApplicationById deletes the requested id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn(() => ({ eq }));
    fromMock.mockReturnValue({ delete: deleteMock });

    await expect(deleteApplicationById('application-123')).resolves.toBeUndefined();

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith('id', 'application-123');
  });

  it('resetDemoApplications deletes by user_id and then inserts demo data', async () => {
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

    const firstInsertCall = insert.mock.calls[0];
    expect(firstInsertCall).toBeDefined();

    const insertedPayload = firstInsertCall![0] as Array<Record<string, string>>;
    expect(insertedPayload).toHaveLength(6);
    expect(insertedPayload[0]).toBeDefined();
    expect(insertedPayload[5]).toBeDefined();
    expect(insertedPayload[0]!).toMatchObject({
      company: 'Northstar Labs',
      role: 'Frontend Engineer',
      status: 'interview',
      applied_at: '2026-04-20',
      user_id: 'user-123',
    });
    expect(insertedPayload[5]!).toMatchObject({
      company: 'Cedar Studio',
      applied_at: '2026-03-07',
      user_id: 'user-123',
    });

    vi.useRealTimers();
  });

  it('throws the Supabase error message for application failures', async () => {
    const fetchOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch failed' } });
    const fetchSelect = vi.fn(() => ({ order: fetchOrder }));

    const insert = vi.fn().mockResolvedValue({ error: { message: 'Create failed' } });

    const updateEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } });
    const update = vi.fn(() => ({ eq: updateEq }));

    const deleteEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } });
    const deleteMock = vi.fn(() => ({ eq: deleteEq }));

    const resetDeleteEq = vi.fn().mockResolvedValue({ error: { message: 'Reset delete failed' } });
    const resetDelete = vi.fn(() => ({ eq: resetDeleteEq }));

    fromMock
      .mockReturnValueOnce({ select: fetchSelect })
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce({ delete: resetDelete });

    await expect(fetchApplications()).rejects.toThrow('Fetch failed');
    await expect(createApplication(createFormInput(), 'user-123')).rejects.toThrow('Create failed');
    await expect(updateApplication('application-123', createFormInput())).rejects.toThrow('Update failed');
    await expect(deleteApplicationById('application-123')).rejects.toThrow('Delete failed');
    await expect(resetDemoApplications('user-123')).rejects.toThrow('Reset delete failed');
  });

  it('throws the seed failure message when demo reset insert fails', async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn(() => ({ eq: deleteEq }));
    const insert = vi.fn().mockResolvedValue({ error: { message: 'Seed insert failed' } });

    fromMock
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce({ insert });

    await expect(resetDemoApplications('user-123')).rejects.toThrow('Seed insert failed');
  });

  it('uses fallback messages when Supabase returns an empty application error message', async () => {
    const fetchOrder = vi.fn().mockResolvedValue({ data: null, error: { message: '' } });
    const fetchSelect = vi.fn(() => ({ order: fetchOrder }));

    const insert = vi.fn().mockResolvedValue({ error: { message: '' } });

    const updateEq = vi.fn().mockResolvedValue({ error: { message: '' } });
    const update = vi.fn(() => ({ eq: updateEq }));

    const deleteEq = vi.fn().mockResolvedValue({ error: { message: '' } });
    const deleteMock = vi.fn(() => ({ eq: deleteEq }));

    const resetDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const resetDelete = vi.fn(() => ({ eq: resetDeleteEq }));

    const resetInsert = vi.fn().mockResolvedValue({ error: { message: '' } });

    fromMock
      .mockReturnValueOnce({ select: fetchSelect })
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ delete: deleteMock })
      .mockReturnValueOnce({ delete: resetDelete })
      .mockReturnValueOnce({ insert: resetInsert });

    await expect(fetchApplications()).rejects.toThrow('Failed to fetch applications');
    await expect(createApplication(createFormInput(), 'user-123')).rejects.toThrow('Failed to create application');
    await expect(updateApplication('application-123', createFormInput())).rejects.toThrow(
      'Failed to update application',
    );
    await expect(deleteApplicationById('application-123')).rejects.toThrow('Failed to delete application');
    await expect(resetDemoApplications('user-123')).rejects.toThrow('Failed to seed demo applications');
  });
});
