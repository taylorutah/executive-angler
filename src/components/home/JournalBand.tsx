import Link from "next/link";
import HomeGutter from "./HomeGutter";

/** The only app band. Invitation, not a store CTA. */
export default function JournalBand() {
  return (
    <section data-lane="app" className="bg-[var(--surface-raised)] py-14">
      <HomeGutter>
        <h2
          className="max-w-[1280px] font-heading text-[32px] font-normal italic leading-10 text-[var(--text-primary)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          The desk that remembers the water.
        </h2>
        <p className="mt-3.5 max-w-[720px] font-ui text-[15px] leading-6 text-[var(--text-body)]">
          A private journal. Free, forever. No feed. No leaderboard. Your water stays yours.
        </p>
        <Link
          href="/journal"
          className="mt-3.5 inline-block font-ui text-[13px] font-medium text-[var(--action)] hover:text-[var(--action-hover)]"
        >
          Open the journal →
        </Link>
      </HomeGutter>
    </section>
  );
}
