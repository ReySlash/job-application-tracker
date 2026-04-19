import type { DashboardMetricCard } from '../utils/dashboardMetrics';

type Props = {
  cards: DashboardMetricCard[];
};

const toneClasses: Record<NonNullable<DashboardMetricCard['tone']>, string> = {
  neutral: 'border-gray-100 dark:border-slate-700',
  positive: 'border-green-100 dark:border-green-900/60',
  warning: 'border-yellow-100 dark:border-yellow-900/60',
  danger: 'border-red-100 dark:border-red-900/60',
};

function ApplicationsStats(props: Props) {
  const { cards } = props;
  return (
    <div className="flex flex-row flex-wrap items-stretch justify-center gap-5 md:justify-start">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className={`flex min-h-32 w-36 flex-col items-center justify-center gap-2 rounded border bg-white p-3 text-center shadow dark:bg-slate-900 ${toneClasses[stat.tone ?? 'neutral']}`}
        >
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">{stat.label}</h2>
          <p className="text-3xl font-bold text-slate-950 dark:text-slate-50">{stat.value}</p>
          {stat.helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{stat.helperText}</p>}
        </div>
      ))}
    </div>
  );
}

export default ApplicationsStats;
