import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { ApplicationInput } from '../types/ApplicationInput';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import ApplicationForm from '../components/ApplicationForm';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import { queryClient } from '../lib/queryClient';
import { supabase } from '../lib/supabase';

function ApplicationFormPage() {
  const { data: applicationsList = [] } = useApplicationsQuery();

  // Route state decides whether this page creates a new record or edits one.
  const params = useParams();
  const applicationId = params.id;
  const isEditing = Boolean(params.id);

  const navigate = useNavigate();

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
    const payload = {
      company: data.company,
      role: data.role,
      status: data.status,
      applied_at: data.appliedAt,
      location: data.location,
      job_url: data.jobUrl || null,
      notes: data.notes || null,
    };

    if (isEditing && applicationId) {
      const { error } = await supabase
        .from('applications')
        .update(payload)
        .eq('id', applicationId);

      if (error) {
        throw new Error(error.message || 'Failed to update application');
      }
    } else {
      const { error } = await supabase.from('applications').insert(payload);

      if (error) {
        throw new Error(error.message || 'Failed to create application');
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['applications'] });

    navigate('/applications', {
      state: {
        successMessage: isEditing
          ? 'Application updated successfully!'
          : 'Application created successfully!',
      },
    });
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-800">
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
