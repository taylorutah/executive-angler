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
  return <p className="text-[15px] leading-relaxed text-[var(--text-meta)]">{children}</p>;
}

export default function TodayBriefing({ data }: { data: TodayBriefingData }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Denver",
  });

  const firstRun = data.water.length === 0 && data.sessionCount === 0;

  return (
    <article className="min-h-[70vh] bg-[var(--surface-page)]">
      <div className="mx-auto max-w-[780px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
          {today}
        </p>
        <h1 className="mt-2 font-heading text-4xl text-[var(--text-primary)] sm:text-5xl">
          Today
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-body)]">
          A briefing, not a dashboard. Your water, your record, what to tie, what to read.
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

        <div className="mt-8">
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
              <EmptyLine>Sessions you close out stay off this line.</EmptyLine>
            ) : (
              <ul className="divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                {data.unfinished.map((item) => (
                  <li key={`${item.kind}-${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      className="ea-focus-ring flex items-center justify-between gap-4 py-3"
                    >
                      <span className="min-w-0 text-[15px] text-[var(--text-primary)]">
                        {item.label}
                        {item.date ? (
                          <span className="ml-2 text-[13px] text-[var(--text-meta)]">
                            {item.date}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {item.fishCount != null && item.fishCount > 0 ? (
                          <span className="num text-[13px] text-[var(--text-primary)]">
                            {item.fishCount}
                          </span>
                        ) : null}
                        <Icon
                          name="lock"
                          size={14}
                          className="text-[var(--text-meta)]"
                          aria-label="Private — only you see fish counts"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </BriefingLine>

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
                  className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)]"
                >
                  My Rivers
                </Link>
                . Flow shows here against the last time you fished it.
              </EmptyLine>
            ) : (
              <>
                <ul className="divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                  {data.water.map((river) => (
                    <li key={`${river.slug}-${river.section}`}>
                      <Link
                        href={river.href}
                        className="ea-focus-ring block py-3.5"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[15px] text-[var(--text-primary)]">
                            {river.name}
                            {river.section ? (
                              <span className="ml-2 text-[13px] text-[var(--text-meta)]">
                                {river.section}
                              </span>
                            ) : null}
                          </span>
                          {river.cfs != null ? (
                            <span className="num shrink-0 text-[var(--signal-live)]">
                              {river.cfs.toLocaleString("en-US")}
                              <span className="ml-1 text-[var(--text-meta)]">cfs</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                              no reading
                            </span>
                          )}
                        </div>
                        {river.lastCfs != null && river.cfs != null ? (
                          <p className="mt-1 text-[13px] text-[var(--text-body)]">
                            {flowDelta(river.cfs, river.lastCfs)} than your last day here
                            {river.lastFishedDate
                              ? ` (${daysAgo(river.lastFishedDate)} days ago at ${river.lastCfs.toLocaleString("en-US")} cfs)`
                              : ""}
                            .
                          </p>
                        ) : river.lastFishedDate ? (
                          <p className="mt-1 text-[13px] text-[var(--text-body)]">
                            You have not logged flow on your last day here (
                            {daysAgo(river.lastFishedDate)} days ago).
                          </p>
                        ) : (
                          <p className="mt-1 text-[13px] text-[var(--text-meta)]">
                            No logged day on this river yet.
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <Link
                    href="/rivers/mine"
                    className="text-[13px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)]"
                  >
                    Watchlist
                  </Link>
                </p>
              </>
            )}
          </BriefingLine>

          <BriefingLine
            title="Worth going?"
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
                <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
                  <Link
                    href={`/rivers/${data.worthGoing.slug}`}
                    className="text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)]"
                  >
                    {data.worthGoing.name}
                  </Link>
                  {data.worthGoing.cfs != null ? (
                    <>
                      {" "}
                      is{" "}
                      <span className="num text-[var(--signal-live)]">
                        {data.worthGoing.cfs.toLocaleString("en-US")} cfs
                      </span>{" "}
                      now.
                    </>
                  ) : (
                    " has no live reading right now."
                  )}
                </p>
                <ol className="mt-5 divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                  {data.worthGoing.days.map((day) => (
                    <li key={day.date} className="py-3.5">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-[15px] text-[var(--text-primary)]">
                          {day.weekday}
                          <span className="ml-2 text-[13px] text-[var(--text-meta)]">{day.date}</span>
                        </span>
                        {day.tempHighF != null ? (
                          <span className="num text-[13px] text-[var(--text-body)]">
                            {day.tempHighF}°F · {day.weatherLabel}
                          </span>
                        ) : (
                          <span className="text-[13px] text-[var(--text-meta)]">{day.weatherLabel}</span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-body)]">
                        {day.note}
                      </p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4">
                  <Link
                    href={`/plan/${data.worthGoing.slug}`}
                    className="text-[13px] text-[var(--text-primary)] underline decoration-[var(--border-rule)] underline-offset-4 hover:text-[var(--action)]"
                  >
                    Trip brief
                  </Link>
                </p>
              </div>
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
                Patterns you mark wanted or at the vise in your box show here when a hatch calls
                for them.
              </EmptyLine>
            ) : (
              <ul className="divide-y divide-[var(--border-rule)] border-y border-[var(--border-rule)]">
                {data.tieNext.map((fly) => (
                  <li key={fly.href}>
                    <Link
                      href={fly.href}
                      className="ea-focus-ring flex items-baseline justify-between gap-4 py-3"
                    >
                      <span className="text-[15px] text-[var(--text-primary)]">{fly.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                        {fly.status === "at_vise" ? "at the vise" : "wanted"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </BriefingLine>

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
              <ul className="space-y-5">
                {data.desk.map((note) => (
                  <li key={note.href}>
                    <Link
                      href={note.href}
                      className="ea-focus-ring block hover:text-[var(--action)]"
                    >
                      <p className="font-heading text-2xl text-[var(--text-primary)]">{note.title}</p>
                      {note.excerpt ? (
                        <p className="mt-1 text-[15px] leading-relaxed text-[var(--text-body)]">
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
