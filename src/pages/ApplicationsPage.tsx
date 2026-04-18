import ApplicationsListView from '../components/ApplicationsListView';
import ApplicationsControls from '../components/ApplicationsControls';
import { Link } from 'react-router';

import useBanner from '../hooks/useBanner';
import useRemove from '../hooks/useRemove';
import useApplicationsList from '../hooks/useApplicationsList';

import ApplicationsEmptyState from '../components/ApplicationsEmptyState';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';

function ApplicationsPage() {
  const { data: applications = [], isLoading, error, isFetching } = useApplicationsQuery();

  const { successMessage, setSuccessMessage } = useBanner();

  const {
    sortedApplications,
    handleColumnSort,
    handleMobileSortChange,
    sortConfig,
    searchQuery,
    setSearchQuery,
    filtersOpen,
    setFiltersOpen,
    filterStatus,
    setFilterStatus,
  } = useApplicationsList(applications);

  // The remove function is also abstracted into a custom hook to keep the component focused on UI logic.
  const removeApplication = useRemove();

  if (isLoading || isFetching) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error instanceof Error) {
    return <p>{error.message}</p>;
  }

  if (applications.length === 0) {
    return <ApplicationsEmptyState />;
  }
  return (
    <>
      {successMessage && (
        <div className="mx-auto my-2 flex max-w-xl items-center justify-between rounded border border-green-300 bg-green-100 px-4 py-2 text-green-800">
          <span className="text-center">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-4 rounded px-2 py-1 font-medium hover:bg-green-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <h2 className="mb-2 flex justify-center p-2 text-4xl">Applications</h2>

      <div className="flex justify-center md:justify-start">
        <Link
          to="/applications/new"
          className="mx-15 inline-flex min-w-24 justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-teal-500"
        >
          Add New Application
        </Link>
      </div>
      <ApplicationsControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        handleMobileSortChange={handleMobileSortChange}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />

      {/* Applications table */}
      {sortedApplications.length === 0 ? (
        <p className="mt-5 text-center text-gray-500">
          No applications match the search and filter criteria.
        </p>
      ) : (
        <ApplicationsListView
          applications={sortedApplications}
          onDelete={(id, company) => removeApplication(id, company)}
          onSort={handleColumnSort}
          sortConfig={sortConfig}
        />
      )}
    </>
  );
}

export default ApplicationsPage;
