import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createApplication,
  deleteApplicationById,
  updateApplication,
} from '../api/applications';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import type { Application } from '../types/ApplicationType';
import { useAuth } from './useAuth';

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: ApplicationsFormSchema) => {
      if (!user) {
        throw new Error('You must be signed in to create an application');
      }

      return createApplication(input, user.id);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationsFormSchema }) =>
      updateApplication(id, input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApplicationById,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });

      const previousApplications = queryClient.getQueryData<Application[]>(['applications']) ?? [];

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
