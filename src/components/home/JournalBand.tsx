import { Button } from "@/components/ui/Button";
import { APP_STORE_URL } from "@/lib/constants";

/** The only place on the page that asks anything of you. */
export default function JournalBand() {
  return (
    <section
      data-lane="app"
      className="register-dusk flex min-h-[56vh] items-center bg-[var(--surface-page)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
          The journal
        </p>
        <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.15] text-[var(--text-primary)] sm:text-5xl">
          Keep the record the water can&apos;t keep for you.
        </h2>
        <p className="mt-8 text-[15px] leading-relaxed text-[var(--text-meta)]">
          Your sessions, your catches, and your spots stay yours. Nothing you log
          is published, ranked, or shown to another angler.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" size="lg">
            Get the app
          </Button>
          <Button href="/journal" variant="hero" size="md">
            Keep a journal
          </Button>
        </div>
      </div>
    </section>
  );
}
