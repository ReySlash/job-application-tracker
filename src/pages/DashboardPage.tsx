import { useContext, useMemo, useState } from "react";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { FilterStatus } from "../types/StatusFilter";
import ApplicationsStats from "../components/ApplicationsStats";
import DashboardControls from "../components/DashboardControls";

function DashboardPage() {
  const { applicationsList } = useContext(ApplicationsContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const searchedApplications = applicationsList.filter(
      (app) =>
        app.company.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query),
    );

    return filterStatus !== "all"
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [applicationsList, filterStatus, searchQuery]);

  const total = filteredApplications.length;
  const applied = filteredApplications.filter(
    (app) => app.status === "applied",
  ).length;
  const interview = filteredApplications.filter(
    (app) => app.status === "interview",
  ).length;
  const offer = filteredApplications.filter(
    (app) => app.status === "offer",
  ).length;
  const rejected = filteredApplications.filter(
    (app) => app.status === "rejected",
  ).length;

  return (
    <>
      <h1 className="flex justify-center text-4xl p-2 mb-2">Dashboard</h1>
      <DashboardControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />
      <ApplicationsStats
        total={total}
        applied={applied}
        interview={interview}
        offer={offer}
        rejected={rejected}
      />
    </>
  );
}

export default DashboardPage;
