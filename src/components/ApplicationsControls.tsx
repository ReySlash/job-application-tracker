import { Link } from "react-router";
import type { FilterStatus } from "../types/StatusFilter";
import type { MobileSortOption } from "../types/SortConfig";

import filterIcon from "../assets/filterIcon.svg";
import closeIcon from "../assets/closeIcon.svg";

type Props = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  handleMobileSortChange: (option: MobileSortOption) => void;
};

function ApplicationsControls(props: Props) {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filtersOpen,
    setFiltersOpen,
    handleMobileSortChange,
  } = props;
  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={`fixed right-3 top-1 z-10 rounded p-2 transition-all duration-300 ease-in-out md:hidden ${
            filtersOpen ? "opacity-0" : "opacity-100"
          }`}
          aria-label="Open filters"
        >
          <img
            className="h-8 transition-transform duration-200 hover:scale-110 hover:cursor-pointer"
            src={filterIcon}
            alt=""
          />
        </button>

        {/* Page actions and list controls */}
        <div className="flex flex-col items-center justify-center gap-3 px-4 text-center md:grid md:grid-cols-5 md:gap-0 md:px-0">
          <Link
            to="/applications/new"
            className="w-full max-w-80 text-center md:w-auto md:max-w-45 md:max-h-20 lg:max-h-15 md:col-span-1 rounded-md md:my-3 bg-teal-600 text-white p-2 md:mx-5 hover:bg-teal-500 hover:scale-105 active:bg-teal-600 transition-all duration-200"
          >
            Add New Application
          </Link>

          {/* Search and Status filter */}
          <div className="hidden w-full flex-col items-center justify-center mt-5 md:mt-0 md:col-span-4 md:flex md:flex-row md:justify-end md:pr-5">
            <div className="grid w-full max-w-80 grid-cols-1 gap-3 md:m-1 md:max-w-none md:grid-cols-[minmax(16rem,auto)_auto_auto]  md:justify-end md:gap-2  md:items-center">
              <div className="flex min-w-0 flex-col md:flex-row whitespace-nowrap md:items-center">
                <label className="md:py-4 md:mx-1" htmlFor="search-field">
                  Search by company or role:
                </label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full min-w-0 border border-gray-300 rounded-md md:my-2 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                  id="search-field"
                  type="text"
                  placeholder="Search..."
                />
              </div>
              <div className="flex min-w-0 flex-col md:flex-row md:items-center md:my-2">
                <label
                  className="md:m-1 md:py-4 whitespace-nowrap"
                  htmlFor="status-filter"
                >
                  Filter by status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  id="status-filter"
                  className="h-10 w-full min-w-0 border border-black rounded-md p-2 md:p-0 md:my-3 md:w-23 md:mx-1 justify-end hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
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
        </div>

        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className={`fixed inset-0 z-20 bg-black/30 transition-opacity duration-200 ${
              filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          {/* Filters */}
          <aside
            className={`fixed right-0 top-0 z-30 flex h-full w-80 max-w-[85vw] flex-col gap-4 bg-white p-5 shadow-lg transition-transform duration-300 ${
              filtersOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Filters</h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-md px-3 py-1 text-2xl leading-none hover:scale-110 transition-transform duration-200 hover:cursor-pointer"
                aria-label="Close filters"
              >
                <img className="size-6" src={closeIcon} alt="Close filters" />
              </button>
            </div>

            <div className="flex min-w-0 flex-col text-left">
              <label
                className="mb-1 font-semibold"
                htmlFor="mobile-search-field"
              >
                Search by company or role:
              </label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full min-w-0 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
                id="mobile-search-field"
                type="text"
                placeholder="Search..."
              />
            </div>

            <div className="flex min-w-0 flex-col text-left">
              <label
                className="mb-1 font-semibold"
                htmlFor="mobile-status-filter"
              >
                Filter by status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
                id="mobile-status-filter"
                className="h-10 w-full min-w-0 border border-black rounded-md p-2 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
              >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex min-w-0 flex-col text-left">
              <label
                className="mb-1 font-semibold"
                htmlFor="mobile-sort-filter"
              >
                Sort by:
              </label>
              <select
                onChange={(e) =>
                  handleMobileSortChange(e.target.value as MobileSortOption)
                }
                id="mobile-sort-filter"
                className="h-10 w-full min-w-0 border border-black rounded-md p-2 hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
              >
                <option value="none">None</option>
                <option value="company-asc">Company A–Z</option>
                <option value="company-desc">Company Z–A</option>
                <option value="role-asc">Role A–Z</option>
                <option value="role-desc">Role Z–A</option>
                <option value="status-asc">Status A–Z</option>
                <option value="status-desc">Status Z–A</option>
                <option value="appliedAt-asc">Applied Date Oldest</option>
                <option value="appliedAt-desc">Applied Date Newest</option>
                <option value="location-asc">Location A–Z</option>
                <option value="location-desc">Location Z–A</option>
              </select>
            </div>
          </aside>
          {/* Filters */}
        </div>
      </div>
    </>
  );
}

export default ApplicationsControls;
