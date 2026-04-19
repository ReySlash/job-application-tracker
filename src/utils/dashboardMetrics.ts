import type { Application, ApplicationStatus } from '../types/ApplicationType';

export type DashboardMetricCard = {
  label: string;
  value: string | number;
  helperText?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
};

export type FollowUpApplication = Application & {
  daysSinceApplied: number;
};

export type StatusChartDatum = {
  status: ApplicationStatus;
  label: string;
  count: number;
  percent: number;
  colorClass: string;
  strokeColor: string;
};

export type MonthlyActivityDatum = {
  label: string;
  count: number;
};

const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

const statusColors: Record<ApplicationStatus, { colorClass: string; strokeColor: string }> = {
  applied: { colorClass: 'bg-gray-500', strokeColor: '#6b7280' },
  interview: { colorClass: 'bg-yellow-500', strokeColor: '#eab308' },
  offer: { colorClass: 'bg-green-500', strokeColor: '#22c55e' },
  rejected: { colorClass: 'bg-red-500', strokeColor: '#ef4444' },
};

function parseDate(dateString: string) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStartOfWeek(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatPercent(value: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getPercent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthlyActivityData(applications: Application[], today: Date) {
  const months = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    return {
      key: getMonthKey(monthDate),
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
    };
  });

  const monthCounts = new Map(months.map((month) => [month.key, month.count]));

  for (const application of applications) {
    const appliedAt = parseDate(application.appliedAt);
    if (!appliedAt) continue;

    const key = getMonthKey(appliedAt);
    if (monthCounts.has(key)) {
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
  }

  return months.map((month) => ({
    label: month.label,
    count: monthCounts.get(month.key) ?? 0,
  }));
}

function getDaysSince(dateString: string, today: Date) {
  const date = parseDate(dateString);
  if (!date) return 0;

  const difference = startOfDay(today).getTime() - startOfDay(date).getTime();
  return Math.max(0, Math.floor(difference / 86_400_000));
}

export function getDashboardMetrics(applications: Application[], today = new Date()) {
  const startOfCurrentWeek = getStartOfWeek(today);
  const startOfCurrentMonth = getStartOfMonth(today);

  const statusCounts: Record<ApplicationStatus, number> = {
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };

  for (const application of applications) {
    statusCounts[application.status] += 1;
  }

  const total = applications.length;
  const active = statusCounts.applied + statusCounts.interview + statusCounts.offer;
  const interviewPipeline = statusCounts.interview + statusCounts.offer;

  const applicationsThisWeek = applications.filter((application) => {
    const appliedAt = parseDate(application.appliedAt);
    return appliedAt ? appliedAt >= startOfCurrentWeek : false;
  }).length;

  const applicationsThisMonth = applications.filter((application) => {
    const appliedAt = parseDate(application.appliedAt);
    return appliedAt ? appliedAt >= startOfCurrentMonth : false;
  }).length;

  const recentApplications = [...applications]
    .sort((a, b) => {
      const aTime = parseDate(a.appliedAt)?.getTime() ?? 0;
      const bTime = parseDate(b.appliedAt)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const followUpApplications: FollowUpApplication[] = applications
    .filter((application) => application.status === 'applied')
    .map((application) => ({
      ...application,
      daysSinceApplied: getDaysSince(application.appliedAt, today),
    }))
    .filter((application) => application.daysSinceApplied > 14)
    .sort((a, b) => b.daysSinceApplied - a.daysSinceApplied);

  const overviewCards: DashboardMetricCard[] = [
    {
      label: 'Total Applications',
      value: total,
      helperText: 'Matching your current filters',
      tone: 'neutral',
    },
    {
      label: 'Active Applications',
      value: active,
      helperText: 'Applied, interview, or offer',
      tone: 'positive',
    },
    {
      label: 'Interview Rate',
      value: formatPercent(interviewPipeline, total),
      helperText: 'Interview or offer',
      tone: 'positive',
    },
    {
      label: 'Offer Rate',
      value: formatPercent(statusCounts.offer, total),
      helperText: `${statusCounts.offer} offer${statusCounts.offer === 1 ? '' : 's'}`,
      tone: 'positive',
    },
    {
      label: 'This Week',
      value: applicationsThisWeek,
      helperText: `${applicationsThisMonth} this month`,
      tone: 'warning',
    },
  ];

  const statusCards: DashboardMetricCard[] = Object.entries(statusCounts).map(([status, count]) => ({
    label: statusLabels[status as ApplicationStatus],
    value: count,
    helperText: formatPercent(count, total),
    tone:
      status === 'offer'
        ? 'positive'
        : status === 'rejected'
          ? 'danger'
          : status === 'interview'
            ? 'warning'
            : 'neutral',
  }));

  const statusChartData: StatusChartDatum[] = Object.entries(statusCounts).map(([status, count]) => {
    const applicationStatus = status as ApplicationStatus;
    const colors = statusColors[applicationStatus];

    return {
      status: applicationStatus,
      label: statusLabels[applicationStatus],
      count,
      percent: getPercent(count, total),
      colorClass: colors.colorClass,
      strokeColor: colors.strokeColor,
    };
  });

  const monthlyActivityData = getMonthlyActivityData(applications, today);
  const maxMonthlyActivity = Math.max(...monthlyActivityData.map((item) => item.count), 0);

  return {
    overviewCards,
    statusCards,
    statusChartData,
    monthlyActivityData,
    maxMonthlyActivity,
    recentApplications,
    followUpApplications,
    statusCounts,
    applicationsThisWeek,
    applicationsThisMonth,
  };
}
