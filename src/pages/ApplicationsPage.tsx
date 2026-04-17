import { useContext, useEffect, useMemo, useState } from 'react';
import ApplicationsContext from '../contexts/ApplicationsContext';
import type { FilterStatus } from '../types/StatusFilter';
import type { MobileSortOption, SortConfig, SortKey } from '../types/SortConfig';
import ApplicationsListView from '../components/ApplicationsListView';
import ApplicationsControls from '../components/ApplicationsControls';
import ApplicationsEmptyState from '../components/ApplicationsEmptyState';
import { Link, useLocation, useNavigate } from 'react-router';

type ApplicationsPageLocationState = {
  successMessage?: string;
} | null;

function ApplicationsPage() {
  // Banner state
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as ApplicationsPageLocationState;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = locationState?.successMessage;
    if (!message) return;

    // Safe: setting state from navigation state, no loop risk
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccessMessage(message);

    // Clear route state so the banner does not reappear on reload/back navigation.
    navigate(location.pathname, { replace: true, state: null });
  }, [locationState, navigate, location.pathname]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  // Shared application data and actions come from the provider.
  const { applicationsList, deleteApplication } = useContext(ApplicationsContext);

  // Local state for the search query, status filter and date sort.
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Filtered list based on the search query, applied before status filtering and sorting.
  const searchedApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applicationsList.filter(
      (app) => app.company.toLowerCase().includes(query) || app.role.toLowerCase().includes(query),
    );
  }, [applicationsList, searchQuery]);

  // Filter state controls which application statuses are visible.
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Apply the selected status filter before sorting.
  const filteredApplications = useMemo(() => {
    return filterStatus !== 'all'
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [searchedApplications, filterStatus]);

  // Sort state controls the applied date ordering.
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sort a copy of the filtered list so the provider state stays unchanged.
  // handle mobile sort change from the dropdown
  const handleMobileSortChange = (value: MobileSortOption) => {
    if (value === 'none') {
      setSortConfig(null);
      return;
    }
    const [sortKey, sortOrder] = value.split('-') as [SortKey, 'asc' | 'desc'];
    setSortConfig({ sortKey, sortOrder });
  };
  // handle column header sort click
  const handleColumnSort = (key: SortKey) => {
    if (!sortConfig || sortConfig.sortKey !== key) {
      setSortConfig({ sortKey: key, sortOrder: 'asc' });
    } else {
      setSortConfig({
        sortKey: key,
        sortOrder: sortConfig.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  const sortedApplications = useMemo(() => {
    if (!sortConfig?.sortKey) return filteredApplications;

    const sorted = [...filteredApplications].sort((a, b) => {
      const aValue = a[sortConfig.sortKey];
      const bValue = b[sortConfig.sortKey];
      if (aValue < bValue) return sortConfig.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredApplications, sortConfig]);

  // Confirm before deleting so clicks in the table are not destructive by accident.
  const removeApplication = (id: number, company: string) => {
    if (window.confirm(`Are you sure you want to delete this application at "${company}"?`)) {
      deleteApplication(id);
    }
  };
  if (applicationsList.length === 0) {
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
          onDelete={removeApplication}
          onSort={handleColumnSort}
          sortConfig={sortConfig}
        />
      )}
    </>
  );
}

export default ApplicationsPage;
