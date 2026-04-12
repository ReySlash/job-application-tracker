import { useContext, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { Application } from "../types/ApplicationType";
import type { ApplicationInput } from "../types/ApplicationInput";

function ApplicationFormPage() {
  const { applicationsList } = useContext(ApplicationsContext);

  const params = useParams();

  const getInitialFormState = (): ApplicationInput => {
    return (
      applicationsList.find((a) => a.id === Number(params.id)) ?? {
        company: "",
        role: "",
        status: "applied",
        appliedAt: new Date().toISOString().split("T")[0],
        location: "",
        jobUrl: "",
        notes: "",
      }
    );
  };

  const initialFormState: ApplicationInput = getInitialFormState();

  const formRef = useRef<HTMLFormElement>(null);

  const { createApplication } = useContext(ApplicationsContext);
  const navigate = useNavigate();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;

    if (!form) {
      return;
    }

    const formData = new FormData(form);

    const newApplication: ApplicationInput = {
      company: String(formData.get("company") ?? ""),
      role: String(formData.get("role") ?? ""),
      status: String(
        formData.get("status") ?? "applied",
      ) as Application["status"],
      appliedAt: String(formData.get("appliedAt") ?? ""),
      location: String(formData.get("location") ?? ""),
      jobUrl: String(formData.get("jobUrl") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    createApplication(newApplication);
    form.reset();
    navigate("/applications");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        New Application
      </h2>

      <form
        ref={formRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          <label
            htmlFor="company"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Company
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="text"
            id="company"
            name="company"
            placeholder="e.g. Google"
            defaultValue={initialFormState.company}
            required
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="role"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="text"
            id="role"
            name="role"
            placeholder="e.g. Frontend Developer"
            defaultValue={initialFormState.role}
            required
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="status"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            id="status"
            name="status"
            defaultValue={initialFormState.status}
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="appliedAt"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Applied Date
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="date"
            id="appliedAt"
            name="appliedAt"
            defaultValue={initialFormState.appliedAt}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="location"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="text"
            id="location"
            name="location"
            placeholder="Remote, NY, etc."
            defaultValue={initialFormState.location}
            required
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="jobUrl"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Job URL
          </label>
          <input
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            type="url"
            id="jobUrl"
            name="jobUrl"
            placeholder="https://..."
            defaultValue={initialFormState.jobUrl}
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Notes
          </label>
          <textarea
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-25"
            id="notes"
            name="notes"
            placeholder="Add any details about the interview process..."
            defaultValue={initialFormState.notes}
          ></textarea>
        </div>
        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <Link
            to="/applications"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm"
          >
            Save Application
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplicationFormPage;
