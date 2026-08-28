import Link from "next/link";

/**
 * The only app band on the page. An invitation. It costs nothing.
 * The closing CTA is the one sanctioned --ink band besides the footer
 * (DESIGN.md §2); the primary button flips to paper-on-ink there (§4).
 */
export default function JournalBand() {
  return (
    <section data-lane="app" className="ea-band-ink py-14 sm:py-24">
      <div className="mx-auto w-full max-w-[var(--container)] px-4 sm:px-6">
        <div className="max-w-[var(--prose)]">
          <p className="ea-band-heading">
            The journal
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--paper)] sm:text-5xl">
            Keep the record the water can&apos;t keep for you.
          </h2>
          <p className="mt-6 text-lg leading-relaxed">
            Sessions, flies, and the days you actually fished — yours, and no one
            else&apos;s. Nothing you log is published, ranked, or shown to another
            angler. It costs nothing.
          </p>
          <div className="mt-8">
            <Link href="/journal" className="ea-btn ea-btn-lg ea-btn-on-ink">
              Keep a journal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
