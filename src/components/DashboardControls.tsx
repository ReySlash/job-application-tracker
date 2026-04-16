import type { FilterStatus } from "../types/StatusFilter";
import filterIcon from "../assets/filterIcon.svg";
import DesktopControls from "./DesktopControls";
import DashboardMobileControls from "./DashboardMobileControls";

type Props = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
};

function DashboardControls(props: Props) {
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
          alt="Open filters button"
        />
      </button>

      {/* Page actions and list controls */}
      <div className="flex flex-col items-center justify-center gap-3 px-4 text-center  md:gap-0 md:px-0">
        {/* Search and Status filter */}
        <DesktopControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
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

        <DashboardMobileControls
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
    </>
  );
}

export default DashboardControls;
