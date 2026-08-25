import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import PlanFlowLine from "@/components/plan/PlanFlowLine";
import { SITE_URL } from "@/lib/constants";
import { getAllCanonicalFlies, getAllRivers, getRiverBySlug } from "@/lib/db";
import { firstUsgsSiteId } from "@/lib/search/usgs";
import { deriveWindow, fliesForWindow, PACK_LIST, windowSentence } from "@/lib/plan/window";

interface Props {
  params: Promise<{ river: string }>;
}

export const revalidate = 3600;

const MAX_ACCESS_POINTS = 4;
const MAX_HATCH_ROWS = 4;

export async function generateStaticParams() {
  const rivers = await getAllRivers();
  return rivers.map((r) => ({ river: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { river: slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "Trip Brief Not Found" };

  const win = deriveWindow(river.bestMonths, river.hatchChart);
  const months = win.listedMonths.join(", ");

  return {
    title: { absolute: `${river.name} Trip Brief — Window, Flies, Access, Regs | Executive Angler` },
    description: `A one-screen trip brief for the ${river.name}: ${
      months ? `the months we list (${months})` : "the hatch calendar we hold"
    }, flies from the hatch chart, access points, and the regulations on file.`,
    alternates: { canonical: `${SITE_URL}/plan/${slug}` },
    openGraph: {
      title: `${river.name} trip brief`,
      description: `Window, flies to tie, access, regs, pack list for the ${river.name}.`,
      url: `${SITE_URL}/plan/${slug}`,
    },
  };
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--border-strong)] pt-3">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--action)]">
        {label}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-[var(--border-strong)] px-3 py-4 text-[13px] leading-relaxed text-[var(--text-meta)]">
      {children}
    </p>
  );
}

export default async function PlanPage({ params }: Props) {
  const { river: slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  const flies = await getAllCanonicalFlies();
  const flyByName = new Map(flies.map((f) => [f.name.toLowerCase(), f.slug]));

  const win = deriveWindow(river.bestMonths, river.hatchChart);
  const rows = fliesForWindow(win.hatches, MAX_HATCH_ROWS);
  const accessPoints = (river.accessPoints ?? []).slice(0, MAX_ACCESS_POINTS);
  const accessOverflow = (river.accessPoints ?? []).length - accessPoints.length;
  const siteId = firstUsgsSiteId(river.usgsGaugeId);

  return (
    <div className="bg-[var(--surface-page)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-meta)]">
          Trip brief ·{" "}
          <Link href={`/rivers/${river.slug}`} className="hover:text-[var(--action)]">
            {river.name}
          </Link>
        </p>

        <div className="mt-3 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-[62ch]">
            <h1 className="font-heading text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
              How to go fish the {river.name}
            </h1>
            <p className="prose mt-3 text-[17px] leading-snug text-[var(--text-body)]">
              {windowSentence(win, river.name)}
            </p>
          </div>
          <div className="mt-4 shrink-0 lg:mt-0 lg:text-right">
            {win.month ? (
              <p className="font-heading text-2xl text-[var(--text-primary)]">{win.month}</p>
            ) : null}
            {siteId ? (
              <PlanFlowLine siteId={siteId} />
            ) : (
              <p className="mt-3 text-[15px] text-[var(--text-meta)]">
                No USGS gauge is mapped to this river.
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          <Column label={win.month ? `Flies to tie — ${win.month}` : "Flies to tie"}>
            {rows.length > 0 ? (
              <ul>
                {rows.map((row, i) => (
                  <li
                    key={`${row.insect}-${i}`}
                    className="border-b border-[var(--border-rule)] pb-2 pt-2 first:pt-0"
                  >
                    <p className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] text-[var(--text-primary)]">{row.insect}</span>
                      {row.size ? (
                        <span className="num shrink-0 text-[13px] text-[var(--text-meta)]">
                          {row.size}
                        </span>
                      ) : null}
                    </p>
                    {row.patterns.length > 0 ? (
                      <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-body)]">
                        {row.patterns.slice(0, 2).map((pattern, j) => {
                          const flySlug = flyByName.get(pattern.toLowerCase());
                          return (
                            <span key={pattern}>
                              {j > 0 ? ", " : ""}
                              {flySlug ? (
                                <Link
                                  href={`/flies/${flySlug}`}
                                  className="underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--action)] hover:decoration-[var(--action)]"
                                >
                                  {pattern}
                                </Link>
                              ) : (
                                pattern
                              )}
                            </span>
                          );
                        })}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>
                We hold no hatch chart for{" "}
                {win.month ? `${win.month} on this river` : "this river"}, so there is no fly list
                to publish here.{" "}
                <Link href="/flies/library" className="text-[var(--action)]">
                  Browse the fly library
                </Link>
                .
              </Empty>
            )}
          </Column>

          <Column label="Access">
            {accessPoints.length > 0 ? (
              <ul>
                {accessPoints.map((ap, i) => (
                  <li
                    key={`${ap.name}-${i}`}
                    className="border-b border-[var(--border-rule)] pb-2 pt-2 first:pt-0"
                  >
                    <p className="text-[15px] text-[var(--text-primary)]">{ap.name}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[12px] text-[var(--text-meta)]">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="font-mono">
                        {ap.latitude.toFixed(3)}, {ap.longitude.toFixed(3)}
                      </span>
                      {ap.parking ? (
                        <span className="text-[var(--text-body)]">parking</span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No access points are listed for this river yet.</Empty>
            )}
            {accessOverflow > 0 ? (
              <p className="mt-2 text-[12px] text-[var(--text-meta)]">
                <Link href={`/rivers/${river.slug}`} className="hover:text-[var(--action)]">
                  {accessOverflow} more on the river page, with the map →
                </Link>
              </p>
            ) : null}
          </Column>

          <Column label="Regs — check current rules before you go">
            {river.regulations ? (
              <p className="line-clamp-[10] text-[13px] leading-relaxed text-[var(--text-body)]">
                {river.regulations}
              </p>
            ) : (
              <Empty>
                We hold no regulation summary for this river. Read the state agency&apos;s current
                rules before you fish it.
              </Empty>
            )}
          </Column>

          <Column label="Pack list">
            <ul className="text-[13px] leading-relaxed text-[var(--text-body)]">
              {PACK_LIST.map((item) => (
                <li key={item} className="border-b border-[var(--border-rule)] py-1.5 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-[var(--text-meta)]">
              Generic gear. Anything specific to this water is above.
            </p>
          </Column>
        </div>

        <p className="mt-7 border-t border-[var(--border-rule)] pt-4 text-[13px] text-[var(--text-body)]">
          <Link
            href={`/rivers/${river.slug}`}
            className="underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--action)] hover:decoration-[var(--action)]"
          >
            Full hatch chart, access map and live gauge on the {river.name} page →
          </Link>
        </p>
      </div>
    </div>
  );
}
