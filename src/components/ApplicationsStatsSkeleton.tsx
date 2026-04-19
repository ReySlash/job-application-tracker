function ApplicationsStatsSkeleton() {
  return (
    <main className="flex h-full flex-row items-start justify-center">
      <div className="flex flex-row flex-wrap items-center justify-center gap-5 md:gap-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="flex h-30 w-30 flex-col items-center justify-center gap-3 rounded border border-gray-100 bg-white p-2 text-center shadow"
            key={index}
          >
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </main>
  );
}

export default ApplicationsStatsSkeleton;
