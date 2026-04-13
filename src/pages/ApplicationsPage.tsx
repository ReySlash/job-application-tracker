import { useContext, useMemo, useState } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import ApplicationsTable from "../components/ApplicationsTable";
import type { FilterStatus } from "../types/StatusFilter";
import type { DateOrderType } from "../types/DateOrderType";

function ApplicationsPage() {
  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredApplications = useMemo(() => {
    return filterStatus !== "all"
      ? applicationsList.filter((app) => app.status === filterStatus)
      : applicationsList;
  }, [applicationsList, filterStatus]);

  const [applicationsOrder, setApplicationsOrder] =
    useState<DateOrderType>("none");

  const sortedApplications = useMemo(() => {
    switch (applicationsOrder) {
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
  }, [filteredApplications, applicationsOrder]);

  const removeApplication = (id: number, company: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the application "${company}"?`,
      )
    ) {
      deleteApplication(id);
    }
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
            className="max-w-45 text-center rounded-md  bg-teal-600 text-white p-2 mb-2 ml-5 hover:bg-teal-500 active:bg-teal-600 transition-colors duration-200"
          >
            Add New Application
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2">
            <Link
              to="/applications/new"
              className="max-w-45 text-center col-span-1  rounded-md  bg-teal-600 text-white p-2 mb-2 ml-5 hover:bg-teal-500 active:bg-teal-600 transition-colors duration-200"
            >
              Add New Application
            </Link>
            <div className="col-span-1 flex justify-end mr-5">
              <label className="pt-3 " htmlFor="status-filter">
                Filter by status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
                id="status-filter"
                className="border border-black rounded-md p-1 m-2 justify-end hover:cursor-pointer"
              >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
              <label className="pt-3 " htmlFor="sort-order">
                Sort by applied date:
              </label>
              <select
                value={applicationsOrder}
                onChange={(e) =>
                  setApplicationsOrder(e.target.value as DateOrderType)
                }
                id="sort-order"
                className="border border-black rounded-md p-1 m-2 justify-end hover:cursor-pointer"
              >
                <option value="none">None</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
          <ApplicationsTable
            applications={sortedApplications}
            onDelete={removeApplication}
          />
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
