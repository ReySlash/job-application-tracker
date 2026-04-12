import { useContext, useMemo, useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import ApplicationsTable from "../components/ApplicationsTable";
import type { FilterStatus } from "../types/StatusFilter";

function ApplicationsPage() {
  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");

  const filteredApplications = useMemo(() => {
    return filterStatus
      ? applicationsList.filter((app) => app.status === filterStatus)
      : applicationsList;
  }, [applicationsList, filterStatus]);

  const removeApplication = (id: number, company: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the application "${company}"?`,
      )
    ) {
      deleteApplication(id);
    }
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as FilterStatus);
  };

  return (
    <>
      <h2 className="flex justify-center text-4xl p-2">Applications</h2>

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
            className="border border-black rounded-md bg-gray-300 p-1 m-2"
          >
            Add New Application
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2">
            <Link
              to="/applications/new"
              className="max-w-45 text-center col-span-1 border border-black rounded-md bg-gray-300 p-1 mb-2 ml-5"
            >
              Add New Application
            </Link>
            <div className="col-span-1 flex justify-end mr-5">
              <label className="pt-3 " htmlFor="status-filter">
                Filter by status:
              </label>
              <select
                value={filterStatus}
                onChange={handleStatusFilterChange}
                id="status-filter"
                className="border border-black rounded-md p-1 m-2 justify-end"
              >
                <option value="">All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <ApplicationsTable
            applications={filteredApplications}
            onDelete={removeApplication}
          />
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
