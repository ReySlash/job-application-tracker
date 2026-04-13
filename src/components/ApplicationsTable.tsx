import { Link } from "react-router";
import removeIcon from "../assets/removeIcon.svg";
import updateIcon from "../assets/updateIcon.svg";
import viewIcon from "../assets/viewIcon.svg";

import type { Application } from "../types/ApplicationType";
import StatusBadge from "./StatusBadge";
import type { SortConfig } from "../types/SortConfig";

type Props = {
  applications: Application[];
  onDelete: (id: number, company: string) => void;
  onSort: (sortKey: NonNullable<SortConfig>["sortKey"]) => void;
  sortConfig: SortConfig;
};

function ApplicationsTable(props: Props) {
  const { applications, onDelete, onSort, sortConfig } = props;

  const columns: {
    header: string;
    key: "company" | "role" | "status" | "appliedAt" | "location";
  }[] = [
    { header: "Company", key: "company" },
    { header: "Role", key: "role" },
    { header: "Status", key: "status" },
    { header: "Applied Date", key: "appliedAt" },
    { header: "Location", key: "location" },
  ];
  return (
    <table className="w-full text-center border-collapse mt-3">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((column) => (
            <th
              className="px-1 py-1 bg-teal-600 text-white text-center"
              key={column.key}
            >
              <button
                onClick={() => onSort(column.key)}
                className="hover:cursor-pointer flex items-center justify-center mx-auto "
              >
                {sortConfig?.sortKey === column.key ? (
                  <span className="font-bold underline">
                    {sortConfig.sortOrder === "asc" ? "↑" : "↓"} {column.header}
                  </span>
                ) : (
                  column.header
                )}
              </button>
            </th>
          ))}
          <th className="px-1 py-1  bg-teal-600 text-white">Actions</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((a: Application) => (
          <tr
            className="odd:bg-white even:bg-gray-200 hover:bg-gray-300"
            key={a.id}
          >
            {columns.map((column) => (
              <td className="px-1 py-1" key={column.key}>
                {column.key === "status" ? (
                  <StatusBadge status={a[column.key]} />
                ) : (
                  String(a[column.key] ?? "-")
                )}
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
                <img className="h-6" src={updateIcon} alt="update button" />
              </Link>
              <button
                onClick={() => onDelete(a.id, a.company)}
                className="hover:cursor-pointer"
              >
                <img className="h-6" src={removeIcon} alt="remove button" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApplicationsTable;
