import type { Metadata } from "next";
import Link from "next/link";
import { APP_STORE_URL, SITE_NAME } from "@/lib/constants";
import { brandedTitle, pageUrl } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: brandedTitle("The journal"),
  description:
    "A private fishing journal. One tap starts a session. GPS, weather, and the river come with it. Every feature, free. We never publish locations or fish counts.",
  alternates: { canonical: pageUrl("/app") },
  openGraph: {
    title: `The journal | ${SITE_NAME}`,
    description:
      "A private record of the days you fish. Every feature, free. We never publish locations or fish counts.",
    url: pageUrl("/app"),
  },
};

export const revalidate = 3600;

const AppleGlyph = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

function FieldPlate({
  eyebrow,
  title,
  claim,
  rows,
}: {
  eyebrow: string;
  title: string;
  claim: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <figure className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-card)] p-5 sm:p-6">
      <figcaption className="mb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
          {eyebrow}
        </p>
        <p className="mt-2 font-heading text-xl text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-body)]">{claim}</p>
      </figcaption>
      <dl className="divide-y divide-[var(--border-rule)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-meta)]">
              {row.label}
            </dt>
            <dd className="text-sm text-[var(--text-primary)]">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-mono text-[11px] text-[var(--text-meta)]">
        Field plate — not a screenshot. We do not invent device captures.
      </p>
    </figure>
  );
}

const CTA_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-live)] " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]";

