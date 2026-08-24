export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[45vh] bg-[var(--surface-card)] animate-pulse" />

      {/* Grid skeleton */}
      <section className="py-16 sm:py-20 bg-[var(--surface-page)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-[var(--surface-raised)] shadow-md animate-pulse"
              >
                <div className="h-48 bg-[var(--surface-card)]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[var(--surface-card)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--border-rule)] rounded w-1/2" />
                  <div className="h-3 bg-[var(--border-rule)] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
