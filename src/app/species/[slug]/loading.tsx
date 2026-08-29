export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-[var(--paper-deep)] animate-pulse" />

      {/* Breadcrumb skeleton */}
      <div className="bg-[var(--paper)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-[var(--paper-deep)] rounded w-48 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <section className="bg-[var(--paper)] pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-7 bg-[var(--paper-deep)] rounded w-1/3" />
                <div className="h-4 bg-[var(--border)] rounded w-full" />
                <div className="h-4 bg-[var(--border)] rounded w-full" />
                <div className="h-4 bg-[var(--border)] rounded w-5/6" />
                <div className="h-4 bg-[var(--border)] rounded w-4/6" />
              </div>
              <div className="h-[350px] bg-[var(--paper-deep)] rounded-[var(--radius-card)]" />
              <div className="space-y-4">
                <div className="h-7 bg-[var(--paper-deep)] rounded w-1/4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-[var(--radius-card)] bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                      <div className="h-40 bg-[var(--paper-deep)]" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-[var(--paper-deep)] rounded w-3/4" />
                        <div className="h-3 bg-[var(--border)] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 animate-pulse">
              <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-[var(--border)] rounded w-1/3" />
                    <div className="h-4 bg-[var(--paper-deep)] rounded w-2/5" />
                  </div>
                ))}
              </div>
              <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] p-6">
                <div className="h-5 bg-[var(--paper-deep)] rounded w-1/2 mb-4" />
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-8 bg-[var(--border)] rounded" />
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
