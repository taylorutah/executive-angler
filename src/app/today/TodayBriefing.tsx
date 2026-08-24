import type { ReactNode } from "react";
import Link from "next/link";

export type TodayBriefingData = {
  unfinished: Array<{ kind: "notes" | "fly"; href: string; label: string; date: string }>;
  water: Array<{ name: string; section: string; slug: string; cfs: number | null; href: string }>;
  worthGoing: { name: string; slug: string; cfs: number | null; lastFished: string | null } | null;
  tieNext: Array<{ name: string; href: string; status: string }>;
  desk: Array<{ title: string; href: string; excerpt: string }>;
};

function daysAgo(iso: string): number {
  const then = new Date(`${iso}T12:00:00`);
  const now = new Date();
  return Math.max(0, Math.round((now.getTime() - then.getTime()) / 86_400_000));
}

function Line({
  kicker,
  children,
}: {
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border-rule)] py-7">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--action)]">
        {kicker}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function TodayBriefing({ data }: { data: TodayBriefingData }) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "America/Denver",
  });

  return (
    <article className="min-h-[70vh] bg-[var(--surface-page)]">
      <div className="mx-auto max-w-[780px] px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-meta)]">
          {today}
        </p>
        <h1 className="mt-2 font-heading text-4xl text-[var(--text-primary)] sm:text-5xl">
          Today
        </h1>

        {data.unfinished.length > 0 && (
          <Line kicker="Unfinished">
            <ul className="space-y-2">
              {data.unfinished.map((item) => (
                <li key={`${item.kind}-${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="text-[17px] text-[var(--text-primary)] hover:text-[var(--action)]"
                  >
                    {item.label}
                    <span className="ml-2 text-[var(--action)]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Line>
        )}

        {data.water.length > 0 && (
          <Line kicker="Your water">
            <ul className="space-y-3">
              {data.water.map((river) => (
                <li key={`${river.slug}-${river.section}`}>
                  <Link href={river.href} className="flex items-baseline justify-between gap-4">
                    <span className="text-[17px] text-[var(--text-primary)]">
                      {river.name}
                      {river.section ? (
                        <span className="ml-2 text-[13px] text-[var(--text-meta)]">
                          {river.section}
                        </span>
                      ) : null}
                    </span>
                    {river.cfs != null ? (
                      <span className="num text-[var(--signal-live)]">
                        {river.cfs.toLocaleString("en-US")}
                        <span className="ml-1 text-[var(--text-meta)]">cfs</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                        no reading
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/rivers/mine"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)] hover:text-[var(--action)]"
              >
                Watchlist →
              </Link>
            </p>
          </Line>
        )}

        {data.worthGoing && (
          <Line kicker="Worth going?">
            <p className="text-[20px] leading-snug text-[var(--text-primary)]">
              <Link href={`/rivers/${data.worthGoing.slug}`} className="hover:text-[var(--action)]">
                {data.worthGoing.name}
              </Link>
              {data.worthGoing.cfs != null ? (
                <>
                  {" "}
                  is{" "}
                  <span className="num text-[var(--signal-live)]">
                    {data.worthGoing.cfs.toLocaleString("en-US")} cfs
                  </span>
                </>
              ) : (
                " has no live reading"
              )}
              {data.worthGoing.lastFished
                ? `. Last fished ${daysAgo(data.worthGoing.lastFished)} days ago.`
                : ". You have not logged a day here yet."}
            </p>
          </Line>
        )}

        {data.tieNext.length > 0 && (
          <Line kicker="Tie next">
            <ul className="space-y-2">
              {data.tieNext.map((fly) => (
                <li key={fly.href}>
                  <Link
                    href={fly.href}
                    className="text-[17px] text-[var(--text-primary)] hover:text-[var(--action)]"
                  >
                    {fly.name}
                    <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
                      {fly.status === "at_vise" ? "at the vise" : "wanted"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Line>
        )}

        {data.desk.length > 0 && (
          <Line kicker="From the desk">
            <ul className="space-y-5">
              {data.desk.map((note) => (
                <li key={note.href}>
                  <Link href={note.href} className="block hover:text-[var(--action)]">
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
          </Line>
        )}
      </div>
    </article>
  );
}
