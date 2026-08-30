import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllRivers,
  getRiverBySlug,
  getDestinationById,
  getRiversByDestination,
  getGuidesByRiver,
  getFlyShopsByDestination,
  getAllCanonicalFlies,
  getFeaturedFlies,
  getFliesByCategory,
} from "@/lib/db";
import { brandedTitle, breadcrumbJsonLd, collectionPageJsonLd, faqPageJsonLd } from "@/lib/seo";
import {
  fliesFromHatchChart,
  groupFlies,
  uniqueLede,
  setupCopy,
  riverFaqs,
  currentMonthLabel,
} from "@/lib/hatch-flies";
import type { CanonicalFly, HatchMonth } from "@/types/entities";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import DeskPhotoCard from "@/components/desk/DeskPhotoCard";
import { canonicalFlyToCard } from "@/lib/flies/desk-cards";

export const revalidate = 3600;

const CATEGORY_LABEL: Record<string, string> = {
  dry: "Dry",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rivers = await getAllRivers();
  return rivers.map((r) => ({ slug: r.slug }));
}

function placeLabel(state?: string, region?: string, country?: string): string {
  return [state, region, country].filter(Boolean)[0] ?? "";
}

function HatchTable({ chart, currentMonth }: { chart: HatchMonth[]; currentMonth: string }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
      <table className="ea-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Insect</th>
            <th>Size</th>
            <th>Pattern</th>
          </tr>
        </thead>
        <tbody>
          {chart.flatMap((month) =>
            (month.hatches ?? []).map((h, i) => (
              <tr
                key={`${month.month}-${h.pattern}-${i}`}
                className={
                  month.month.toLowerCase() === currentMonth.toLowerCase()
                    ? "bg-[var(--accent-soft)]"
                    : ""
                }
              >
                <td className="whitespace-nowrap text-[var(--text-1)]">{i === 0 ? month.month : ""}</td>
                <td className="text-[var(--text-2)]">{h.insect}</td>
                <td className="text-[var(--text-2)]">{h.size}</td>
                <td className="text-[var(--text-1)]">{h.pattern}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function FlyGrid({ flies }: { flies: CanonicalFly[] }) {
  if (flies.length === 0) {
    return <p className="text-[var(--text-2)]">No catalog patterns in this group yet. Use the hatch chart and the river guide.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {flies.map((fly) => {
        const card = canonicalFlyToCard(fly);
        return (
          <li key={fly.id}>
            <DeskPhotoCard
              href={card.href}
              imageUrl={card.imageUrl}
              imageAlt={card.imageAlt}
              title={card.title}
              meta={card.meta}
              density="plate"
            />
          </li>
        );
      })}
    </ul>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "River Not Found" };

  const dest = river.destinationId ? await getDestinationById(river.destinationId) : undefined;
  const place = placeLabel(dest?.state, dest?.region, dest?.country);
  const catalog = await getAllCanonicalFlies();
  const featured = await getFeaturedFlies();
  const [nymphs, dries, streamers] = await Promise.all([
    getFliesByCategory("nymph"),
    getFliesByCategory("dry"),
    getFliesByCategory("streamer"),
  ]);
  const matched = fliesFromHatchChart(river.hatchChart, catalog, featured, {
    nymphs,
    dries,
    streamers,
  });
  const a = matched[0]?.name ?? "a nymph";
  const b = matched[1]?.name ?? "a dry";

  return {
    title: brandedTitle(`Best Flies for ${river.name} (2026)`),
    description: `Best flies for the ${river.name}${place ? ` in ${place}` : ""}. Fish ${a} and ${b}, plus nymphs, dries, and streamers matched to the hatch chart. Not a crowdsourced catch report.`,
    alternates: { canonical: `/flies/for/${slug}` },
    openGraph: {
      title: `Best Flies for ${river.name} (2026)`,
      description: `Hatch-chart patterns for the ${river.name}: ${a}, ${b}, and the nymphs, dries, and streamers that belong on this water.`,
    },
  };
}

export default async function FliesForRiverPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  const dest = river.destinationId ? await getDestinationById(river.destinationId) : undefined;
  const place = placeLabel(dest?.state, dest?.region, dest?.country);

  const [catalog, featured, nymphCat, dryCat, streamerCat, guides, shops, nearby] = await Promise.all([
    getAllCanonicalFlies(),
    getFeaturedFlies(),
    getFliesByCategory("nymph"),
    getFliesByCategory("dry"),
    getFliesByCategory("streamer"),
    getGuidesByRiver(river.id),
    dest ? getFlyShopsByDestination(dest.id) : Promise.resolve([]),
    dest ? getRiversByDestination(dest.id) : Promise.resolve([]),
  ]);

  const matched = fliesFromHatchChart(river.hatchChart, catalog, featured, {
    nymphs: nymphCat,
    dries: dryCat,
    streamers: streamerCat,
  });
  const grouped = groupFlies(matched);
  const chart = river.hatchChart ?? [];
  const month = currentMonthLabel();
  const a = matched[0]?.name ?? "Pheasant Tail";
  const b = matched[1]?.name ?? "Elk Hair Caddis";
  const faqs = riverFaqs(river, place, a, b);
  const nearbyWaters = nearby.filter((r) => r.id !== river.id).slice(0, 4);
  const relatedFlies = matched.slice(0, 3);
  const h1Place = place ? ` (${place})` : "";

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: `Best Flies for ${river.name}`,
          description: uniqueLede(river, place),
          path: `/flies/for/${slug}`,
          itemPaths: matched.map((f) => ({ name: f.name, path: `/flies/${f.slug}` })),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Fly Library", path: "/flies/library" },
          { name: `Best Flies for ${river.name}`, path: `/flies/for/${slug}` },
        ])}
      />
      <JsonLd data={faqPageJsonLd(faqs)} />

      <div className="bg-[var(--paper)] pt-6 pb-4">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies/library" },
              { label: `Best Flies for ${river.name}` },
            ]}
          />
        </div>
      </div>

      <section className="bg-[var(--paper)] pb-10 sm:pb-12">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8">
          <p className="ea-overline">
            Hatch-chart pattern list
          </p>
          <h1 className="mt-3 text-[var(--text-1)]">
            Best Flies for {river.name}
            {h1Place}
          </h1>
          <p className="mt-5 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">{uniqueLede(river, place)}</p>
          <p className="mt-4 max-w-[var(--prose)] text-sm text-[var(--text-3)]">
            This is not a live report of other anglers&apos; catches. Presence and flow live on the{" "}
            <Link href={`/rivers/${river.slug}`} className="text-[var(--accent)] hover:underline">
              {river.name} river page
            </Link>
            {dest ? (
              <>
                {" "}
                and the{" "}
                <Link href={`/destinations/${dest.slug}`} className="text-[var(--accent)] hover:underline">
                  {dest.name} destination guide
                </Link>
              </>
            ) : null}
            .
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--paper)] py-12 sm:py-16">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">What&apos;s hatching now</h2>
            <p className="mb-6 max-w-[var(--prose)] text-[var(--text-2)]">
              Month, insect, size, and pattern from the {river.name} hatch chart
              {chart.length ? `. ${month} is highlighted when that month exists in the chart.` : "."}{" "}
              We do not invent a hatch that is not on the chart.
            </p>
            {chart.length > 0 ? (
              <HatchTable chart={chart} currentMonth={month} />
            ) : (
              <p className="max-w-[var(--prose)] text-[var(--text-2)]">
                No month-by-month hatch chart is stored for this river yet. Use the nymph, dry, and streamer lists below, then read the{" "}
                <Link href={`/rivers/${river.slug}`} className="text-[var(--accent)] hover:underline">
                  river guide
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">Nymphs</h2>
            <p className="mb-6 max-w-[var(--prose)] text-[var(--text-2)]">
              Subsurface patterns matched to this river&apos;s chart and catalog. Fish them at the size the chart lists, not the size that looks good in the bin.
            </p>
            <FlyGrid flies={grouped.nymphs} />
          </div>

          <div>
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">Dries</h2>
            <p className="mb-6 max-w-[var(--prose)] text-[var(--text-2)]">
              Dries and terrestrials for the {river.name}. If the chart says a size 18 PMD, do not start with a 12.
            </p>
            <FlyGrid flies={grouped.dries} />
          </div>

          <div>
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">Streamers</h2>
            <p className="mb-6 max-w-[var(--prose)] text-[var(--text-2)]">
              Streamers and wets for stained water, banks, and low light. This is not a claim that streamers are &quot;on&quot; today.
            </p>
            <FlyGrid flies={grouped.streamers} />
          </div>

          <div>
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">Setup</h2>
            <p className="max-w-[var(--prose)] leading-relaxed text-[var(--text-2)]">{setupCopy(river)}</p>
          </div>

          <div>
            <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">FAQ</h2>
            <dl className="max-w-[var(--prose)] space-y-6">
              {faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-heading text-xl text-[var(--text-1)]">{f.question}</dt>
                  <dd className="mt-2 leading-relaxed text-[var(--text-2)]">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="mb-6 font-heading text-2xl font-semibold leading-tight text-[var(--text-1)]">Related</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={`/rivers/${river.slug}`}
                className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <p className="ea-overline">River guide</p>
                <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{river.name}</p>
                <p className="mt-2 text-sm text-[var(--text-2)]">Access, hatch chart, USGS gauge.</p>
              </Link>
              {dest && (
                <Link
                  href={`/destinations/${dest.slug}`}
                  className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="ea-overline">Destination</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{dest.name}</p>
                  <p className="mt-2 text-sm text-[var(--text-2)]">Trip planning for this region.</p>
                </Link>
              )}
              {relatedFlies.map((fly) => (
                <Link
                  key={fly.id}
                  href={`/flies/${fly.slug}`}
                  className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="ea-overline">Pattern</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{fly.name}</p>
                  <p className="mt-2 text-sm text-[var(--text-2)]">{CATEGORY_LABEL[fly.category] || fly.category}</p>
                </Link>
              ))}
              {guides.slice(0, 2).map((g) => (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug}`}
                  className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="ea-overline">Guide</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{g.name}</p>
                </Link>
              ))}
              {shops.slice(0, 2).map((s) => (
                <Link
                  key={s.id}
                  href={`/fly-shops/${s.slug}`}
                  className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="ea-overline">Fly shop</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{s.name}</p>
                  <p className="mt-2 text-sm text-[var(--text-2)]">{s.address}</p>
                </Link>
              ))}
              {nearbyWaters.map((r) => (
                <Link
                  key={r.id}
                  href={`/rivers/${r.slug}`}
                  className="card-hover block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="ea-overline">Nearby water</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-1)]">{r.name}</p>
                  <p className="mt-2 text-sm text-[var(--text-2)]">Open the river guide, then its fly list.</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
