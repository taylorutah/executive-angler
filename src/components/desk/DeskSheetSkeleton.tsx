/** Cream paper pulse — Pictures/List + Refine, then a still. No filter rows. */
export default function DeskSheetSkeleton({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="bg-[var(--paper)]">
      <span className="sr-only" role="status">
        {label}
      </span>
      <div className="desk-sheet" aria-hidden>
        <div className="h-3 w-16 bg-[var(--vellum)]" />
        <div className="mt-4 h-10 w-48 bg-[var(--vellum)]" />
        <div className="mt-4 h-4 w-80 max-w-full bg-[var(--rule)]" />
        <div className="mb-8 mt-10 flex h-10 items-center justify-between">
          <div className="h-10 w-36 border border-[var(--border-rule)] bg-[var(--paper)]" />
          <div className="h-10 w-[88px] border border-[var(--border-rule)] bg-[var(--paper)]" />
        </div>
        <div className="aspect-[794/420] w-full border border-[var(--border-rule)] bg-[var(--vellum)]" />
      </div>
    </div>
  );
}
