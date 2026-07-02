export const applicationInput = {
  company: 'Northstar Labs',
  role: 'Frontend Engineer',
  status: 'applied' as const,
  appliedAt: '2030-01-01',
  location: 'Remote',
  jobUrl: 'https://example.com/jobs/frontend',
  notes: 'Follow up next week',
};

export const applicationRecord = {
  id: 'application-1',
  company: 'Northstar Labs',
  role: 'Frontend Engineer',
  status: 'APPLIED',
  appliedAt: new Date('2030-01-01T00:00:00.000Z'),
  location: 'Remote',
  jobUrl: 'https://example.com/jobs/frontend',
  notes: 'Follow up next week',
  userId: 'user-1',
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
  updatedAt: new Date('2030-01-01T00:00:00.000Z'),
};
