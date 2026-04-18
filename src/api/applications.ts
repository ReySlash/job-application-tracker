import { supabase } from '../lib/supabase';
import { mapRowToApplication } from '../mappers/applicationMappers';
import type { ApplicationRow } from '../types/ApplicationRow';
import type { Application } from '../types/ApplicationType';

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
