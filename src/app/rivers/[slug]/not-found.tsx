import Link from "next/link";

export default function RiverNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="mb-4 font-mono text-8xl font-bold text-[var(--action)]">404</p>
        <h1 className="mb-3 font-serif text-3xl text-[var(--text-primary)]">
          River Not Found
        </h1>
        <p className="mb-8 text-[var(--text-body)]">
          That slug is not in the catalog. It may have moved, or we have not
          published a page for it yet.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/rivers"
            className="rounded-lg bg-[var(--action)] px-6 py-3 font-semibold text-[var(--on-action)] transition-colors hover:bg-[var(--action-hover)]"
          >
            Browse rivers
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--action)]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
