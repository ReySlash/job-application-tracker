import { useForm } from "react-hook-form";
import type { ApplicationsFormSchema } from "../schemas/ApplicationsFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import applicationsFormSchema from "../schemas/ApplicationsFormSchema";
import { useEffect } from "react";
import { Link } from "react-router";

type Props = {
  onSubmit: (applicationInput: ApplicationsFormSchema) => void;
  initialFormState: ApplicationsFormSchema;
  isEditing: boolean;
};

function ApplicationForm(props: Props) {
  const { onSubmit, initialFormState, isEditing } = props;

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

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Company field */}
      <div className="flex flex-col">
        <label
          htmlFor="company"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Company
        </label>
        <input
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
          type="text"
          id="company"
          {...register("company")}
          placeholder="e.g. Google"
        />
        {errors.company && (
          <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
        )}
      </div>

      {/* Role field */}
      <div className="flex flex-col">
        <label
          htmlFor="role"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Role
        </label>
        <input
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
          type="text"
          id="role"
          {...register("role")}
          placeholder="e.g. Frontend Developer"
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Application status field */}
      <div className="flex flex-col">
        <label
          htmlFor="status"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white transition-ring duration-200 hover:cursor-pointer"
          id="status"
          {...register("status")}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      {/* Applied date field */}
      <div className="flex flex-col">
        <label
          htmlFor="appliedAt"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Applied Date
        </label>
        <input
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200 hover:cursor-pointer"
          type="date"
          id="appliedAt"
          {...register("appliedAt")}
        />
        {errors.appliedAt && (
          <p className="mt-1 text-sm text-red-600">
            {errors.appliedAt.message}
          </p>
        )}
      </div>

      {/* Location field */}
      <div className="flex flex-col">
        <label
          htmlFor="location"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Location
        </label>
        <input
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
          type="text"
          id="location"
          {...register("location")}
          placeholder="Remote, NY, etc."
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Job URL field */}
      <div className="flex flex-col">
        <label
          htmlFor="jobUrl"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Job URL
        </label>
        <input
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
          type="url"
          id="jobUrl"
          {...register("jobUrl")}
          placeholder="https://..."
        />
        {errors.jobUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.jobUrl.message}</p>
        )}
      </div>

      {/* Notes field */}
      <div className="flex flex-col md:col-span-2">
        <label
          htmlFor="notes"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-25 transition-ring duration-200"
          id="notes"
          {...register("notes")}
          placeholder="Add any details about the interview process..."
        ></textarea>
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Form actions */}
      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <Link
          to="/applications"
          className="max-h-10 p-2 bg-gray-300 hover:bg-gray-200 hover:scale-105 active:bg-gray-300 transition-all duration-200 rounded-md"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="max-w-45 text-center rounded-md  bg-teal-600 text-white p-2 mb-2 ml-5 hover:bg-teal-500 hover:scale-105 active:bg-teal-600 transition-all duration-200"
        >
          {isEditing ? "Update Application" : "Save Application"}
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;
