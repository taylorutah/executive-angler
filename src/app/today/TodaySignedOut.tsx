import Link from "next/link";

/**
 * Signed-out /today — honest empty, not a fake dashboard.
 */
export default function TodaySignedOut() {
  return (
    <article className="min-h-[70vh] bg-[var(--surface-page)]">
      <div className="mx-auto max-w-[780px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
          Private briefing
        </p>
        <h1 className="mt-2 font-heading text-4xl text-[var(--text-primary)] sm:text-5xl">
          Today
        </h1>
        <section
          data-empty-state="today"
          className="mt-10 max-w-xl border-t border-[var(--border-rule)] pt-8"
        >
          <p data-empty-purpose className="text-[17px] leading-relaxed text-[var(--text-body)]">
            Today is your daily briefing: open sessions, the water you watch, a five-day read on
            whether it is worth going, what to tie next, and two field notes from the desk. None of
            it is public, and nothing here is invented for visitors.
          </p>
          <p className="mt-5">
            <Link
              data-empty-action
              href="/login?redirect=/today"
              className="text-[14px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
            >
              Sign in to open your briefing
            </Link>
          </p>
          <p data-empty-example className="mt-4 text-[15px] leading-relaxed text-[var(--text-meta)]">
            New here? Start at{" "}
            <Link
              href="/learn"
              className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
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
