import type { FilterStatus } from "../types/StatusFilter";
import type { MobileSortOption } from "../types/SortConfig";

import filterIcon from "../assets/filterIcon.svg";
import MobileDrawer from "./MobileDrawer";

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
        <div className="flex flex-col items-center justify-center gap-3 px-4 text-center  md:gap-0 md:px-0">
          {/* Search and Status filter */}
          <div className="hidden w-full flex-col items-center justify-center mt-5 md:mt-0  md:flex md:flex-row md:justify-end ">
            <div className="grid w-full max-w-80 grid-cols-1 gap-3 md:max-w-none md:grid-cols-[minmax(16rem,auto)_auto_auto]  md:justify-end md:gap-2  md:items-center">
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
              <div className="flex min-w-0 flex-col md:flex-row md:items-center">
                <label className="whitespace-nowrap" htmlFor="status-filter">
                  Filter by status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  id="status-filter"
                  className="h-10 w-full min-w-0 border border-black rounded-md p-2 md:p-0  md:w-23 md:mx-1 justify-end hover:cursor-pointer focus:ring-2 focus:ring-teal-500 focus:outline-none transition-ring duration-200"
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

          <MobileDrawer
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            handleMobileSortChange={handleMobileSortChange}
          />
        </div>
      </div>
    </>
  );
}

export default ApplicationsControls;
