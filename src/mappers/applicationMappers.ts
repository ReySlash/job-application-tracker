import type { Application, ApplicationStatus } from '../types/ApplicationType';
import type { ApplicationRow } from '../types/ApplicationRow';

const statusMap: Record<string, ApplicationStatus> = {
  applied: 'applied',
  interview: 'interview',
  interviewing: 'interview',
  offer: 'offer',
  offered: 'offer',
  rejected: 'rejected',
};

function parseApplicationStatus(value: string): ApplicationStatus {
  const normalized = value.trim().toLowerCase();
  const mapped = statusMap[normalized];

  if (mapped) {
    return mapped;
  }

  throw new Error(`Invalid application status: ${value}`);
}
export function mapRowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: parseApplicationStatus(row.status),
    appliedAt: row.applied_at,
    location: row.location ?? '',
    jobUrl: row.job_url ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}
