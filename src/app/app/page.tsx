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
    <div className="bg-[var(--paper)] text-[var(--text-1)]">
      {/* Hero — one honest line, left-aligned (DESIGN.md §3: no giant centered hero) */}
      <section className="py-14 sm:py-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <p className="ea-overline">The app</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
            Keep the record the water can&apos;t keep for you.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--text-2)]">
            Every feature, free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" size="lg">
              Get the iOS app
            </Button>
            <Button href="/journal" variant="hero" size="lg">
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
          <Link href="/flybox" className="text-[var(--accent)] hover:underline">
            Your boxes
          </Link>
          <span className="text-[var(--text-3)]"> · </span>
          <Link href="/flies/workbench" className="text-[var(--accent)] hover:underline">
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
          <Link href="/journal/insights" className="text-[var(--accent)] hover:underline">
            Insights
          </Link>
        </p>
      </Section>

      {/* Privacy contract — in full */}
      <section className="border-t border-[var(--border)] py-14 sm:py-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <p className="ea-overline">The privacy contract</p>
          <h2 className="mt-4 font-display text-2xl font-semibold text-[var(--text-1)] sm:text-4xl">
            We never publish locations or fish counts.
          </h2>
          <ol className="mt-8 space-y-8">
            {PRIVACY_LINES.map((line, i) => (
              <li key={line.claim}>
                <p className="num text-xs text-[var(--text-3)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-[var(--text-1)]">
                  {line.claim}
                </h3>
                <p className="mt-2 leading-relaxed text-[var(--text-2)]">
                  {line.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 leading-relaxed text-[var(--text-2)]">
            The legal policy is on{" "}
            <Link href="/privacy" className="text-[var(--accent)] hover:underline">
              /privacy
            </Link>
            . The short version of why is in{" "}
            <Link
              href="/articles/why-your-fishing-journal-should-be-private"
              className="text-[var(--accent)] hover:underline"
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
          <Link href="/journal/import" className="text-[var(--accent)] hover:underline">
            Import
          </Link>
          <span className="text-[var(--text-3)]"> · </span>
          <Link href="/dashboard/export" className="text-[var(--accent)] hover:underline">
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

      {/* Close — the closing CTA is a flat --ink band (DESIGN.md §2) */}
      <section className="ea-band-ink py-14 sm:py-24">
        <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-[var(--paper)] sm:text-4xl">
            Start the journal.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="ea-btn-on-ink"
            >
              App Store
            </Button>
            <Button
              href="/signup"
              variant="ghost"
              size="lg"
              className="text-[color-mix(in_srgb,var(--paper)_80%,transparent)] hover:text-[var(--paper)]"
            >
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
    <section className="border-t border-[var(--border)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
        <p className="ea-overline">{kicker}</p>
        <h2 className="mt-4 font-display text-2xl font-semibold text-[var(--text-1)] sm:text-4xl">
          {claim}
        </h2>
        <div className="mt-6 leading-relaxed text-[var(--text-2)]">{children}</div>
      </div>
    </section>
  );
}
