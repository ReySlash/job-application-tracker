import { useContext, useEffect, useMemo, useState } from "react";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { FilterStatus } from "../types/StatusFilter";
import type {
  MobileSortOption,
  SortConfig,
  SortKey,
} from "../types/SortConfig";
import ApplicationsListView from "../components/ApplicationsListView";
import ApplicationsControls from "../components/ApplicationsControls";
import ApplicationsEmptyState from "../components/ApplicationsEmptyState";
import { Link, useLocation, useNavigate } from "react-router";

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

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    // clear route state so it doesn't persist
    navigate(location.pathname, { replace: true, state: null });

    return () => window.clearTimeout(timeoutId);
  }, [locationState, navigate, location.pathname]);

  // Shared application data and actions come from the provider.
  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  // Local state for the search query, status filter and date sort.
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Filtered list based on the search query, applied before status filtering and sorting.
  const searchedApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applicationsList.filter(
      (app) =>
        app.company.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query),
    );
  }, [applicationsList, searchQuery]);

  // Filter state controls which application statuses are visible.
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Apply the selected status filter before sorting.
  const filteredApplications = useMemo(() => {
    return filterStatus !== "all"
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [searchedApplications, filterStatus]);

  // Sort state controls the applied date ordering.
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sort a copy of the filtered list so the provider state stays unchanged.
  // handle mobile sort change from the dropdown
  const handleMobileSortChange = (value: MobileSortOption) => {
    if (value === "none") {
      setSortConfig(null);
      return;
    }
    const [sortKey, sortOrder] = value.split("-") as [SortKey, "asc" | "desc"];
    setSortConfig({ sortKey, sortOrder });
  };
  // handle column header sort click
  const handleColumnSort = (key: SortKey) => {
    if (!sortConfig || sortConfig.sortKey !== key) {
      setSortConfig({ sortKey: key, sortOrder: "asc" });
    } else {
      setSortConfig({
        sortKey: key,
        sortOrder: sortConfig.sortOrder === "asc" ? "desc" : "asc",
      });
    }
  };

  const sortedApplications = useMemo(() => {
    if (!sortConfig?.sortKey) return filteredApplications;

    const sorted = [...filteredApplications].sort((a, b) => {
      const aValue = a[sortConfig.sortKey];
      const bValue = b[sortConfig.sortKey];
      if (aValue < bValue) return sortConfig.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredApplications, sortConfig]);

  // Confirm before deleting so clicks in the table are not destructive by accident.
  const removeApplication = (id: number, company: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete this application at "${company}"?`,
      )
    ) {
      deleteApplication(id);
    }
  };
  if (applicationsList.length === 0) {
    return <ApplicationsEmptyState />;
  }

  return (
    <>
      {successMessage && (
        <div className="flex items-center justify-between rounded border border-green-300 bg-green-100 px-4 py-2 mx-100 my-2 text-green-800">
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

      <h2 className="flex justify-center text-4xl p-2 mb-2">Applications</h2>

      <div className="flex justify-center md:justify-start">
        <Link
          to="/applications/new"
          className="inline-block text-center whitespace-nowrap w-auto rounded-md bg-teal-600 text-white p-2 px-2 mx-5 hover:bg-teal-500 hover:scale-105 active:bg-teal-600 transition-all duration-200"
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
        <p className="text-center mt-5 text-gray-500">
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
