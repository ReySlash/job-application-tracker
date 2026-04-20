import { supabase } from '../lib/supabase';
import { mapRowToApplication } from '../mappers/applicationMappers';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { Application } from '../types/ApplicationType';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';

type ApplicationWritePayload = {
  company: string;
  role: string;
  status: ApplicationsFormSchema['status'];
  applied_at: string;
  location: string;
  job_url: string | null;
  notes: string | null;
  user_id: string;
};

type DemoApplicationSeed = Omit<ApplicationWritePayload, 'applied_at' | 'user_id'> & {
  daysAgo: number;
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

function mapFormToApplicationPayload(
  input: ApplicationsFormSchema,
  userId: string,
): ApplicationWritePayload {
  return {
    company: input.company,
    role: input.role,
    status: input.status,
    applied_at: input.appliedAt,
    location: input.location,
    job_url: input.jobUrl || null,
    notes: input.notes || null,
    user_id: userId,
  };
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch applications');
  }

  return ((data ?? []) as ApplicationRow[]).map(mapRowToApplication);
}

export async function createApplication(input: ApplicationsFormSchema, userId: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .insert(mapFormToApplicationPayload(input, userId));

  if (error) {
    throw new Error(error.message || 'Failed to create application');
  }
}

export async function updateApplication(id: string, input: ApplicationsFormSchema): Promise<void> {
  const payload = {
    company: input.company,
    role: input.role,
    status: input.status,
    applied_at: input.appliedAt,
    location: input.location,
    job_url: input.jobUrl || null,
    notes: input.notes || null,
  };

  const { error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to update application');
  }
}

export async function deleteApplicationById(id: string): Promise<void> {
  const { error } = await supabase.from('applications').delete().eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete application');
  }
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
