import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[var(--action)] font-mono mb-4">404</p>
        <h1 className="font-serif text-3xl text-[var(--text-primary)] mb-3">
          River Not Found
        </h1>
        <p className="text-[var(--text-body)] mb-8">
          Looks like you&apos;ve waded into uncharted water. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--action)] text-[var(--on-action)] font-semibold rounded-lg hover:bg-[var(--action-hover)] transition-colors"
          >
            Back to Shore
          </Link>
          <Link
            href="/rivers"
            className="px-6 py-3 bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold rounded-lg border border-[var(--border-rule)] hover:border-[var(--action)] transition-colors"
          >
            Explore Rivers
          </Link>
        </div>
      </div>
    </div>
  );
}
