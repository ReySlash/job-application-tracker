import { describe, expect, it } from 'vitest';

import applicationsFormSchema from './ApplicationsFormSchema';

function createValidPayload(overrides: Record<string, unknown> = {}) {
  return {
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'applied',
    appliedAt: '2026-04-21',
    location: 'Remote',
    jobUrl: 'https://example.com/jobs/1',
    notes: 'Strong fit',
    ...overrides,
  };
}

describe('applicationsFormSchema', () => {
  it('accepts a valid form payload', () => {
    const result = applicationsFormSchema.safeParse(createValidPayload());

    expect(result.success).toBe(true);
  });

  it('rejects invalid dates', () => {
    const result = applicationsFormSchema.safeParse(createValidPayload({ appliedAt: 'not-a-date' }));

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.appliedAt).toContain('Please enter a valid date');
  });

  it('rejects invalid URLs', () => {
    const result = applicationsFormSchema.safeParse(createValidPayload({ jobUrl: 'not-a-url' }));

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.jobUrl).toContain('Please enter a valid URL');
  });

  it('enforces required fields', () => {
    const result = applicationsFormSchema.safeParse(
      createValidPayload({ company: ' ', role: ' ', appliedAt: '', location: ' ' }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.company).toContain('This field is required');
    expect(result.error?.flatten().fieldErrors.role).toContain('This field is required');
    expect(result.error?.flatten().fieldErrors.appliedAt).toContain('This field is required');
    expect(result.error?.flatten().fieldErrors.location).toContain('This field is required');
  });

  it('enforces minimum lengths after trimming', () => {
    const result = applicationsFormSchema.safeParse(
      createValidPayload({ company: ' A ', role: ' B ', location: ' C ' }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.company).toContain(
      'Company name must be at least 2 characters long.',
    );
    expect(result.error?.flatten().fieldErrors.role).toContain('Role must be at least 2 characters long.');
    expect(result.error?.flatten().fieldErrors.location).toContain(
      'Location must be at least 2 characters long.',
    );
  });

  it('handles optional fields correctly', () => {
    const result = applicationsFormSchema.safeParse(
      createValidPayload({ jobUrl: '', notes: '  Follow up soon  ' }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      jobUrl: '',
      notes: 'Follow up soon',
    });
  });

  it('allows omitted optional fields', () => {
    const payload = { ...createValidPayload() };
    Reflect.deleteProperty(payload, 'jobUrl');
    Reflect.deleteProperty(payload, 'notes');
    const result = applicationsFormSchema.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('jobUrl');
    expect(result.data).not.toHaveProperty('notes');
  });
});
