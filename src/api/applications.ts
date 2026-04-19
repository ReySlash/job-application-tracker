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
};

function mapFormToApplicationPayload(input: ApplicationsFormSchema): ApplicationWritePayload {
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

export async function createApplication(input: ApplicationsFormSchema): Promise<void> {
  const { error } = await supabase.from('applications').insert(mapFormToApplicationPayload(input));

  if (error) {
    throw new Error(error.message || 'Failed to create application');
  }
}

export async function updateApplication(id: string, input: ApplicationsFormSchema): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update(mapFormToApplicationPayload(input))
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
