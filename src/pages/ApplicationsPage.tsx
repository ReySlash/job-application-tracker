import { useContext } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import ApplicationsTable from "../components/ApplicationsTable";

function ApplicationsPage() {
  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  const removeApplication = (id: number) => {
    if (window.confirm(`Are you sure you want to delete this application?`)) {
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
            className="border border-black rounded-md bg-gray-300 p-1 m-2"
          >
            Add New Application
          </Link>
        </div>
      ) : (
        <div>
          <Link
            to="/applications/new"
            className="border border-black rounded-md bg-gray-300 p-1 m-2"
          >
            Add New Application
          </Link>
          <ApplicationsTable
            applications={applicationsList}
            onDelete={removeApplication}
          />
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
