export default function Loading() {
  return (
    <div className="bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6 animate-pulse">
        {/* Hero skeleton — 3:2 band on the prose column */}
        <div className="ea-photo-wide w-full bg-[var(--paper-deep)]" />

        {/* Breadcrumb skeleton */}
        <div className="flex items-center justify-between py-6 border-b border-[var(--border)]">
          <div className="h-4 w-48 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="h-6 w-6 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>

        {/* Header skeleton */}
        <div className="pt-8 sm:pt-12">
          <div className="h-3 w-20 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-3 h-10 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-4 h-6 w-2/3 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
          <div className="mt-6 h-4 w-1/3 rounded-[var(--radius-sm)] bg-[var(--paper-deep)]" />
        </div>

        {/* Body skeleton */}
        <div className="mt-12 space-y-4 pb-24">
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
