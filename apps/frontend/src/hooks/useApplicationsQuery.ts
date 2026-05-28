import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '../api/applications';

export function useApplicationsQuery() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  });
}