export default function AppProductPage() {
  return (
    <main className="bg-[var(--surface-page)] text-[var(--text-body)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "iOS, watchOS, Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          url: pageUrl("/app"),
          downloadUrl: APP_STORE_URL,
          description:
            "A private fly-fishing journal. Sessions, flies, and insights stay yours. Every feature, free.",
        }}
      />

      {/* Hero */}
      <section className="border-b border-[var(--border-rule)]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-24">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
            The journal
          </p>
          <h1 className="mt-4 font-heading text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.1] text-[var(--text-primary)]">
            A private record of the days you fish.
          </h1>
          <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-[var(--text-body)]">
            The rivers are public. The notebook is not. One tap starts a session.
            GPS, weather, and the water come with it.
          </p>
          <p className="mt-5 text-[17px] text-[var(--text-primary)]">
            Every feature, free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CTA_CLASS} bg-[var(--action)] text-[var(--on-action)] hover:bg-[var(--action-hover)]`}
            >
              <AppleGlyph />
              iPhone and Watch
            </a>
            <Link
              href="/signup"
              className={`${CTA_CLASS} border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--text-primary)]`}
            >
              Open the web journal
            </Link>
          </div>
          <p className="mt-5 font-mono text-[12px] text-[var(--text-meta)]">
            iPhone and Apple Watch are live. Web works in a browser. Android is
            written, not on Play yet.
          </p>
        </div>
      </section>

      {/* Logging */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="logging-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              On the water
            </p>
            <h2
              id="logging-heading"
              className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
            >
              One tap. The rest is recorded.
            </h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Start a session from the phone or the Watch. The river is detected
              from where you stand. Weather comes in with the day. You add the
              fish — species, length, the fly, a photo if you want one — and the
              notes only you will read.
            </p>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Location is collected only while a session is active, and only if
              you allow it. Precise coordinates never appear on a public page.
            </p>
          </div>
          <FieldPlate
            eyebrow="Session"
            title="What a day holds"
            claim="One claim: start once, and the day has a place to land."
            rows={[
              { label: "Start", value: "One tap on phone or Watch" },
              { label: "River", value: "Detected from GPS, or you name it" },
              { label: "Weather", value: "Pulled in with the session" },
              { label: "Water", value: "Temp, clarity, flow when you have them" },
              { label: "Catches", value: "Species, length, fly, optional photo" },
              { label: "Notes", value: "Yours. Not a trip report." },
            ]}
          />
        </div>
      </section>

      {/* Watch */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="watch-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
          <FieldPlate
            eyebrow="watchOS"
            title="The companion on your wrist"
            claim="One claim: start and stop the day without the phone in your hands."
            rows={[
              { label: "Status", value: "Live, as a companion to the iPhone app" },
              { label: "Start", value: "Open a session from the Watch" },
              { label: "Stop", value: "Close it when you walk off the water" },
              { label: "Still coming", value: "Catch pins dropped from the wrist" },
            ]}
          />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Apple Watch
            </p>
            <h2
              id="watch-heading"
              className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
            >
              Wet hands. Small screen. Enough.
            </h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              The Watch is the logging tool when the phone is zipped away. It
              starts and stops a session. It does not try to be the whole
              journal on a 45mm face.
            </p>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Map pins from the wrist are still coming. We will not draw them
              here as if they shipped.
            </p>
          </div>
        </div>
      </section>

      {/* Fly box + workbench */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="flies-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Flies
            </p>
            <h2
              id="flies-heading"
              className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
            >
              A box, and a bench.
            </h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              The public fly library is the reference — patterns, recipes,
              materials. Your box is what you actually carry. The workbench is
              where a recipe becomes something you can tie with what you own.
            </p>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Log a fish to a fly and the loop closes: tie, fish, write it down,
              tie the next one with more to go on.
            </p>
            <p className="mt-6">
              <Link
                href="/flies"
                className="text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
              >
                Browse the fly library
              </Link>
            </p>
          </div>
          <FieldPlate
            eyebrow="Workbench"
            title="What the bench keeps"
            claim="One claim: the recipe is structured, so the inventory can answer it."
            rows={[
              { label: "Library", value: "Canonical patterns with recipes" },
              { label: "Your box", value: "What you carry, and how many" },
              { label: "Materials", value: "Hooks, beads, thread, dubbing, feathers" },
              { label: "Tie next", value: "What you are short on for water you fish" },
            ]}
          />
        </div>
      </section>

      {/* Insights */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="insights-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
          <FieldPlate
            eyebrow="Your record"
            title="What the journal can tell you"
            claim="One claim: these numbers come from your days, not from anyone else."
            rows={[
              { label: "Window", value: "Flow and temp from your better sessions" },
              { label: "Fly", value: "What you caught on, on that river" },
              { label: "Hour", value: "When your own days actually produced" },
              { label: "Source", value: "Your journal. Never another angler." },
            ]}
          />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Insights
            </p>
            <h2
              id="insights-heading"
              className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
            >
              See your patterns. Not theirs.
            </h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              A best window on a river is the flow and temperature band from{" "}
              <em className="text-[var(--text-primary)]">your</em> sessions. A
              top fly is the one in your log. Free does not mean crowdsourced.
              Nobody else&apos;s counts deepen your chart.
            </p>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Signed out, those panels say what they would tell you, and that
              they cost nothing. They do not ask you to pay.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy contract */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="privacy-heading">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
            The contract
          </p>
          <h2
            id="privacy-heading"
            className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
          >
            What we do not do.
          </h2>
          <ul className="mt-10 space-y-8">
            <li>
              <p className="font-heading text-2xl leading-snug text-[var(--text-primary)]">
                We never publish your spots.
              </p>
              <p className="mt-2 leading-relaxed text-[var(--text-body)]">
                GPS, access points you walked, the bend you stood in — those stay
                in the notebook. A public river page can name the river. It
                cannot name your place on it.
              </p>
            </li>
            <li>
              <p className="font-heading text-2xl leading-snug text-[var(--text-primary)]">
                We never publish your counts.
              </p>
              <p className="mt-2 leading-relaxed text-[var(--text-body)]">
                Fish numbers, photos of fish, lengths, the fly that worked — not
                for other people, not in a feed, not as a total next to your
                name.
              </p>
            </li>
            <li>
              <p className="font-heading text-2xl leading-snug text-[var(--text-primary)]">
                There is no leaderboard here.
              </p>
              <p className="mt-2 leading-relaxed text-[var(--text-body)]">
                No public totals. No comparison against other anglers. Kudos
                and follows exist; they are never summed into a score.
              </p>
            </li>
          </ul>
          <div className="prose mt-12 max-w-none text-[var(--text-body)]">
            <p>
              Presence on the water — if you turn it on — shows the river, the
              section when you choose, and the weather. That is the only public
              social surface. It is opt-in. It is not a map of where you stood.
            </p>
            <p>
              Insights read your journal and no one else&apos;s. Export takes the
              record with you. Deleting the account deletes the notebook.
            </p>
            <p>
              The legal policy is at{" "}
              <Link
                href="/privacy"
                className="text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--action)]"
              >
                /privacy
              </Link>
              . This page is the ethic in plain language.
            </p>
          </div>
        </div>
      </section>

      {/* Import / export */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="portability-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Your data
            </p>
            <h2
              id="portability-heading"
              className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
            >
              Bring a journal. Take it with you.
            </h2>
            <p className="mt-4 max-w-[40rem] leading-relaxed text-[var(--text-body)]">
              Import a CSV of sessions and catches. Export CSV or PDF when you
              want a copy that does not live on our servers alone. Those routes
              ask you to sign in because they are your rows, not a public file.
            </p>
          </div>
          <FieldPlate
            eyebrow="Portability"
            title="In and out"
            claim="One claim: the record is yours to move."
            rows={[
              { label: "Import", value: "CSV of sessions and catches" },
              { label: "Export", value: "CSV or PDF of your journal" },
              { label: "Delete", value: "Account deletion removes the notebook" },
              { label: "Gate", value: "Sign in. Not a purchase." },
            ]}
          />
        </div>
      </section>

      {/* Android + platforms */}
      <section className="border-b border-[var(--border-rule)]" aria-labelledby="platforms-heading">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
            Where it runs
          </p>
          <h2
            id="platforms-heading"
            className="mt-3 font-heading text-3xl font-semibold text-[var(--text-primary)]"
          >
            iPhone now. Android not yet.
          </h2>
          <dl className="mt-10 divide-y divide-[var(--border-rule)]">
            <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--text-meta)]">
                iPhone
              </dt>
              <dd className="text-[var(--text-primary)]">
                On the App Store. The primary place to log.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--text-meta)]">
                Watch
              </dt>
              <dd className="text-[var(--text-primary)]">
                Companion to iPhone. Live.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--text-meta)]">
                Web
              </dt>
              <dd className="text-[var(--text-primary)]">
                The desk, and the notebook after you sign in. Works in a
                browser on a phone today.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-[var(--text-meta)]">
                Android
              </dt>
              <dd className="text-[var(--text-primary)]">
                The app is written. It is not on Google Play yet. We will not
                put a store badge on a listing that does not exist.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Close */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
            Keep the record.
          </h2>
          <p className="mt-4 max-w-[40rem] text-lg leading-relaxed text-[var(--text-body)]">
            The resource is the promise. The journal is the reward. Every
            feature, free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CTA_CLASS} bg-[var(--action)] text-[var(--on-action)] hover:bg-[var(--action-hover)]`}
            >
              <AppleGlyph />
              iPhone and Watch
            </a>
            <Link
              href="/signup"
              className={`${CTA_CLASS} border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--text-primary)]`}
            >
              Open the web journal
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--text-meta)]">
            Already have an account?{" "}
            <Link
              href="/login?redirect=/journal"
              className="text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--action)]"
            >
              Sign in
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
