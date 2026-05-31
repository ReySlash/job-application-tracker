import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '../api/applications';
import { useAuth } from './useAuth';

export function useApplicationsQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['applications'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('You must be signed in to view applications');
      }

      return fetchApplications(accessToken);
    },
  });
}
