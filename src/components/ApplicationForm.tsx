import { useForm } from 'react-hook-form';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import applicationsFormSchema from '../schemas/ApplicationsFormSchema';
import { useEffect } from 'react';
import { Link } from 'react-router';

type Props = {
  onSubmit: (data: ApplicationsFormSchema) => Promise<void>;
  initialFormState: ApplicationsFormSchema;
  isEditing: boolean;
};

function ApplicationForm(props: Props) {
  const { initialFormState, isEditing, onSubmit } = props;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationsFormSchema>({
    resolver: zodResolver(applicationsFormSchema),
    defaultValues: initialFormState,
  });

  // Reset when the selected application changes, such as navigating between edit pages.
  useEffect(() => {
    reset(initialFormState);
  }, [initialFormState, reset]);

  const buttonText = isEditing
    ? isSubmitting
      ? 'Updating...'
      : 'Update Application'
    : isSubmitting
      ? 'Saving...'
      : 'Save Application';
  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* if exist any error, show an alert error message */}
      {Object.keys(errors).length > 0 && (
        <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200 md:col-span-2">
          <strong className="font-bold">Please fix the highlighted fields.</strong>
          <ul className="mt-2 list-inside list-disc">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Company field */}
      <div className="flex flex-col">
        <label htmlFor="company" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Company
        </label>
        <input
          className="transition-ring rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          type="text"
          id="company"
          {...register('company')}
          placeholder="e.g. Google"
        />
        {errors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>}
      </div>

      {/* Role field */}
      <div className="flex flex-col">
        <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Role
        </label>
        <input
          className="transition-ring rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          type="text"
          id="role"
          {...register('role')}
          placeholder="e.g. Frontend Developer"
        />
        {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>}
      </div>

      {/* Application status field */}
      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Status
        </label>
        <select
          className="transition-ring rounded-md border border-gray-300 bg-white p-2 duration-200 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          id="status"
          {...register('status')}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>}
      </div>

      {/* Applied date field */}
      <div className="flex flex-col">
        <label htmlFor="appliedAt" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Applied Date
        </label>
        <input
          className="transition-ring rounded-md border border-gray-300 p-2 duration-200 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          type="date"
          id="appliedAt"
          {...register('appliedAt')}
        />
        {errors.appliedAt && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.appliedAt.message}</p>
        )}
      </div>

      {/* Location field */}
      <div className="flex flex-col">
        <label htmlFor="location" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Location
        </label>
        <input
          className="transition-ring rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          type="text"
          id="location"
          {...register('location')}
          placeholder="Remote, NY, etc."
        />
        {errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>}
      </div>

      {/* Job URL field */}
      <div className="flex flex-col">
        <label htmlFor="jobUrl" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Job URL
        </label>
        <input
          className="transition-ring rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          type="url"
          id="jobUrl"
          {...register('jobUrl')}
          placeholder="https://..."
        />
        {errors.jobUrl && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.jobUrl.message}</p>}
      </div>

      {/* Notes field */}
      <div className="flex flex-col md:col-span-2">
        <label htmlFor="notes" className="mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
          Notes
        </label>
        <textarea
          className="transition-ring min-h-25 rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          id="notes"
          {...register('notes')}
          placeholder="Add any details about the interview process..."
        ></textarea>
        {errors.notes && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>}
      </div>

      {/* Form actions */}
      <div className="mt-4 flex justify-end gap-3 md:col-span-2">
        <Link
          to="/applications"
          className="inline-flex min-w-24 justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-24 justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-teal-500"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;
