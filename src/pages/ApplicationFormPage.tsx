import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { ApplicationInput } from '../types/ApplicationInput';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import ApplicationForm from '../components/ApplicationForm';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
} from '../hooks/useApplicationMutations';

function ApplicationFormPage() {
  const { data: applicationsList = [] } = useApplicationsQuery();

  // Route state decides whether this page creates a new record or edits one.
  const params = useParams();
  const applicationId = params.id;
  const isEditing = Boolean(params.id);

  const navigate = useNavigate();
  const createApplicationMutation = useCreateApplicationMutation();
  const updateApplicationMutation = useUpdateApplicationMutation();

  // Default values used when the form is opened in create mode.
  const emptyFormState = useMemo<ApplicationInput>(
    () => ({
      company: '',
      role: '',
      status: 'applied',
      appliedAt: new Date().toISOString().split('T')[0],
      location: '',
      jobUrl: '',
      notes: '',
    }),
    [],
  );

  const applicationToUpdate = applicationsList.find(
    (application) => application.id === applicationId,
  );

  // RHF reads this once on mount, then the effect below keeps edit-mode data synced.
  const initialFormState: ApplicationInput = useMemo(
    () => (isEditing && applicationToUpdate ? applicationToUpdate : emptyFormState),
    [applicationToUpdate, emptyFormState, isEditing],
  );

  // Valid data from Zod is saved through the shared applications provider.
  const onSubmit = async (data: ApplicationsFormSchema) => {
    if (isEditing && applicationId) {
      await updateApplicationMutation.mutateAsync({ id: applicationId, input: data });
    } else {
      await createApplicationMutation.mutateAsync(data);
    }

    navigate('/applications', {
      state: {
        successMessage: isEditing
          ? 'Application updated successfully!'
          : 'Application created successfully!',
      },
    });
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-6 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800 dark:border-slate-700 dark:text-slate-100">
        {isEditing ? 'Update Application' : 'New Application'}
      </h2>

      <ApplicationForm
        onSubmit={onSubmit}
        initialFormState={initialFormState}
        isEditing={isEditing}
      />
    </div>
  );
}

export default ApplicationFormPage;
