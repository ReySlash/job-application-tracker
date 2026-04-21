import type { Application, ApplicationStatus } from '../types/ApplicationType';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

export type ApplicationWritePayload = {
  company: string;
  role: string;
  status: ApplicationsFormSchema['status'];
  applied_at: string;
  location: string;
  job_url: string | null;
  notes: string | null;
  user_id: string;
};

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

  // Accept older/synonym values from the database and collapse them into the UI status set.
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

export function mapFormToCreatePayload(
  input: ApplicationsFormSchema,
  userId: string,
): ApplicationWritePayload {
  return {
    company: input.company,
    role: input.role,
    status: input.status,
    applied_at: input.appliedAt,
    location: input.location,
    // Supabase stores optional text fields as null so empty strings do not count as real values.
    job_url: input.jobUrl || null,
    notes: input.notes || null,
    user_id: userId,
  };
}

export function mapFormToUpdatePayload(input: ApplicationsFormSchema): Omit<ApplicationWritePayload, 'user_id'> {
  return {
    company: input.company,
    role: input.role,
    status: input.status,
    applied_at: input.appliedAt,
    location: input.location,
    job_url: input.jobUrl || null,
    notes: input.notes || null,
  };
}
