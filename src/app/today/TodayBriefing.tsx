import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/icons";
import BriefingLine from "./BriefingLine";
import FirstRunEmpty from "./FirstRunEmpty";
import type { DailyOutlook } from "@/lib/today/worth-window";

export type UnfinishedItem = {
  kind: "notes" | "fly";
  href: string;
  label: string;
  date: string;
  fishCount: number | null;
};

export type WaterRow = {
  name: string;
  section: string;
  slug: string;
  href: string;
  cfs: number | null;
  lastCfs: number | null;
  lastFishedDate: string | null;
};

export type TodayBriefingData = {
  sessionCount: number;
  unfinished: UnfinishedItem[];
  water: WaterRow[];
  worthGoing: {
    name: string;
    slug: string;
    cfs: number | null;
    days: DailyOutlook[];
  } | null;
  tieNext: Array<{ name: string; href: string; status: string }>;
  desk: Array<{ title: string; href: string; excerpt: string }>;
};

function daysAgo(iso: string): number {
  const then = new Date(`${iso}T12:00:00`);
  const now = new Date();
  return Math.max(0, Math.round((now.getTime() - then.getTime()) / 86_400_000));
}

function flowDelta(now: number, then: number): string {
  const pct = Math.round(((now - then) / then) * 100);
  if (Math.abs(pct) < 5) return "about the same";
  return pct > 0 ? `${pct}% higher` : `${Math.abs(pct)}% lower`;
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-[var(--text-2)]">{children}</p>;
}

function waterCompare(river: WaterRow): string {
  if (river.lastCfs != null && river.cfs != null) {
    const when = river.lastFishedDate
      ? ` (${daysAgo(river.lastFishedDate)} days ago at ${river.lastCfs.toLocaleString("en-US")} cfs)`
      : "";
    return `${flowDelta(river.cfs, river.lastCfs)} than your last day here${when}.`;
  }
  if (river.lastFishedDate) {
    return `You have not logged flow on your last day here (${daysAgo(river.lastFishedDate)} days ago).`;
  }
  return "No logged day on this river yet.";
}

function watchedLine(count: number): string {
  if (count === 0) return "No rivers watched";
  if (count === 1) return "1 river watched";
  return `${count} rivers watched`;
}

