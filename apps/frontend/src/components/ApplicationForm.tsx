import { useForm } from 'react-hook-form';
import type { ApplicationsFormSchema } from '../schemas/ApplicationsFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import applicationsFormSchema from '../schemas/ApplicationsFormSchema';
import { useEffect } from 'react';
import { Link } from 'react-router';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

type Props = {
  onSubmit: (data: ApplicationsFormSchema) => Promise<void>;
  initialFormState: ApplicationsFormSchema;
  isEditing: boolean;
  submitError?: string | null;
  onSubmitErrorChange?: (error: string | null) => void;
};

type FieldName = keyof ApplicationsFormSchema;

type BaseFieldConfig = {
  name: FieldName;
  label: string;
  placeholder?: string;
  colSpan?: 'single' | 'full';
};

type InputFieldConfig = BaseFieldConfig & {
  kind: 'input';
  type: 'text' | 'url' | 'date';
};

type SelectFieldConfig = BaseFieldConfig & {
  kind: 'select';
  options: Array<{ value: ApplicationsFormSchema['status']; label: string }>;
};

type TextareaFieldConfig = BaseFieldConfig & {
  kind: 'textarea';
};

type FieldConfig = InputFieldConfig | SelectFieldConfig | TextareaFieldConfig;

const fieldBaseClass =
  'transition-ring rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500';
const fieldErrorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

const applicationFields: FieldConfig[] = [
  { kind: 'input', name: 'company', label: 'Company', placeholder: 'e.g. Google', type: 'text' },
  { kind: 'input', name: 'role', label: 'Role', placeholder: 'e.g. Frontend Developer', type: 'text' },
  {
    kind: 'select',
    name: 'status',
    label: 'Status',
    options: [
      { value: 'applied', label: 'Applied' },
      { value: 'interview', label: 'Interview' },
      { value: 'offer', label: 'Offer' },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
  { kind: 'input', name: 'appliedAt', label: 'Applied Date', type: 'date' },
  { kind: 'input', name: 'location', label: 'Location', placeholder: 'Remote, NY, etc.', type: 'text' },
  { kind: 'input', name: 'jobUrl', label: 'Job URL', placeholder: 'https://...', type: 'url' },
  {
    kind: 'textarea',
    name: 'notes',
    label: 'Notes',
    placeholder: 'Add any details about the interview process...',
    colSpan: 'full',
  },
];

function getButtonText(isEditing: boolean, isSubmitting: boolean) {
  if (isEditing) {
    return isSubmitting ? 'Updating...' : 'Update Application';
  }

  return isSubmitting ? 'Saving...' : 'Save Application';
}

function FieldError({
  errors,
  name,
}: {
  errors: FieldErrors<ApplicationsFormSchema>;
  name: FieldName;
}) {
  const error = errors[name];

  if (!error?.message) {
    return null;
  }

  return <p className={fieldErrorClass}>{error.message}</p>;
}

function FormField({
  field,
  errors,
  register,
}: {
  field: FieldConfig;
  errors: FieldErrors<ApplicationsFormSchema>;
  register: UseFormRegister<ApplicationsFormSchema>;
}) {
  const wrapperClass = field.colSpan === 'full' ? 'flex flex-col md:col-span-2' : 'flex flex-col';
  const labelClass = 'mb-1 text-sm font-medium text-gray-700 dark:text-slate-200';

  return (
    <div className={wrapperClass}>
      <label htmlFor={field.name} className={labelClass}>
        {field.label}
      </label>
      {field.kind === 'select' ? (
        <select
          className={`${fieldBaseClass} bg-white hover:cursor-pointer dark:bg-slate-950`}
          id={field.name}
          {...register(field.name)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.kind === 'textarea' ? (
        <textarea
          className={`${fieldBaseClass} min-h-25`}
          id={field.name}
          {...register(field.name)}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          className={`${fieldBaseClass}${field.type === 'date' ? ' hover:cursor-pointer' : ''}`}
          type={field.type}
          id={field.name}
          {...register(field.name)}
          placeholder={field.placeholder}
        />
      )}
      <FieldError errors={errors} name={field.name} />
    </div>
  );
}

function ApplicationForm(props: Props) {
  const { initialFormState, isEditing, onSubmit, submitError, onSubmitErrorChange } = props;

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

  const buttonText = getButtonText(isEditing, isSubmitting);

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
      onChangeCapture={() => {
        if (submitError && onSubmitErrorChange) {
          onSubmitErrorChange(null);
        }
      }}
      noValidate
    >
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
      {submitError && (
        <div
          role="alert"
          className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200 md:col-span-2"
        >
          {submitError}
        </div>
      )}
      {applicationFields.map((field) => (
        <FormField key={field.name} field={field} errors={errors} register={register} />
      ))}

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
