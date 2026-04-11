import type { Application } from "../types/ApplicationType";
import removeIcon from "../assets/removeIcon.svg";
import updateIcon from "../assets/updateIcon.svg";
import viewIcon from "../assets/viewIcon.svg";
import { useContext } from "react";
import { Link } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";

function ApplicationsPage() {
  const columns: { header: string; key: keyof Application }[] = [
    { header: "Company", key: "company" },
    { header: "Role", key: "role" },
    { header: "Status", key: "status" },
    { header: "Applied Date", key: "appliedAt" },
    { header: "Location", key: "location" },
  ];

  const { applicationsList, deleteApplication } =
    useContext(ApplicationsContext);

  const removeApplication = (a: Application) => {
    if (
      window.confirm(
        `Are you sure you want to delete the application for ${a.company}?`,
      )
    ) {
      deleteApplication(a.id);
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
          <table className="w-full text-center border-collapse mt-3">
            <thead>
              <tr className="bg-gray-200">
                {columns.map((column) => (
                  <th className="px-1 py-1" key={column.key}>
                    {column.header}
                  </th>
                ))}
                <th className="px-1 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicationsList.map((a: Application) => (
                <tr
                  className="odd:bg-white even:bg-gray-200 hover:bg-gray-400"
                  key={a.id}
                >
                  {columns.map((column) => (
                    <td className="px-1 py-1" key={column.key}>
                      {String(a[column.key] ?? "-")}
                    </td>
                  ))}
                  <td className="px-1 py-1 flex gap-2 justify-center">
                    <Link to={`/applications/${a.id}`}>
                      <img className="h-6" src={viewIcon} alt="view button" />
                    </Link>
                    <Link
                      to={`/applications/${a.id}/edit`}
                      className="hover:cursor-pointer"
                    >
                      <img
                        className="h-6"
                        src={updateIcon}
                        alt="update button"
                      />
                    </Link>
                    <button
                      onClick={() => removeApplication(a)}
                      className="hover:cursor-pointer"
                    >
                      <img
                        className="h-6"
                        src={removeIcon}
                        alt="remove button"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default ApplicationsPage;
