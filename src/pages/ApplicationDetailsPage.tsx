import { useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ApplicationsContext from '../contexts/ApplicationsContext';
import StatusBadge from '../components/StatusBadge';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const applicationId = Number(id);

  const { applicationsList, deleteApplication } = useContext(ApplicationsContext);

  const application = applicationsList.find((item) => item.id === applicationId);

  const handleDelete = () => {
    if (!application) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the application for "${application.role}" at "${application.company}"?`,
    );

    if (!confirmed) return;

    deleteApplication(application.id);

    navigate('/applications', {
      state: {
        successMessage: 'Application deleted successfully!',
      },
    });
  };

  if (!application) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Application not found</h1>

          <p className="mt-3 text-slate-600">
            The application you are looking for does not exist or may have been deleted.
          </p>

          <div className="mt-6">
            <Link
              to="/applications"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Back to Applications
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Application Details</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{application.role}</h1>
          <p className="mt-2 text-lg text-slate-600">{application.company}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/applications"
            className="max-h-10 min-w-24 rounded-md bg-gray-300 p-2 text-center transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:bg-gray-300"
          >
            Back
          </Link>

          <Link
            to={`/applications/${application.id}/edit`}
            className="min-w-24 rounded-md bg-teal-600 p-2 text-center text-white transition-all duration-200 hover:scale-105 hover:bg-teal-500 active:bg-teal-600"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="min-w-24 rounded-md border border-red-500 p-2 text-center text-red-500 transition-all duration-200 hover:scale-105 hover:bg-red-500 hover:text-white active:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Company</dt>
              <dd className="mt-1 text-base text-slate-900">{application.company}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Role</dt>
              <dd className="mt-1 text-base text-slate-900">{application.role}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={application.status} />
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Applied Date</dt>
              <dd className="mt-1 text-base text-slate-900">{formatDate(application.appliedAt)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Location</dt>
              <dd className="mt-1 text-base text-slate-900">
                {application.location || 'Not provided'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Job URL</dt>
              <dd className="mt-1 text-base text-slate-900">
                {application.jobUrl ? (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-blue-600 hover:underline"
                  >
                    View job posting
                  </a>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
          <p className="mt-4 whitespace-pre-wrap text-slate-700">
            {application.notes?.trim() || 'No notes added yet.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Record Info</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Created At</dt>
              <dd className="mt-1 text-base text-slate-900">{formatDate(application.createdAt)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-base text-slate-900">{formatDate(application.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default ApplicationDetailsPage;
