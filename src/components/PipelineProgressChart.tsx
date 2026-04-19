import type { StatusChartDatum } from '../utils/dashboardMetrics';

type Props = {
  data: StatusChartDatum[];
};

function PipelineProgressChart(props: Props) {
  const { data } = props;
  const maxCount = Math.max(...data.map((item) => item.count), 0);

  return (
    <section className="rounded border border-gray-200 bg-white p-4 shadow lg:col-span-2">
      <h2 className="text-xl font-semibold text-slate-900">Pipeline Progress</h2>
      <p className="mt-1 text-sm text-slate-500">A quick scan of volume by application status.</p>

      <div className="mt-5 grid gap-4">
        {data.map((item) => {
          const width = maxCount === 0 ? 0 : Math.max((item.count / maxCount) * 100, 5);

          return (
            <div className="grid gap-2" key={item.status}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${item.colorClass}`} />
                  <span className="truncate text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm text-slate-500">
                  {item.count} · {item.percent}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded bg-gray-100">
                <div
                  aria-label={`${item.label}: ${item.count} applications`}
                  className={`h-full rounded ${item.colorClass}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PipelineProgressChart;
