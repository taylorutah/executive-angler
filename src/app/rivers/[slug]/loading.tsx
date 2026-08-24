export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[60svh] min-h-[360px] bg-[var(--surface-card)] animate-pulse sm:h-[72vh]" />

      {/* Breadcrumb skeleton */}
      <div className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-[var(--surface-card)] rounded w-48 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton — deliberately minimal so it doesn't look like a duplicate page */}
      <section className="bg-[var(--surface-page)] pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[var(--action)] border-t-transparent animate-spin" />
              <p className="text-[var(--text-body)] text-sm">Loading river guide…</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
