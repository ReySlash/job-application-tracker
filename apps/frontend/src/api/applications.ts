import { mapRowToApplication } from '../mappers/applicationMappers';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { Application } from '../types/ApplicationType';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import { parseApiResponse } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type BackendApplication = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string | Date | null;
  location: string | null;
  jobUrl: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
};

type ApplicationsListResponse = {
  applicationsList: BackendApplication[];
};

function normalizeDateOnly(value: string | Date | null): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.includes('T') ? value.slice(0, 10) : value;
}

function normalizeApplication(application: BackendApplication): Application {
  const row: ApplicationRow = {
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status,
    applied_at: normalizeDateOnly(application.appliedAt),
    location: application.location,
    job_url: application.jobUrl,
    notes: application.notes,
    created_at:
      application.createdAt instanceof Date
        ? application.createdAt.toISOString()
        : application.createdAt,
    updated_at:
      application.updatedAt instanceof Date
        ? application.updatedAt.toISOString()
        : application.updatedAt,
    user_id: application.userId,
  };

  return mapRowToApplication(row);
}

function createApplicationsRequestInit(method: string, accessToken: string, body?: unknown): RequestInit {
  return {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

export async function fetchApplications(accessToken: string): Promise<Application[]> {
  const response = await fetch(
    `${API_BASE_URL}/applications`,
    createApplicationsRequestInit('GET', accessToken),
  );
  const data = await parseApiResponse<ApplicationsListResponse>(
    response,
    'Failed to fetch applications',
    ['message', 'error'],
  );

  return data.applicationsList.map(normalizeApplication);
}

export async function createApplication(input: ApplicationsFormSchema, accessToken: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications`,
    createApplicationsRequestInit('POST', accessToken, {
      company: input.company,
      role: input.role,
      status: input.status,
      appliedAt: input.appliedAt,
      location: input.location,
      jobUrl: input.jobUrl || null,
      notes: input.notes || null,
    }),
  );

  await parseApiResponse<{ message: string }>(response, 'Failed to create application', ['message', 'error']);
}

export async function updateApplication(
  id: string,
  input: ApplicationsFormSchema,
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}`,
    createApplicationsRequestInit('PUT', accessToken, {
      company: input.company,
      role: input.role,
      status: input.status,
      appliedAt: input.appliedAt,
      location: input.location,
      jobUrl: input.jobUrl || null,
      notes: input.notes || null,
    }),
  );

  await parseApiResponse<{ message: string }>(response, 'Failed to update application', ['message', 'error']);
}

export async function deleteApplicationById(id: string, accessToken: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}`,
    createApplicationsRequestInit('DELETE', accessToken),
  );

  await parseApiResponse<{ message: string }>(response, 'Failed to delete application', ['message', 'error']);
}

export async function resetDemoApplications(accessToken: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications/demo-reset`,
    createApplicationsRequestInit('POST', accessToken),
  );

  await parseApiResponse<{ message: string }>(
    response,
    'Failed to reset demo applications',
    ['message', 'error'],
  );
}
