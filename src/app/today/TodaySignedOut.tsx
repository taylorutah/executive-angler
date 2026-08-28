import Link from "next/link";

/**
 * Signed-out /today — honest empty, not a fake dashboard.
 */
export default function TodaySignedOut() {
  return (
    <article className="min-h-[70vh] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--prose)] px-4 py-12 sm:px-6 sm:py-16">
        <p className="ea-overline">Private briefing</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--text-1)] sm:text-3xl">
          Today
        </h1>
        <section
          data-empty-state="today"
          className="mt-8 max-w-xl border-t border-[var(--border)] pt-8"
        >
          <p data-empty-purpose className="leading-relaxed text-[var(--text-2)]">
            Today is your daily briefing: open sessions, the water you watch, a five-day read on
            whether it is worth going, what to tie next, and two field notes from the desk. None of
            it is public, and nothing here is invented for visitors.
          </p>
          <p className="mt-4">
            <Link
              data-empty-action
              href="/login?redirect=/today"
              className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--accent)] hover:underline"
            >
              Sign in to open your briefing
            </Link>
          </p>
          <p data-empty-example className="mt-4 text-[13px] leading-relaxed text-[var(--text-3)]">
            New here? Start at{" "}
            <Link
              href="/learn"
              className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              Learn
            </Link>{" "}
            — it ends with a fly list and a river list, not a signup wall.
          </p>
        </section>
      </div>
    </article>
  );
}
