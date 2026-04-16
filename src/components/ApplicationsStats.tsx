type Props = {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

function ApplicationsStats(props: Props) {
  const { total, applied, interview, offer, rejected } = props;

  const stats = [
    { label: "Total Applications", value: total },
    { label: "Applied", value: applied },
    { label: "Interview", value: interview },
    { label: "Offer", value: offer },
    { label: "Rejected", value: rejected },
  ];
  return (
    <main className="flex flex-row justify-center items-start h-full">
      <div className="flex flex-row items-center justify-center flex-wrap gap-5 md:gap-auto">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center text-center wrap-break-words p-2 gap-2 bg-white rounded border border-gray-100 shadow w-30 h-30"
          >
            <h2 className="text-xl font-semibold">{stat.label}</h2>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default ApplicationsStats;
