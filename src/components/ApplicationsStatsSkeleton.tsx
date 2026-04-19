function ApplicationsStatsSkeleton() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-8">
      <section>
        <div className="mb-3 h-6 w-28 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-row flex-wrap items-stretch justify-center gap-5 md:justify-start">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="flex min-h-32 w-36 flex-col items-center justify-center gap-3 rounded border border-gray-100 bg-white p-3 text-center shadow"
              key={index}
            >
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, chartIndex) => (
          <section className="rounded border border-gray-200 bg-white p-4 shadow" key={chartIndex}>
            <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 h-44 animate-pulse rounded bg-gray-100" />
          </section>
        ))}
        <section className="rounded border border-gray-200 bg-white p-4 shadow lg:col-span-2">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-52 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="grid gap-2" key={index}>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-row flex-wrap items-stretch justify-center gap-5 md:justify-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="flex min-h-32 w-36 flex-col items-center justify-center gap-3 rounded border border-gray-100 bg-white p-3 text-center shadow"
              key={index}
            >
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-10 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <section key={sectionIndex}>
            <div className="mb-3 h-6 w-44 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((__, itemIndex) => (
                <div
                  className="rounded border border-gray-200 bg-white p-4 shadow"
                  key={itemIndex}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-2">
                      <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="mt-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default ApplicationsStatsSkeleton;
