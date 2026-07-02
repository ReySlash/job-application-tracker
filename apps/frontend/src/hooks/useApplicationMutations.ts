import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication, deleteApplicationById, updateApplication } from '../api/applications';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import type { Application } from '../types/ApplicationType';
import { useAuth } from './useAuth';

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (input: ApplicationsFormSchema) => {
      if (!accessToken) {
        throw new Error('You must be signed in to create an application');
      }

      return createApplication(input, accessToken);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationsFormSchema }) => {
      if (!accessToken) {
        throw new Error('You must be signed in to update an application');
      }

      return updateApplication(id, input, accessToken);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) {
        throw new Error('You must be signed in to delete an application');
      }

      return deleteApplicationById(id, accessToken);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });

      const previousApplications = queryClient.getQueryData<Application[]>(['applications']) ?? [];

      // Remove the row immediately for snappier UI, then roll back if the request fails.
      queryClient.setQueryData<Application[]>(['applications'], (currentApplications = []) =>
        currentApplications.filter((application) => application.id !== id),
      );

      return { previousApplications };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(['applications'], context?.previousApplications ?? []);
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
