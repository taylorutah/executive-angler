export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[45vh] bg-[var(--paper-deep)] animate-pulse" />

      {/* Grid skeleton */}
      <section className="py-16 sm:py-24 bg-[var(--paper)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface)] border border-[var(--border)] animate-pulse"
              >
                <div className="h-48 bg-[var(--paper-deep)]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[var(--paper-deep)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--border)] rounded w-1/2" />
                  <div className="h-3 bg-[var(--border)] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
