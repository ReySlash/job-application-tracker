import { useContext, useMemo, useState } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import ApplicationsTable from "../components/ApplicationsTable";
import type { FilterStatus } from "../types/StatusFilter";
import type { DateOrderType } from "../types/DateOrderType";

function ApplicationsPage() {
  // Shared application data and actions come from the provider.
  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  // Local state for the search query, statys filter and date sort.
  const [searchQuery, setSearchQuery] = useState("");
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
  const [sortOrder, setSortOrder] = useState<DateOrderType>("none");

  // Sort a copy of the filtered list so the provider state stays unchanged.
  const sortedApplications = useMemo(() => {
    switch (sortOrder) {
      case "newest":
        return [...filteredApplications].sort(
          (a, b) =>
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
        );
      case "oldest":
        return [...filteredApplications].sort(
          (a, b) =>
            new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime(),
        );
      default:
        return filteredApplications;
    }
  }, [filteredApplications, sortOrder]);

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
      <h2 className="flex justify-center text-4xl p-2">Applications</h2>

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
            className="max-w-45 text-center rounded-md py-4 my-1 bg-teal-600 text-white p-2 mb-2 ml-5 hover:bg-teal-500 active:bg-teal-600 transition-colors duration-200"
          >
            Add New Application
          </Link>
        </div>
      ) : (
        <div>
          {/* Page actions and list controls */}
          <div className="grid grid-cols-5 items-center">
            <Link
              to="/applications/new"
              className="max-w-45 max-h-10 text-center col-span-1  rounded-md my-3 bg-teal-600 text-white p-2 ml-5 hover:bg-teal-500 active:bg-teal-600 transition-colors duration-200"
            >
              Add New Application
            </Link>

            {/* Search, Status filter and date sort */}
            <div className="col-span-4 flex justify-end mr-5 items-center">
              <div className="flex row space-x-2 m-1 items-center">
                <label className="py-4" htmlFor="search-field">
                  Search by company or role:
                </label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-h-10 border border-gray-300 rounded-md my-2 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                  id="search-field"
                  type="text"
                  placeholder="Search..."
                />
              </div>
              <label className="m-1 py-4" htmlFor="status-filter">
                Filter by status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
                id="status-filter"
                className="border border-black rounded-md p-1 my-3 mx-1 justify-end hover:cursor-pointer max-h-10 max-w-23"
              >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
              <label className="m-1 py-4" htmlFor="sort-order">
                Sort by applied date:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as DateOrderType)}
                id="sort-order"
                className="border border-black rounded-md p-1 my-3 mx-1 justify-end hover:cursor-pointer max-h-10 max-w-23"
              >
                <option value="none">None</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Applications table */}
          {sortedApplications.length === 0 ? (
            <p className="text-center mt-5 text-gray-500">
              No applications match the search and filter criteria.
            </p>
          ) : (
            <ApplicationsTable
              applications={sortedApplications}
              onDelete={removeApplication}
            />
          )}
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
