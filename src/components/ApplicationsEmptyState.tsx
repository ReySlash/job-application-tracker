import { Link } from "react-router";

function ApplicationsEmptyState() {
  return (
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
  );
}

export default ApplicationsEmptyState;
