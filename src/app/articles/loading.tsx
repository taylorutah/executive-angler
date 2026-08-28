export default function Loading() {
  return (
    <>
      {/* Photo band skeleton */}
      <div className="ea-photo-hero min-h-[280px] w-full animate-pulse bg-[var(--paper-deep)]" />

      {/* Header skeleton */}
      <section className="bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-pulse">
          <div className="h-3 w-20 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-3 h-10 w-2/3 max-w-md rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-5 h-5 w-full max-w-[var(--prose)] rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>
      </section>

      {/* Grid skeleton — four wide like the story grid */}
      <section className="bg-[var(--paper)] pb-16 sm:pb-24">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="ea-photo-card bg-[var(--paper-deep)]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
                  <div className="h-5 w-3/4 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
                  <div className="h-4 w-1/2 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
