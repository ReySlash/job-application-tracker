import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { ApplicationInput } from '../types/ApplicationInput';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import ApplicationForm from '../components/ApplicationForm';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import {
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
} from '../hooks/useApplicationMutations';

function ApplicationFormPage() {
  const { data: applicationsList = [], error, isLoading } = useApplicationsQuery();

  // Route state decides whether this page creates a new record or edits one.
  const params = useParams();
  const applicationId = params.id;
  const isEditing = Boolean(params.id);

  const navigate = useNavigate();
  const createApplicationMutation = useCreateApplicationMutation();
  const updateApplicationMutation = useUpdateApplicationMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0] ?? '';

  // Default values used when the form is opened in create mode.
  const emptyFormState = useMemo<ApplicationInput>(
    () => ({
      company: '',
      role: '',
      status: 'applied',
      appliedAt: today,
      location: '',
      jobUrl: '',
      notes: '',
    }),
    [today],
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
    setSubmitError(null);

    try {
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
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save application');
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-16 animate-pulse rounded bg-gray-200 dark:bg-slate-800" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error instanceof Error) {
    return <p className="p-4 text-red-600 dark:text-red-400">{error.message}</p>;
  }

  if (isEditing && !applicationToUpdate) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Application not found</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            The application you are trying to edit does not exist or may have been deleted.
          </p>
          <Link
            to="/applications"
            className="mt-6 inline-flex rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            Back to Applications
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-6 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800 dark:border-slate-700 dark:text-slate-100">
        {isEditing ? 'Update Application' : 'New Application'}
      </h2>

      <ApplicationForm
        key={applicationId ?? 'new'}
        onSubmit={onSubmit}
        initialFormState={initialFormState}
        isEditing={isEditing}
        submitError={submitError}
        onSubmitErrorChange={setSubmitError}
      />
    </div>
  );
}

export default ApplicationFormPage;
