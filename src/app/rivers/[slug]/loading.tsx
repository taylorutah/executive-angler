export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-[#1F2937] animate-pulse" />

      {/* Breadcrumb skeleton */}
      <div className="bg-[#0D1117]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-[#1F2937] rounded w-48 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <section className="bg-[#0D1117] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-7 bg-[#1F2937] rounded w-1/3" />
                <div className="h-4 bg-[#21262D] rounded w-full" />
                <div className="h-4 bg-[#21262D] rounded w-full" />
                <div className="h-4 bg-[#21262D] rounded w-5/6" />
                <div className="h-4 bg-[#21262D] rounded w-4/6" />
              </div>
              <div className="h-[350px] bg-[#1F2937] rounded-xl" />
              <div className="space-y-4">
                <div className="h-7 bg-[#1F2937] rounded w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-[#161B22] shadow-md overflow-hidden">
                      <div className="h-40 bg-[#1F2937]" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-[#1F2937] rounded w-3/4" />
                        <div className="h-3 bg-[#21262D] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 animate-pulse">
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-[#21262D] rounded w-1/3" />
                    <div className="h-4 bg-[#1F2937] rounded w-2/5" />
                  </div>
                ))}
              </div>
              <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
                <div className="h-5 bg-[#1F2937] rounded w-1/2 mb-4" />
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-8 bg-[#21262D] rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
