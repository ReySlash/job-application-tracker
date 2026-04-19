import { useMemo } from 'react';
import { Link } from 'react-router';

import ApplicationsActivityChart from '../components/ApplicationsActivityChart';
import ApplicationsStats from '../components/ApplicationsStats';
import ApplicationsStatsSkeleton from '../components/ApplicationsStatsSkeleton';
import DashboardControls from '../components/DashboardControls';
import PipelineProgressChart from '../components/PipelineProgressChart';
import StatusBadge from '../components/StatusBadge';
import StatusDistributionChart from '../components/StatusDistributionChart';
import { useApplicationsQuery } from '../hooks/useApplicationsQuery';
import useApplicationsList from '../hooks/useApplicationsController';
import { getDashboardMetrics } from '../utils/dashboardMetrics';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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

  const metrics = useMemo(() => getDashboardMetrics(filteredApplications), [filteredApplications]);

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
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-8">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Overview</h2>
          <ApplicationsStats cards={metrics.overviewCards} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <StatusDistributionChart data={metrics.statusChartData} />
          <ApplicationsActivityChart
            data={metrics.monthlyActivityData}
            maxValue={metrics.maxMonthlyActivity}
          />
          <PipelineProgressChart data={metrics.statusChartData} />
        </div>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Status Breakdown</h2>
          <ApplicationsStats cards={metrics.statusCards} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Recent Applications</h2>
            {metrics.recentApplications.length === 0 ? (
              <p className="rounded border border-gray-200 bg-white p-4 text-center text-slate-500 shadow">
                No recent applications match your filters.
              </p>
            ) : (
              <div className="grid gap-3">
                {metrics.recentApplications.map((application) => (
                  <Link
                    className="rounded border border-gray-200 bg-white p-4 shadow transition-colors hover:border-teal-400"
                    key={application.id}
                    to={`/applications/${application.id}`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{application.role}</h3>
                        <p className="text-sm text-slate-600">{application.company}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Applied {formatDate(application.appliedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Needs Follow-Up</h2>
            {metrics.followUpApplications.length === 0 ? (
              <p className="rounded border border-green-100 bg-white p-4 text-center text-slate-600 shadow">
                No follow-ups needed right now.
              </p>
            ) : (
              <div className="grid gap-3">
                {metrics.followUpApplications.map((application) => (
                  <Link
                    className="rounded border border-yellow-100 bg-white p-4 shadow transition-colors hover:border-yellow-400"
                    key={application.id}
                    to={`/applications/${application.id}`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{application.role}</h3>
                        <p className="text-sm text-slate-600">{application.company}</p>
                      </div>
                      <p className="text-sm font-medium text-yellow-700">
                        {application.daysSinceApplied} days
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      Applied {formatDate(application.appliedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
