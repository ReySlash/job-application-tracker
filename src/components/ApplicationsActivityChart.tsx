import type { MonthlyActivityDatum } from '../utils/dashboardMetrics';

type Props = {
  data: MonthlyActivityDatum[];
  maxValue: number;
};

function ApplicationsActivityChart(props: Props) {
  const { data, maxValue } = props;

  return (
    <section className="rounded border border-gray-200 bg-white p-4 shadow">
      <h2 className="text-xl font-semibold text-slate-900">Application Activity</h2>
      <p className="mt-1 text-sm text-slate-500">Applications submitted over the last 6 months.</p>

      <div className="mt-6 flex h-56 items-end justify-between gap-3">
        {data.map((item) => {
          const height = maxValue === 0 ? 0 : Math.max((item.count / maxValue) * 100, 8);

          return (
            <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" key={item.label}>
              <span className="mb-2 text-sm font-medium text-slate-700">{item.count}</span>
              <div className="flex h-40 w-full max-w-12 items-end rounded bg-gray-100">
                <div
                  aria-label={`${item.count} applications in ${item.label}`}
                  className="w-full rounded bg-teal-600 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="mt-2 text-xs text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ApplicationsActivityChart;
