const columns = ['Company', 'Role', 'Status', 'Applied Date', 'Location', 'Actions'];

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

function ApplicationsListSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              {columns.map((column) => (
                <th className="bg-teal-600 px-1 py-2 text-center text-white" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr className="odd:bg-white even:bg-gray-200" key={rowIndex}>
                {columns.slice(0, -1).map((column, columnIndex) => (
                  <td className="px-3 py-3" key={column}>
                    <SkeletonBlock
                      className={`mx-auto h-5 ${
                        columnIndex === 0
                          ? 'w-28'
                          : columnIndex === 1
                            ? 'w-32'
                            : columnIndex === 2
                              ? 'w-20'
                              : 'w-24'
                      }`}
                    />
                  </td>
                ))}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <SkeletonBlock className="h-6 w-6 rounded-full" />
                    <SkeletonBlock className="h-6 w-6 rounded-full" />
                    <SkeletonBlock className="h-6 w-6 rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-10 my-3 flex flex-col items-center justify-center gap-4 md:m-10 md:hidden">
        {Array.from({ length: 3 }).map((_, cardIndex) => (
          <div
            className="w-full rounded-md border border-gray-300 bg-white p-4 shadow-md"
            key={cardIndex}
          >
            {Array.from({ length: 5 }).map((__, lineIndex) => (
              <div className="my-3 flex items-center justify-center gap-3" key={lineIndex}>
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-5 w-32" />
              </div>
            ))}
            <div className="mt-4 flex items-center justify-center gap-2">
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-6 w-6 rounded-full" />
              <SkeletonBlock className="h-6 w-6 rounded-full" />
              <SkeletonBlock className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ApplicationsListSkeleton;
