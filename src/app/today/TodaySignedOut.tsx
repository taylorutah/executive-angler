import Link from "next/link";

/**
 * Signed-out /today — honest empty, not a fake dashboard.
 */
export default function TodaySignedOut() {
  return (
    <article className="min-h-[70vh] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="ea-overline">Private</p>
        <h1 className="mt-2 font-display font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--text-1)] [font-size:var(--text-30)] md:[font-size:var(--text-36)]">
          Today
        </h1>

        <section
          data-empty-state="today"
          className="mt-8 max-w-xl border-t border-[var(--border)] pt-8"
        >
          <p data-empty-purpose className="leading-relaxed text-[var(--text-2)]">
            Today is your desk: the water you watch, a five-day read on whether it is worth
            going, open sessions, what to tie next, and two field notes. None of it is public,
            and nothing here is invented for visitors.
          </p>
          <p className="mt-6">
            <Link
              data-empty-action
              href="/login?redirect=/today"
              className="ea-btn ea-btn-primary"
            >
              Sign in
            </Link>
          </p>
          <p data-empty-example className="mt-6 text-[13px] leading-relaxed text-[var(--text-3)]">
            New here? Start at{" "}
            <Link
              href="/learn"
              className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              Learn
            </Link>
            . It ends with a fly list and a river list, not a signup wall.
          </p>
        </section>
      </div>
    </article>
  );
}
