import type { FilterStatus } from "../types/StatusFilter";

type Props = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
};

function DesktopControls(props: Props) {
  const { searchQuery, setSearchQuery, filterStatus, setFilterStatus } = props;

  return (
    <>
      <div className="hidden w-full flex-col items-center justify-center mt-5 md:mt-0  md:flex md:flex-row md:justify-end ">
        <div className="grid w-full max-w-80 grid-cols-1 gap-3 md:max-w-none md:grid-cols-[minmax(16rem,auto)_auto_auto]  md:justify-end md:gap-2  md:items-center">
          <div className="flex min-w-0 flex-col md:flex-row whitespace-nowrap md:items-center">
            <label className="md:mx-1 md:py-4" htmlFor="search-field">
              Search by company or role:
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="transition-ring h-10 w-full min-w-0 rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              id="search-field"
              type="text"
              placeholder="Search..."
            />
          </div>
          <div className="flex min-w-0 flex-col md:flex-row md:items-center">
            <label className="whitespace-nowrap" htmlFor="status-filter">
              Filter by status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              id="status-filter"
              className="transition-ring h-10 w-full min-w-0 justify-end rounded-md border border-black p-2 duration-200 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:mx-1 md:w-23 md:p-0"
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
    </>
  );
}

export default DesktopControls;
