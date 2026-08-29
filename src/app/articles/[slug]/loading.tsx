export default function Loading() {
  return (
    <div className="overflow-x-clip bg-[var(--paper)]">
      <div className="aspect-[16/9] w-full animate-pulse bg-[var(--paper-deep)] sm:aspect-[21/9]" />

      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 animate-pulse">
        <div className="flex items-center justify-between py-6 border-b border-[var(--border)]">
          <div className="h-4 w-48 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-8 w-16 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>

        <div className="mx-auto max-w-[var(--prose)] pt-8 sm:pt-12">
          <div className="h-3 w-20 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-3 h-10 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-4 h-6 w-2/3 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-6 h-4 w-1/3 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>

        <div className="mx-auto mt-12 max-w-[var(--prose)] space-y-4 pb-24">
          <div className="h-4 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-5/6 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-4/6 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-4 w-3/6 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>
      </div>
    </div>
  );
}