export default function TodayBriefing({ data }: { data: TodayBriefingData }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Denver",
  });
  const weekday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Denver",
  });

  const firstRun = data.water.length === 0 && data.sessionCount === 0;

  return (
    <article className="min-h-[70vh] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="ea-overline">{today}</p>
        <h1 className="mt-2 font-display font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--text-1)] [font-size:var(--text-30)] md:[font-size:var(--text-36)]">
          Today
        </h1>
        <p className="mt-3 text-[var(--text-2)]">
          {weekday} · {watchedLine(data.water.length)}
        </p>

        {firstRun && (
          <FirstRunEmpty
            surface="today"
            purpose="Today is a briefing for the water you watch and the days you have logged."
            actionHref="/rivers"
            actionLabel="Watch a river"
            example="The Madison is on the river index. Pin a section and its flow lands here."
          />
        )}

        <div className="mt-8 flex flex-col md:mt-10 md:gap-10">
          <BriefingLine
            title="Your water"
            summary={
              data.water.length > 0
                ? `${data.water.length} watched ${data.water.length === 1 ? "section" : "sections"}`
                : "No rivers watched"
            }
            defaultOpen={data.water.length > 0}
          >
            {data.water.length === 0 ? (
              <EmptyLine>
                Pin a section from a river page or{" "}
                <Link
                  href="/rivers/mine"
                  className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)]"
                >
                  My Rivers
                </Link>
                . Flow shows here against the last time you fished it.
              </EmptyLine>
            ) : (
              <>
                <ul
                  aria-label="Watched rivers"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {data.water.map((river) => (
                    <li key={`${river.slug}-${river.section}`}>
                      <Link
                        href={river.href}
                        className="ea-card ea-focus-ring block transition-colors duration-150 ease-standard hover:bg-[var(--paper-deep)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-display font-semibold leading-[1.2] text-[var(--text-1)] [font-size:var(--text-20)]">
                              {river.name}
                            </p>
                            {river.section ? (
                              <div className="mt-2">
                                <span className="ea-chip">{river.section}</span>
                              </div>
                            ) : null}
                          </div>
                          {river.cfs != null ? (
                            <p className="num shrink-0 text-[var(--accent)] [font-size:var(--text-20)]">
                              {river.cfs.toLocaleString("en-US")}
                              <span className="ml-1 text-[13px] font-normal text-[var(--text-3)]">
                                cfs
                              </span>
                            </p>
                          ) : (
                            <span className="text-xs uppercase tracking-[0.06em] text-[var(--text-3)]">
                              no reading
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-2)]">
                          {waterCompare(river)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link
                    href="/rivers/mine"
                    className="text-[13px] text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)]"
                  >
                    Watchlist
                  </Link>
                </p>
              </>
            )}
          </BriefingLine>

          <BriefingLine
            title="Worth going"
            summary={
              data.worthGoing
                ? data.worthGoing.name
                : "Watch a river to get a five-day read"
            }
            defaultOpen={Boolean(data.worthGoing)}
          >
            {!data.worthGoing ? (
              <EmptyLine>
                This line reads your own history on the river you watch most. Pin one first.
              </EmptyLine>
            ) : (
              <div>
                <p className="leading-relaxed text-[var(--text-2)]">
                  <Link
                    href={`/rivers/${data.worthGoing.slug}`}
                    className="text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)]"
                  >
                    {data.worthGoing.name}
                  </Link>
                  {data.worthGoing.cfs != null ? (
                    <>
                      {" "}
                      is{" "}
                      <span className="num text-[var(--accent)]">
                        {data.worthGoing.cfs.toLocaleString("en-US")} cfs
                      </span>{" "}
                      now.
                    </>
                  ) : (
                    " has no live reading right now."
                  )}
                </p>
                <ol className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
                  {data.worthGoing.days.map((day) => (
                    <li
                      key={day.date}
                      className="w-[200px] shrink-0 snap-start rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:w-auto"
                    >
                      <p className="ea-overline">{day.weekday}</p>
                      {day.tempHighF != null ? (
                        <p className="num mt-2 text-[var(--text-1)] [font-size:var(--text-20)]">
                          {day.tempHighF}°
                        </p>
                      ) : (
                        <p className="mt-2 text-[13px] text-[var(--text-3)]">No temp</p>
                      )}
                      <div className="mt-2">
                        <span className="ea-chip">{day.weatherLabel}</span>
                      </div>
                      <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-2)]">
                        {day.note}
                      </p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4">
                  <Link
                    href={`/plan/${data.worthGoing.slug}`}
                    className="text-[13px] text-[var(--text-1)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)]"
                  >
                    Trip brief
                  </Link>
                </p>
              </div>
            )}
          </BriefingLine>

          <div className="grid md:grid-cols-2 md:gap-8 lg:gap-10">
            <BriefingLine
              title="Unfinished"
              summary={
                data.unfinished.length > 0
                  ? `${data.unfinished.length} open ${data.unfinished.length === 1 ? "item" : "items"}`
                  : "Nothing open"
              }
              defaultOpen={data.unfinished.length > 0}
            >
              {data.unfinished.length === 0 ? (
                <EmptyLine>Nothing open.</EmptyLine>
              ) : (
                <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {data.unfinished.map((item) => (
                    <li key={`${item.kind}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="ea-focus-ring flex items-center justify-between gap-4 py-3"
                      >
                        <span className="min-w-0 text-[var(--text-1)]">
                          {item.label}
                          {item.date ? (
                            <span className="ml-2 text-[13px] text-[var(--text-3)]">
                              {item.date}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {item.fishCount != null && item.fishCount > 0 ? (
                            <span className="num text-[13px] text-[var(--text-1)]">
                              {item.fishCount}
                            </span>
                          ) : null}
                          <Icon
                            name="lock"
                            size={14}
                            className="text-[var(--text-3)]"
                            aria-label="Private. Only you see fish counts."
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </BriefingLine>

            <BriefingLine
              title="Tie next"
              summary={
                data.tieNext.length > 0
                  ? `${data.tieNext.length} at the vise or wanted`
                  : "Box is stocked for now"
              }
              defaultOpen={data.tieNext.length > 0}
            >
              {data.tieNext.length === 0 ? (
                <EmptyLine>
                  Patterns you mark wanted or at the vise in your box show here when a hatch
                  calls for them.
                </EmptyLine>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.tieNext.map((fly) => (
                    <li key={fly.href}>
                      <Link
                        href={fly.href}
                        className="ea-focus-ring flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors duration-150 ease-standard hover:bg-[var(--paper-deep)]"
                      >
                        <span className="text-[var(--text-1)]">{fly.name}</span>
                        <span className="ea-chip shrink-0">
                          {fly.status === "at_vise" ? "at the vise" : "wanted"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </BriefingLine>
          </div>

          <BriefingLine
            title="From the desk"
            summary={
              data.desk.length > 0
                ? `${data.desk.length} field ${data.desk.length === 1 ? "note" : "notes"}`
                : "Nothing queued"
            }
            defaultOpen={data.desk.length > 0}
          >
            {data.desk.length === 0 ? (
              <EmptyLine>
                Two editorial pieces on your rivers land here when the catalog has them.
              </EmptyLine>
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.desk.map((note) => (
                  <li key={note.href}>
                    <Link
                      href={note.href}
                      className="ea-card ea-focus-ring group block transition-colors duration-150 ease-standard hover:bg-[var(--paper-deep)]"
                    >
                      <p className="font-display font-semibold leading-[1.2] text-[var(--text-1)] [font-size:var(--text-20)] group-hover:text-[var(--accent)]">
                        {note.title}
                      </p>
                      {note.excerpt ? (
                        <p className="mt-2 line-clamp-3 leading-relaxed text-[var(--text-2)]">
                          {note.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </BriefingLine>
        </div>
      </div>
    </article>
  );
}
