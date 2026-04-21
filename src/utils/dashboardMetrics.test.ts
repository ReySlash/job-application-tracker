import { describe, expect, it } from 'vitest';

import { getDashboardMetrics } from './dashboardMetrics';
import type { Application } from '../types/ApplicationType';

function createApplication(overrides: Partial<Application>): Application {
  return {
    id: 'application-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'applied',
    appliedAt: '2026-04-21',
    location: 'Remote',
    jobUrl: 'https://example.com/jobs/1',
    notes: 'Notes',
    createdAt: '2026-04-21T00:00:00.000Z',
    updatedAt: '2026-04-21T00:00:00.000Z',
    ...overrides,
  };
}

describe('getDashboardMetrics', () => {
  const today = new Date('2026-04-21T12:00:00.000Z');

  const applications: Application[] = [
    createApplication({ id: '1', company: 'Alpha', status: 'applied', appliedAt: '2026-04-21' }),
    createApplication({ id: '2', company: 'Bravo', status: 'applied', appliedAt: '2026-04-10' }),
    createApplication({ id: '3', company: 'Charlie', status: 'interview', appliedAt: '2026-04-19' }),
    createApplication({ id: '4', company: 'Delta', status: 'offer', appliedAt: '2026-04-02' }),
    createApplication({ id: '5', company: 'Echo', status: 'rejected', appliedAt: '2026-03-15' }),
    createApplication({ id: '6', company: 'Foxtrot', status: 'applied', appliedAt: '2026-01-12' }),
    createApplication({ id: '7', company: 'Ghost', status: 'applied', appliedAt: 'not-a-date' }),
  ];

  it('counts applications by status correctly', () => {
    const metrics = getDashboardMetrics(applications, today);

    expect(metrics.statusCounts).toEqual({
      applied: 4,
      interview: 1,
      offer: 1,
      rejected: 1,
    });
  });

  it('calculates interview and offer rates correctly', () => {
    const metrics = getDashboardMetrics(applications, today);

    expect(metrics.overviewCards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Interview Rate', value: '29%' }),
        expect.objectContaining({ label: 'Offer Rate', value: '14%' }),
      ]),
    );
  });

  it('counts weekly and monthly applications correctly', () => {
    const metrics = getDashboardMetrics(applications, today);

    expect(metrics.applicationsThisWeek).toBe(2);
    expect(metrics.applicationsThisMonth).toBe(4);
    expect(metrics.overviewCards).toContainEqual(
      expect.objectContaining({ label: 'This Week', value: 2, helperText: '4 this month' }),
    );
  });

  it('detects follow-ups after 14 days and sorts them by age', () => {
    const metrics = getDashboardMetrics(applications, today);

    expect(metrics.followUpApplications.map((application) => ({
      id: application.id,
      daysSinceApplied: application.daysSinceApplied,
    }))).toEqual([
      { id: '6', daysSinceApplied: 99 },
    ]);
  });

  it('builds monthly activity bins and returns the correct max activity value', () => {
    const metrics = getDashboardMetrics(applications, today);

    expect(metrics.monthlyActivityData).toEqual([
      { label: 'Nov', count: 0 },
      { label: 'Dec', count: 0 },
      { label: 'Jan', count: 1 },
      { label: 'Feb', count: 0 },
      { label: 'Mar', count: 1 },
      { label: 'Apr', count: 4 },
    ]);
    expect(metrics.maxMonthlyActivity).toBe(4);
  });

  it('returns zeroed percentage values when there are no applications', () => {
    const metrics = getDashboardMetrics([], today);

    expect(metrics.statusCounts).toEqual({
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    });
    expect(metrics.statusCards).toEqual([
      expect.objectContaining({ label: 'Applied', helperText: '0%' }),
      expect.objectContaining({ label: 'Interview', helperText: '0%' }),
      expect.objectContaining({ label: 'Offer', helperText: '0%' }),
      expect.objectContaining({ label: 'Rejected', helperText: '0%' }),
    ]);
    expect(metrics.statusChartData.every((item) => item.percent === 0)).toBe(true);
    expect(metrics.maxMonthlyActivity).toBe(0);
  });
});
