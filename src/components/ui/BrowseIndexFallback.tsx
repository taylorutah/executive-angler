/**
 * Suspense fallback for browse indexes that use `useSearchParams()` in the
 * client list. Without this, the grid is empty in the first paint and the
 * footer sits at the viewport bottom — then ~8kpx of cards hydrate in and
 * register CLS ~0.4 on Slow 4G.
 */
export default function BrowseIndexFallback({
  count = 24,
  id,
}: {
  count?: number;
  id?: string;
}) {
  return (
    <div id={id}>
      <span className="sr-only" role="status">
        Loading results
      </span>
      <div aria-hidden className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[var(--surface-page)] border-b border-[var(--border-rule)]/60 mb-8">
        <div className="mb-3 h-10 border border-[var(--border-rule)] bg-[var(--surface-raised)]" />
        <div className="h-9 w-24 border border-[var(--border-rule)] bg-[var(--surface-raised)]" />
        <div className="mt-3 space-y-3 border-t border-[var(--border-rule)]/60 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 border border-[var(--border-rule)] bg-[var(--surface-raised)]" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-surface border border-[var(--border-rule)] bg-[var(--surface-raised)]"
          >
            <div className="h-44 bg-[var(--border-rule)]/40" />
            <div className="space-y-2 p-5">
              <div className="h-5 w-3/4 bg-[var(--border-rule)]/60" />
              <div className="h-4 w-full bg-[var(--border-rule)]/40" />
              <div className="h-3 w-1/2 bg-[var(--border-rule)]/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
