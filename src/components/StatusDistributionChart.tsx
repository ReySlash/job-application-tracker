import type { StatusChartDatum } from '../utils/dashboardMetrics';

type Props = {
  data: StatusChartDatum[];
};

function StatusDistributionChart(props: Props) {
  const { data } = props;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <section className="rounded border border-gray-200 bg-white p-4 shadow">
      <h2 className="text-xl font-semibold text-slate-900">Status Distribution</h2>
      <p className="mt-1 text-sm text-slate-500">Where your applications currently stand.</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto h-44 w-44">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img">
            <title>Application status distribution</title>
            <circle
              cx="60"
              cy="60"
              fill="none"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="14"
            />
            {total > 0 &&
              data.map((item) => {
                const dashLength = (item.percent / 100) * circumference;
                const dashOffset = -(accumulatedPercent / 100) * circumference;
                accumulatedPercent += item.percent;

                return (
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    key={item.status}
                    r={radius}
                    stroke={item.strokeColor}
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeWidth="14"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-slate-950">{total}</span>
            <span className="text-xs text-slate-500">applications</span>
          </div>
        </div>

        <div className="grid gap-3">
          {data.map((item) => (
            <div className="flex items-center justify-between gap-3" key={item.status}>
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${item.colorClass}`} />
                <span className="truncate text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm text-slate-500">
                {item.count} · {item.percent}%
              </span>
            </div>
          ))}
          {total === 0 && (
            <p className="rounded bg-gray-50 p-3 text-sm text-slate-500">
              No applications match your current filters yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default StatusDistributionChart;
