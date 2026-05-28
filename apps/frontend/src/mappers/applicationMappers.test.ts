import { describe, expect, it } from 'vitest';

import {
  mapFormToCreatePayload,
  mapFormToUpdatePayload,
  mapRowToApplication,
} from './applicationMappers';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

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
    user_id: 'user-1',
    ...overrides,
  };
}

function createFormInput(overrides: Partial<ApplicationsFormSchema> = {}): ApplicationsFormSchema {
  return {
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'offer',
    appliedAt: '2026-04-21',
    location: 'Remote',
    jobUrl: 'https://example.com/jobs/1',
    notes: 'Strong fit',
    ...overrides,
  };
}

describe('applicationMappers', () => {
  it('maps DB rows to app models with normalized status and preserved fields', () => {
    expect(mapRowToApplication(createRow())).toEqual({
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
  });

  it('maps nullable DB fields to safe empty-string values', () => {
    expect(
      mapRowToApplication(
        createRow({
          status: 'offered',
          location: null,
          job_url: null,
          notes: null,
          created_at: null,
          updated_at: null,
        }),
      ),
    ).toEqual({
      id: 'application-1',
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'offer',
      appliedAt: '2026-04-21',
      location: '',
      jobUrl: '',
      notes: '',
      createdAt: '',
      updatedAt: '',
    });
  });

  it('throws for invalid row statuses', () => {
    expect(() => mapRowToApplication(createRow({ status: 'unknown-status' }))).toThrow(
      'Invalid application status: unknown-status',
    );
  });

  it('maps create form values to the DB payload shape', () => {
    expect(mapFormToCreatePayload(createFormInput(), 'user-123')).toEqual({
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'offer',
      applied_at: '2026-04-21',
      location: 'Remote',
      job_url: 'https://example.com/jobs/1',
      notes: 'Strong fit',
      user_id: 'user-123',
    });
  });

  it('maps update form values to the DB payload shape without user_id', () => {
    expect(mapFormToUpdatePayload(createFormInput())).toEqual({
      company: 'Acme',
      role: 'Frontend Engineer',
      status: 'offer',
      applied_at: '2026-04-21',
      location: 'Remote',
      job_url: 'https://example.com/jobs/1',
      notes: 'Strong fit',
    });
  });

  it('normalizes empty optional form fields to null', () => {
    const input = createFormInput({ jobUrl: '', notes: '' });

    expect(mapFormToCreatePayload(input, 'user-123')).toMatchObject({
      job_url: null,
      notes: null,
    });
    expect(mapFormToUpdatePayload(input)).toMatchObject({
      job_url: null,
      notes: null,
    });
  });
});
