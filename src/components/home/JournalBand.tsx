import { Button } from "@/components/ui/Button";

/** The only app band on the page. An invitation. It costs nothing. */
export default function JournalBand() {
  return (
    <section data-lane="app" className="bg-[var(--surface-page)] py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          The journal
        </p>
        <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.15] text-[var(--text-primary)] sm:text-5xl">
          Keep the record the water can&apos;t keep for you.
        </h2>
        <p
          className="mt-8 max-w-[42rem] text-[18px] leading-relaxed text-[var(--text-body)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Sessions, flies, and the days you actually fished — yours, and no one
          else&apos;s. Nothing you log is published, ranked, or shown to another
          angler. It costs nothing.
        </p>
        <div className="mt-10">
          <Button href="/journal" size="lg">
            Keep a journal
          </Button>
        </div>
      </div>
    </section>
  );
}
