import InstrumentWell, { InstrumentWellFrame } from "@/components/desk/InstrumentWell";

/** Reserve the live-conditions band so `RiverLiveInset` hydration does not shift the footer. */
export default function RiverLiveInsetFallback({ riverName }: { riverName: string }) {
  return (
  <>
    <span className="sr-only" role="status">
      Loading live conditions
    </span>
    <InstrumentWellFrame aria-hidden>
      <InstrumentWell label={`Live conditions — ${riverName}`} className="p-6 sm:p-8">
        <div className="min-h-[11rem]">
          <div className="mb-5 h-8 w-48 bg-[var(--border-rule)]/50" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 border border-[var(--border-rule)] bg-[var(--surface-raised)]"
              />
            ))}
          </div>
        </div>
        <div className="mt-6 h-[280px] border border-[var(--border-rule)] bg-[var(--surface-raised)]" />
      </InstrumentWell>
    </InstrumentWellFrame>
  </>
  );
}
