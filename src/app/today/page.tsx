import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { brandedTitle } from "@/lib/seo";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import { loadBriefing } from "@/lib/today/briefing";
import Dismissible from "./Dismissible";
import FiveDayChart from "./FiveDayChart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: brandedTitle("Today"),
  robots: { index: false, follow: false },
};

function Line({
  kicker,
  children,
}: {
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border-rule)] py-6 first:pt-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
        {kicker}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function flowDelta(n: number): string {
  if (n === 0) return "same as last time you fished it";
  const abs = Math.abs(n).toLocaleString("en-US");
  return n > 0 ? `${abs} cfs above last time you fished it` : `${abs} cfs below last time you fished it`;
}

export default async function TodayPage() {
  const briefing = await loadBriefing();
  if (!briefing) redirect("/login?redirect=/today");

  const weekday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <div className="mx-auto w-full max-w-[780px] px-6 py-10 sm:py-14">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
          Today
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-[1.15] text-[var(--text-primary)]">
          {briefing.displayName ? `${briefing.displayName}.` : "The briefing."}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-meta)]">{weekday}</p>

        {briefing.emptyWatchlist && briefing.unfinished.length === 0 && (
          <p className="mt-8 text-[17px] leading-relaxed text-[var(--text-body)]">
            Watch a river from its page. Flow, the window, and what to tie show
            up here. Until then, two notes from the desk.
          </p>
        )}

        {briefing.unfinished.length > 0 && (
          <Line kicker="Unfinished">
            <ul className="space-y-3">
              {briefing.unfinished.map((item) => (
                <li key={item.id}>
                  <Dismissible id={item.id}>
                    <Link
                      href={item.href}
                      className={`text-[15px] text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--action)] ${FOCUS_VISIBLE}`}
                    >
                      {item.label}
                    </Link>
                  </Dismissible>
                </li>
              ))}
            </ul>
          </Line>
        )}

        {briefing.water.length > 0 && (
          <Line kicker="Your water">
            <ul className="space-y-4">
              {briefing.water.map((r) => (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <Link
                    href={`/rivers/${r.slug}`}
                    className={`font-heading text-xl text-[var(--text-primary)] hover:text-[var(--action)] ${FOCUS_VISIBLE}`}
                  >
                    {r.name}
                  </Link>
                  <p className="text-sm text-[var(--text-body)]">
                    {r.flowNow != null ? (
                      <>
                        <span className="num text-[var(--text-primary)]">
                          {r.flowNow.toLocaleString("en-US")}
                        </span>
                        {" cfs now"}
                        {r.flowVsLast != null && (
                          <>
                            {" · "}
                            {flowDelta(r.flowVsLast)}
                          </>
                        )}
                        {r.inBestBand === true && " · inside your better days"}
                        {r.inBestBand === false &&
                          r.bestFlowMin != null &&
                          r.bestFlowMax != null && (
                            <>
                              {" · better days were "}
                              <span className="num">
                                {r.bestFlowMin.toLocaleString("en-US")}–{r.bestFlowMax.toLocaleString("en-US")}
                              </span>
                            </>
                          )}
                      </>
                    ) : (
                      "No live gauge on this river"
                    )}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/rivers/mine"
                className={`font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-meta)] hover:text-[var(--text-primary)] ${FOCUS_VISIBLE}`}
              >
                Watchlist
              </Link>
            </p>
          </Line>
        )}

        {briefing.worthGoing && (
          <Line kicker="Worth going?">
            <p className="text-[17px] leading-relaxed text-[var(--text-primary)]">
              {briefing.worthGoing.sentence}
            </p>
            <FiveDayChart
              days={briefing.worthGoing.days}
              pickDate={briefing.worthGoing.pickDate}
            />
            <p className="mt-2">
              <Link
                href={`/rivers/${briefing.worthGoing.riverSlug}`}
                className={`font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-meta)] hover:text-[var(--text-primary)] ${FOCUS_VISIBLE}`}
              >
                {briefing.worthGoing.riverName}
              </Link>
            </p>
          </Line>
        )}

        {briefing.tieNext.length > 0 && (
          <Line kicker="Tie next">
            <ul className="space-y-3">
              {briefing.tieNext.map((fly) => (
                <li key={fly.href}>
                  <Link
                    href={fly.href}
                    className={`font-heading text-lg text-[var(--text-primary)] hover:text-[var(--action)] ${FOCUS_VISIBLE}`}
                  >
                    {fly.name}
                  </Link>
                  <p className="text-sm text-[var(--text-meta)]">{fly.reason}</p>
                </li>
              ))}
            </ul>
          </Line>
        )}

        {briefing.desk.length > 0 && (
          <Line kicker="From the desk">
            <ul className="space-y-5">
              {briefing.desk.map((note) => (
                <li key={note.slug}>
                  <Link
                    href={`/articles/${note.slug}`}
                    className={`font-heading text-xl text-[var(--text-primary)] hover:text-[var(--action)] ${FOCUS_VISIBLE}`}
                  >
                    {note.title}
                  </Link>
                  {note.excerpt && (
                    <p className="mt-1 text-[15px] leading-relaxed text-[var(--text-body)]">
                      {note.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Line>
        )}
      </div>
    </main>
  );
}
