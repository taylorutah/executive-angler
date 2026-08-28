export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <span className="sr-only" role="status">
        Loading shop
      </span>
      <article className="desk-sheet" aria-hidden>
        <div className="h-3 w-40 bg-[var(--vellum)]" />
        <div className="desk-sheet-grid mt-6">
          <div className="desk-sheet-photo aspect-[5/4] border border-[var(--border-rule)] bg-[var(--vellum)]" />
          <div className="desk-sheet-name space-y-4">
            <div className="h-3 w-16 bg-[var(--vellum)]" />
            <div className="h-10 w-64 max-w-full bg-[var(--vellum)]" />
            <div className="h-4 w-48 bg-[var(--rule)]" />
            <div className="h-4 w-40 bg-[var(--rule)]" />
          </div>
        </div>
      </article>
    </div>
  );
}
