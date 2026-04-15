type Props = {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

function ApplicationsStats(props: Props) {
  const { total, applied, interview, offer, rejected } = props;
  return (
    <main className="flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center justify-center gap-5 mt-10 md:gap-10">
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold">Total Applications</h2>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold">Applied</h2>
          <p className="text-3xl font-bold">{applied}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold">Interview</h2>
          <p className="text-3xl font-bold">{interview}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold">Offer</h2>
          <p className="text-3xl font-bold">{offer}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold">Rejected</h2>
          <p className="text-3xl font-bold">{rejected}</p>
        </div>
      </div>
    </main>
  );
}

export default ApplicationsStats;
