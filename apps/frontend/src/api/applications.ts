import { supabase } from '../lib/supabase';
import { mapRowToApplication, type ApplicationWritePayload } from '../mappers/applicationMappers';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { Application } from '../types/ApplicationType';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type DemoApplicationSeed = Omit<ApplicationWritePayload, 'applied_at' | 'user_id'> & {
  daysAgo: number;
};

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

type BackendApplicationResponse = {
  application: BackendApplication;
};

type ApiErrorResponse = {
  message?: string;
};

const demoApplicationSeeds: DemoApplicationSeed[] = [
  {
    company: 'Northstar Labs',
    role: 'Frontend Engineer',
    status: 'interview',
    daysAgo: 1,
    location: 'Remote',
    job_url: 'https://example.com/northstar-frontend',
    notes: 'Technical screen scheduled. Review React Query and dashboard work.',
  },
  {
    company: 'BrightPath Health',
    role: 'React Developer',
    status: 'applied',
    daysAgo: 4,
    location: 'Miami, FL',
    job_url: 'https://example.com/brightpath-react',
    notes: 'Strong match for forms, validation, and user-facing workflows.',
  },
  {
    company: 'Atlas Cloud',
    role: 'UI Engineer',
    status: 'offer',
    daysAgo: 9,
    location: 'Hybrid',
    job_url: 'https://example.com/atlas-ui',
    notes: 'Offer received. Compare benefits, growth path, and project ownership.',
  },
  {
    company: 'Finch Analytics',
    role: 'Product Frontend Developer',
    status: 'applied',
    daysAgo: 18,
    location: 'Remote',
    job_url: 'https://example.com/finch-product-frontend',
    notes: 'Needs follow-up because the application is older than two weeks.',
  },
  {
    company: 'Orbit Retail',
    role: 'TypeScript Engineer',
    status: 'rejected',
    daysAgo: 28,
    location: 'New York, NY',
    job_url: 'https://example.com/orbit-typescript',
    notes: 'Rejected after recruiter screen. Useful comparison point for funnel metrics.',
  },
  {
    company: 'Cedar Studio',
    role: 'Junior Full Stack Developer',
    status: 'applied',
    daysAgo: 45,
    location: 'Austin, TX',
    job_url: 'https://example.com/cedar-full-stack',
    notes: 'Older application kept in the demo to make monthly activity charts useful.',
  },
];

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function mapDemoSeedsToPayloads(userId: string): ApplicationWritePayload[] {
  return demoApplicationSeeds.map((seed) => ({
    company: seed.company,
    role: seed.role,
    status: seed.status,
    applied_at: getDateDaysAgo(seed.daysAgo),
    location: seed.location,
    job_url: seed.job_url,
    notes: seed.notes,
    user_id: userId,
  }));
}

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

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T | ApiErrorResponse) : null;

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string' &&
      payload.message
        ? payload.message
        : fallbackMessage;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchApplications(accessToken: string): Promise<Application[]> {
  const response = await fetch(
    `${API_BASE_URL}/applications`,
    createApplicationsRequestInit('GET', accessToken),
  );
  const data = await parseResponse<ApplicationsListResponse>(response, 'Failed to fetch applications');

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

  await parseResponse<{ message: string }>(response, 'Failed to create application');
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

  await parseResponse<{ message: string }>(response, 'Failed to update application');
}

export async function deleteApplicationById(id: string, accessToken: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}`,
    createApplicationsRequestInit('DELETE', accessToken),
  );

  await parseResponse<{ message: string }>(response, 'Failed to delete application');
}

export async function resetDemoApplications(userId: string): Promise<void> {
  const { error: deleteError } = await supabase.from('applications').delete().eq('user_id', userId);

  if (deleteError) {
    throw new Error(deleteError.message || 'Failed to reset demo applications');
  }

  const { error: insertError } = await supabase
    .from('applications')
    .insert(mapDemoSeedsToPayloads(userId));

  if (insertError) {
    throw new Error(insertError.message || 'Failed to seed demo applications');
  }
}

export async function fetchApplicationById(id: string, accessToken: string): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/applications/${id}`,
    createApplicationsRequestInit('GET', accessToken),
  );
  const data = await parseResponse<BackendApplicationResponse>(response, 'Failed to fetch application');

  return normalizeApplication(data.application);
}
