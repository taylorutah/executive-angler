export default function Loading() {
  return (
    <>
      <div className="h-[60svh] min-h-[360px] bg-[var(--surface-raised)] sm:h-[72vh]" />
      <div className="border-b border-[var(--border-rule)] bg-[var(--surface-page)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-4 w-48 bg-[var(--surface-raised)]" />
        </div>
      </div>
    </>
  );
}
