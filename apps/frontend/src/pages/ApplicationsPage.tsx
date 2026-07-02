import { useEffect } from 'react';
import ApplicationsListView from '../components/ApplicationsListView';
import ApplicationsControls from '../components/ApplicationsControls';
import { Link, useOutletContext } from 'react-router';

import useBanner from '../hooks/useBanner';
import useApplicationsList from '../hooks/useApplicationsController';

import ApplicationsEmptyState from '../components/ApplicationsEmptyState';
import ApplicationsListSkeleton from '../components/ApplicationsListSkeleton';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import { useDeleteApplicationMutation } from '../hooks/useApplicationMutations';
import type { AppLayoutOutletContext } from '../layouts/AppLayout';

function ApplicationsPage() {
  const { data: applications = [], isLoading, error } = useApplicationsQuery();
  const deleteApplicationMutation = useDeleteApplicationMutation();
  const { closeSidebar, registerMobileOverlayCloser } = useOutletContext<AppLayoutOutletContext>();

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

  const { isPending } = deleteApplicationMutation;

  useEffect(() => {
    registerMobileOverlayCloser(() => setFiltersOpen(false));

    return () => {
      registerMobileOverlayCloser(null);
    };
  }, [registerMobileOverlayCloser, setFiltersOpen]);

  const handleDeleteApplication = async (id: string) => {
    await deleteApplicationMutation.mutateAsync(id);
    setSuccessMessage('Application deleted successfully!');
  };

  const handleOpenFilters = () => {
    closeSidebar();
    setFiltersOpen(true);
  };

  const successBanner = successMessage ? (
    <div className="mx-auto my-2 flex max-w-xl items-center justify-between rounded border border-green-300 bg-green-100 px-4 py-2 text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200">
      <span className="text-center">{successMessage}</span>
      <button
        type="button"
        onClick={() => setSuccessMessage(null)}
        className="ml-4 rounded px-2 py-1 font-medium hover:bg-green-200 dark:hover:bg-green-900"
      >
        Dismiss
      </button>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <>
        <h2 className="mb-2 flex justify-center p-2 text-4xl">Applications</h2>
        <div className="flex justify-center md:justify-start">
          <div className="mx-15 h-9 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-slate-800" />
        </div>
        <ApplicationsListSkeleton />
      </>
    );
  }

  if (error instanceof Error) {
    return <p className="p-4 text-red-600 dark:text-red-400">{error.message}</p>;
  }

  if (applications.length === 0) {
    return (
      <>
        {successBanner}
        <ApplicationsEmptyState />
      </>
    );
  }
  return (
    <>
      {successBanner}

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
        openFilters={handleOpenFilters}
        setFiltersOpen={setFiltersOpen}
      />

      {sortedApplications.length === 0 ? (
        <p className="mt-5 text-center text-gray-500 dark:text-slate-400">
          No applications match the search and filter criteria.
        </p>
      ) : (
        <ApplicationsListView
          applications={sortedApplications}
          onSort={handleColumnSort}
          sortConfig={sortConfig}
          deleteApplication={handleDeleteApplication}
          isDeleting={isPending}
        />
      )}
    </>
  );
}

export default ApplicationsPage;
