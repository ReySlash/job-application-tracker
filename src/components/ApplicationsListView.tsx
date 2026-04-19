import { Link } from 'react-router';
import removeIcon from '../assets/removeIcon.svg';
import updateIcon from '../assets/updateIcon.svg';
import viewIcon from '../assets/viewIcon.svg';

import type { Application } from '../types/ApplicationType';
import StatusBadge from './StatusBadge';
import type { SortConfig, SortKey } from '../types/SortConfig';

type Props = {
  applications: Application[];
  onSort: (sortKey: SortKey) => void;
  sortConfig: SortConfig;
};

function ApplicationsListView(props: Props) {
  const { applications, onSort, sortConfig } = props;

  const columns: {
    header: string;
    key: 'company' | 'role' | 'status' | 'appliedAt' | 'location';
  }[] = [
    { header: 'Company', key: 'company' },
    { header: 'Role', key: 'role' },
    { header: 'Status', key: 'status' },
    { header: 'Applied Date', key: 'appliedAt' },
    { header: 'Location', key: 'location' },
  ];
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="">
              {columns.map((column) => (
                <th className="bg-teal-600 px-1 py-1 text-center text-white" key={column.key}>
                  <button
                    onClick={() => onSort(column.key)}
                    className="mx-auto flex items-center justify-center hover:cursor-pointer hover:underline"
                  >
                    {sortConfig?.sortKey === column.key ? (
                      <span className="font-bold underline">
                        {sortConfig.sortOrder === 'asc' ? '↑' : '↓'} {column.header}
                      </span>
                    ) : (
                      column.header
                    )}
                  </button>
                </th>
              ))}
              <th className="bg-teal-600 px-1 py-1 text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a: Application) => (
              <tr className="odd:bg-white even:bg-gray-200 hover:bg-gray-300" key={a.id}>
                {columns.map((column) => (
                  <td className="px-1 py-1" key={column.key}>
                    {column.key === 'status' ? (
                      <StatusBadge status={a[column.key]} />
                    ) : (
                      String(a[column.key] ?? '-')
                    )}
                  </td>
                ))}
                <td className="px-1 py-1">
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <Link
                      to={`/applications/${a.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center hover:cursor-pointer"
                    >
                      <img
                        className="h-6 transition-transform duration-150 hover:scale-150"
                        src={viewIcon}
                        alt="view button"
                      />
                    </Link>
                    <Link
                      to={`/applications/${a.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center hover:cursor-pointer"
                    >
                      <img
                        className="h-6 transition-transform duration-150 hover:scale-150"
                        src={updateIcon}
                        alt="update button"
                      />
                    </Link>
                    <button className="inline-flex h-8 w-8 items-center justify-center hover:cursor-pointer">
                      <img
                        className="h-6 transition-transform duration-150 hover:scale-150"
                        src={removeIcon}
                        alt="remove button"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mx-10 my-3 flex flex-col items-center justify-center gap-4 md:m-10 md:hidden">
        {applications.map((a: Application) => (
          <div
            className="w-full items-center rounded-md border border-gray-300 p-4 shadow-md"
            key={a.id}
          >
            {columns.map((column) => (
              <div className="my-2 text-center" key={column.key}>
                <strong className="mx-3 text-[18px]">{column.header}:</strong>{' '}
                {column.key === 'status' ? (
                  <StatusBadge status={a[column.key]} />
                ) : (
                  String(a[column.key] ?? '-')
                )}
              </div>
            ))}
            <div className="flex flex-row justify-center gap-2">
              <strong className="text-[18px]">Actions:</strong>
              <Link to={`/applications/${a.id}`}>
                <img
                  className="h-6 transition-transform duration-150 hover:scale-130"
                  src={viewIcon}
                  alt="view button"
                />
              </Link>
              <Link to={`/applications/${a.id}/edit`} className="hover:cursor-pointer">
                <img
                  className="h-6 transition-transform duration-150 hover:scale-130"
                  src={updateIcon}
                  alt="update button"
                />
              </Link>
              <button className="hover:cursor-pointer">
                <img
                  className="h-6 transition-transform duration-150 hover:scale-130"
                  src={removeIcon}
                  alt="remove button"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ApplicationsListView;
