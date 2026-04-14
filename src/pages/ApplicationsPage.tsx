import { useContext, useMemo, useState } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { FilterStatus } from "../types/StatusFilter";
import type {
  MobileSortOption,
  SortConfig,
  SortKey,
} from "../types/SortConfig";
import ApplicationsListView from "../components/ApplicationsListView";
import filterIcon from "../assets/filterIcon.svg";
import closeIcon from "../assets/closeIcon.svg";

function ApplicationsPage() {
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

  return (
    <>
      <h2 className="flex justify-center text-4xl p-2 mb-5">Applications</h2>

      {/* Empty state */}
      {applicationsList.length === 0 ? (
        <div className="flex flex-col items-center">
          <p className="text-center text-gray-500 text-3xl">
            No applications found.
          </p>
          <p className="text-center text-gray-500 text-2xl">
            Create a new application to get started.
          </p>
          <Link
            to="/applications/new"
            className="max-w-45 text-center rounded-md py-4 my-1 bg-teal-600 text-white p-2 mb-2 ml-5 hover:bg-teal-500 hover:scale-105 active:bg-teal-600 transition-all duration-200"
          >
            Add New Application
          </Link>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={`fixed right-3 top-1 z-10 rounded p-2 transition-all duration-300 ease-in-out md:hidden ${
              filtersOpen ? "opacity-0" : "opacity-100"
            }`}
            aria-label="Open filters"
          >
            <img
              className="h-8 transition-transform duration-200 hover:scale-110 hover:cursor-pointer"
              src={filterIcon}
              alt=""
            />
          </button>

          {/* Page actions and list controls */}
          <div className="flex flex-col items-center justify-center gap-3 px-4 text-center md:grid md:grid-cols-5 md:gap-0 md:px-0">
            <Link
              to="/applications/new"
              className="w-full max-w-80 text-center md:w-auto md:max-w-45 md:max-h-20 lg:max-h-15 md:col-span-1 rounded-md md:my-3 bg-teal-600 text-white p-2 md:mx-5 hover:bg-teal-500 hover:scale-105 active:bg-teal-600 transition-all duration-200"
            >
              Add New Application
            </Link>

            {/* Search and Status filter */}
            <div className="hidden w-full flex-col items-center justify-center mt-5 md:mt-0 md:col-span-4 md:flex md:flex-row md:justify-end md:pr-5">
              <div className="grid w-full max-w-80 grid-cols-1 gap-3 md:m-1 md:max-w-none md:grid-cols-[minmax(16rem,auto)_auto_auto]  md:justify-end md:gap-2  md:items-center">
                <div className="flex min-w-0 flex-col md:flex-row whitespace-nowrap md:items-center">
                  <label className="md:py-4 md:mx-1" htmlFor="search-field">
                    Search by company or role:
                  </label>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full min-w-0 border border-gray-300 rounded-md md:my-2 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                    id="search-field"
                    type="text"
                    placeholder="Search..."
                  />
                </div>
                <div className="flex min-w-0 flex-col md:flex-row md:items-center md:my-2">
                  <label
                    className="md:m-1 md:py-4 whitespace-nowrap"
                    htmlFor="status-filter"
                  >
                    Filter by status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as FilterStatus)
                    }
                    id="status-filter"
                    className="h-10 w-full min-w-0 border border-black rounded-md p-2 md:p-0 md:my-3 md:w-23 md:mx-1 justify-end hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                  >
                    <option value="all">All</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
              className={`fixed inset-0 z-20 bg-black/30 transition-opacity duration-200 ${
                filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            {/* Filters */}
            <aside
              className={`fixed right-0 top-0 z-30 flex h-full w-80 max-w-[85vw] flex-col gap-4 bg-white p-5 shadow-lg transition-transform duration-300 ${
                filtersOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Filters</h3>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-md px-3 py-1 text-2xl leading-none hover:scale-110 transition-transform duration-200 hover:cursor-pointer"
                  aria-label="Close filters"
                >
                  <img className="size-6" src={closeIcon} alt="Close filters" />
                </button>
              </div>

              <div className="flex min-w-0 flex-col text-left">
                <label
                  className="mb-1 font-semibold"
                  htmlFor="mobile-search-field"
                >
                  Search by company or role:
                </label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full min-w-0 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                  id="mobile-search-field"
                  type="text"
                  placeholder="Search..."
                />
              </div>

              <div className="flex min-w-0 flex-col text-left">
                <label
                  className="mb-1 font-semibold"
                  htmlFor="mobile-status-filter"
                >
                  Filter by status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  id="mobile-status-filter"
                  className="h-10 w-full min-w-0 border border-black rounded-md p-2 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                >
                  <option value="all">All</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex min-w-0 flex-col text-left">
                <label
                  className="mb-1 font-semibold"
                  htmlFor="mobile-sort-filter"
                >
                  Sort by:
                </label>
                <select
                  onChange={(e) =>
                    handleMobileSortChange(e.target.value as MobileSortOption)
                  }
                  id="mobile-sort-filter"
                  className="h-10 w-full min-w-0 border border-black rounded-md p-2 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                >
                  <option value="none">None</option>
                  <option value="company-asc">Company A–Z</option>
                  <option value="company-desc">Company Z–A</option>
                  <option value="role-asc">Role A–Z</option>
                  <option value="role-desc">Role Z–A</option>
                  <option value="status-asc">Status A–Z</option>
                  <option value="status-desc">Status Z–A</option>
                  <option value="appliedAt-asc">Applied Date Oldest</option>
                  <option value="appliedAt-desc">Applied Date Newest</option>
                  <option value="location-asc">Location A–Z</option>
                  <option value="location-desc">Location Z–A</option>
                </select>
              </div>
            </aside>
            {/* Filters */}
          </div>

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
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
