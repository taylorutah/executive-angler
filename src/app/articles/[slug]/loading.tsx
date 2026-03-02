export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-slate-200 animate-pulse" />

      {/* Breadcrumb skeleton */}
      <div className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <section className="bg-cream pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-7 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-4/6" />
              </div>
              <div className="h-[350px] bg-slate-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-7 bg-slate-200 rounded w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-white shadow-md overflow-hidden">
                      <div className="h-40 bg-slate-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 animate-pulse">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-2/5" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-8 bg-slate-100 rounded" />
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
