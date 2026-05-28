import closeIcon from "../assets/closeIcon.svg";
import type { FilterStatus } from "../types/StatusFilter";

type Props = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
};

function DashboardMobileControls(props: Props) {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filtersOpen,
    setFiltersOpen,
  } = props;

  return (
    <>
      <aside
        className={`fixed right-0 top-0 z-30 flex h-full w-80 max-w-[85vw] flex-col gap-4 bg-white p-5 shadow-lg transition-transform duration-300 dark:bg-slate-900 dark:text-slate-100 ${
          filtersOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Filters</h3>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="rounded-md px-3 py-1 text-2xl leading-none transition-transform duration-200 hover:scale-110 hover:cursor-pointer dark:invert"
            aria-label="Close filters"
          >
            <img className="h-6 w-6" src={closeIcon} alt="Close filters" />
          </button>
        </div>

        <div className="flex min-w-0 flex-col text-left">
          <label className="mb-1 font-semibold" htmlFor="mobile-search-field">
            Search by company or role:
          </label>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="transition-ring h-10 w-full min-w-0 rounded-md border border-gray-300 p-2 duration-200 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            id="mobile-search-field"
            type="text"
            placeholder="Search..."
          />
        </div>

        <div className="flex min-w-0 flex-col text-left">
          <label className="mb-1 font-semibold" htmlFor="mobile-status-filter">
            Filter by status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            id="mobile-status-filter"
            className="transition-ring h-10 w-full min-w-0 rounded-md border border-black p-2 duration-200 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </aside>
    </>
  );
}

export default DashboardMobileControls;
