import { useMemo } from 'react';

import ApplicationsStats from '../components/ApplicationsStats';
import ApplicationsStatsSkeleton from '../components/ApplicationsStatsSkeleton';
import DashboardControls from '../components/DashboardControls';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import useApplicationsList from '../hooks/useApplicationsController';

function DashboardPage() {
  const { data: applicationsList = [], isLoading, error } = useApplicationsQuery();

  const {
    searchQuery,
    setSearchQuery,
    filtersOpen,
    setFiltersOpen,
    filterStatus,
    setFilterStatus,
  } = useApplicationsList(applicationsList);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const searchedApplications = applicationsList.filter(
      (app) => app.company.toLowerCase().includes(query) || app.role.toLowerCase().includes(query),
    );

    return filterStatus !== 'all'
      ? searchedApplications.filter((app) => app.status === filterStatus)
      : searchedApplications;
  }, [applicationsList, filterStatus, searchQuery]);

  const total = filteredApplications.length;
  const applied = filteredApplications.filter((app) => app.status === 'applied').length;
  const interview = filteredApplications.filter((app) => app.status === 'interview').length;
  const offer = filteredApplications.filter((app) => app.status === 'offer').length;
  const rejected = filteredApplications.filter((app) => app.status === 'rejected').length;

  if (isLoading) {
    return (
      <>
        <h1 className="mb-2 flex justify-center p-2 text-4xl">Dashboard</h1>
        <ApplicationsStatsSkeleton />
      </>
    );
  }

  if (error instanceof Error) {
    return <p>{error.message}</p>;
  }

  return (
    <>
      <h1 className="mb-2 flex justify-center p-2 text-4xl">Dashboard</h1>
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
