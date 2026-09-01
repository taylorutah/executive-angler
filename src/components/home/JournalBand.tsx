import Link from "next/link";

/** Invitation on paper. Willow CTA. Not an ink slab. */
export default function JournalBand() {
  return (
    <section data-lane="app" className="border-b border-[var(--border)] bg-[var(--paper)] py-10 sm:py-12">
      <div className="max-w-[var(--prose)]">
        <p className="ea-overline">The journal</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--ink)]">
          Keep a journal
        </h2>
        <p className="ea-dek mt-4">
          Sessions, flies, and the days you actually fished — yours, and no one
          else&apos;s.
        </p>
        <div className="mt-6">
          <Link href="/journal" className="ea-btn ea-btn-primary ea-btn-lg">
            Keep a journal
          </Link>
        </div>
      </div>
    </section>
  );
}
