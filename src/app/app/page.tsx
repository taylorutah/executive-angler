import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: brandedTitle("The App"),
  description: `${SITE_NAME} is a private fishing journal: one-tap logging with GPS and weather, Apple Watch, fly box and workbench, insights from your own sessions, and import/export. Every feature, free. Google Play — soon.`,
  alternates: { canonical: `${SITE_URL}/app` },
};

const PRIVACY_LINES = [
  {
    claim: "Default private.",
    body: "A new session is logged to your journal only. Nothing about it is shared.",
  },
  {
    claim: "Presence is river, section, and weather.",
    body: "If you choose to appear on the feed, that is all anyone else sees. Fish counts, GPS, catches, and notes stay private — always.",
  },
  {
    claim: "We never publish your spots.",
    body: "Precise coordinates and the water you actually fished stay on your account.",
  },
  {
    claim: "We never publish your counts.",
    body: "How many fish, how big, on what fly — that is yours. There is no leaderboard.",
  },
  {
    claim: "Imports stay quiet.",
    body: "A CSV you bring in never appears on the feed. You can opt a session in later, one at a time.",
  },
  {
    claim: "You can leave with your data.",
    body: "Export CSV or PDF from your account. Delete the account and the journal goes with it.",
  },
];

export default function AppPage() {
  return (
    <div className="bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Hero — one honest line */}
      <section className="flex min-h-[56vh] items-center py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
            <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
            The app
          </p>
          <h1 className="mt-5 font-heading text-3xl font-bold leading-[1.15] text-[var(--text-primary)] sm:text-5xl">
            Keep the record the water can&apos;t keep for you.
          </h1>
          <p className="mt-8 text-[15px] leading-relaxed text-[var(--text-body)]">
            Every feature, free.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" size="lg">
              Get the iOS app
            </Button>
            <Button href="/journal" variant="hero" size="md">
              Keep a journal on the web
            </Button>
          </div>
        </div>
      </section>

      {/* Logging */}
      <Section kicker="Logging" claim="One tap logs a catch.">
        <p>
          Open the session, tap a fly in the box you are fishing — or repeat the last one.
          On iOS the outing can carry GPS and weather with it, so the journal remembers
          where you were and what the day was doing.
        </p>
      </Section>

      {/* Apple Watch */}
      <Section kicker="Apple Watch" claim="Log from your wrist.">
        <p>
          watchOS is a companion to the iOS app. When the phone is in the boat bag, the
          watch is how you keep the record.
        </p>
      </Section>

      {/* Fly box + workbench */}
      <Section kicker="Fly box & workbench" claim="Fish the box. Tie at the bench.">
        <p>
          Boxes hold the patterns and sizes you actually carry. The workbench is where you
          build a recipe and see what you can tie from the materials you own. Same flies,
          both sides of the vise.
        </p>
        <p className="mt-4">
          <Link href="/flybox" className="text-[var(--action)] hover:underline">
            Your boxes
          </Link>
          <span className="text-[var(--text-meta)]"> · </span>
          <Link href="/flies/workbench" className="text-[var(--action)] hover:underline">
            Workbench
          </Link>
        </p>
      </Section>

      {/* Insights */}
      <Section kicker="Insights" claim="Patterns from your journal only.">
        <p>
          Fly effectiveness, time of day, weather, the rivers you actually fish. Nothing
          crowdsourced. Sharper after about twenty sessions — before that, treat weather
          and temperature correlations as early signal, not a rule.
        </p>
        <p className="mt-4">
          <Link href="/journal/insights" className="text-[var(--action)] hover:underline">
            Insights
          </Link>
        </p>
      </Section>

      {/* Privacy contract — in full */}
      <section className="border-t border-[var(--border-rule)] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
            <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
            The privacy contract
          </p>
          <h2 className="mt-5 font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] sm:text-4xl">
            We never publish locations or fish counts.
          </h2>
          <ol className="mt-10 space-y-8">
            {PRIVACY_LINES.map((line, i) => (
              <li key={line.claim}>
                <p className="font-mono text-[11px] tabular-nums text-[var(--text-meta)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-heading text-xl font-semibold text-[var(--text-primary)]">
                  {line.claim}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-body)]">
                  {line.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[15px] leading-relaxed text-[var(--text-body)]">
            The legal policy is on{" "}
            <Link href="/privacy" className="text-[var(--action)] hover:underline">
              /privacy
            </Link>
            . The short version of why is in{" "}
            <Link
              href="/articles/why-your-fishing-journal-should-be-private"
              className="text-[var(--action)] hover:underline"
            >
              why your fishing journal should be private
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Import / export */}
      <Section kicker="Import & export" claim="Bring a CSV in. Take CSV or PDF out.">
        <p>
          If the record already lives in a notebook, a spreadsheet, or another app, format
          it as a CSV and import it. When you want a copy, export sessions and catches as
          CSV or PDF. Your data is yours.
        </p>
        <p className="mt-4">
          <Link href="/journal/import" className="text-[var(--action)] hover:underline">
            Import
          </Link>
          <span className="text-[var(--text-meta)]"> · </span>
          <Link href="/dashboard/export" className="text-[var(--action)] hover:underline">
            Export
          </Link>
        </p>
      </Section>

      {/* Android */}
      <Section kicker="Android" claim="Google Play — soon.">
        <p>
          The iOS app is on the App Store. Android is not listed yet. Same journal, same
          account, when it is.
        </p>
      </Section>

      {/* Close */}
      <section className="border-t border-[var(--border-rule)] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-heading text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Start the journal.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" size="lg">
              App Store
            </Button>
            <Button href="/signup" variant="hero" size="md">
              Create an account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  kicker,
  claim,
  children,
}: {
  kicker: string;
  claim: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border-rule)] py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          <span aria-hidden className="h-px w-8 bg-[var(--action)]" />
          {kicker}
        </p>
        <h2 className="mt-5 font-heading text-2xl font-bold leading-snug text-[var(--text-primary)] sm:text-4xl">
          {claim}
        </h2>
        <div className="mt-6 text-[15px] leading-relaxed text-[var(--text-body)]">{children}</div>
      </div>
    </section>
  );
}
