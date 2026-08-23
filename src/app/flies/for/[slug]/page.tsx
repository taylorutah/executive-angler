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
import EntityCard from "@/components/ui/EntityCard";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
import { formatHookSize } from "@/lib/flies/variant-format";

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

function sizeMeta(fly: CanonicalFly): string | undefined {
  const sizes = fly.sizes ?? [];
  if (sizes.length === 0) return undefined;
  if (sizes.length === 1) return `Size ${formatHookSize(sizes[0])}`;
  return `Sizes ${formatHookSize(sizes[0])}–${formatHookSize(sizes[sizes.length - 1])}`;
}

function HatchTable({ chart, currentMonth }: { chart: HatchMonth[]; currentMonth: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#21262D]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#161B22] text-left text-[#A8B2BD]">
            <th className="px-4 py-3 font-medium">Month</th>
            <th className="px-4 py-3 font-medium">Insect</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Pattern</th>
          </tr>
        </thead>
        <tbody>
          {chart.flatMap((month) =>
            (month.hatches ?? []).map((h, i) => (
              <tr
                key={`${month.month}-${h.pattern}-${i}`}
                className={`border-t border-[#21262D] ${
                  month.month.toLowerCase() === currentMonth.toLowerCase()
                    ? "bg-[#E8923A]/10"
                    : ""
                }`}
              >
                <td className="px-4 py-2.5 text-[#F0F6FC] whitespace-nowrap">{i === 0 ? month.month : ""}</td>
                <td className="px-4 py-2.5 text-[#A8B2BD]">{h.insect}</td>
                <td className="px-4 py-2.5 text-[#A8B2BD]">{h.size}</td>
                <td className="px-4 py-2.5 text-[#F0F6FC]">{h.pattern}</td>
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
    return <p className="text-[#A8B2BD]">No catalog patterns in this group yet. Use the hatch chart and the river guide.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {flies.map((fly, i) => (
        <ScrollAnimation key={fly.id} delay={Math.min(i * 0.04, 0.24)}>
          <EntityCard
            href={`/flies/${fly.slug}`}
            imageUrl={fly.heroImageUrl}
            imageAlt={`${fly.name} fly pattern`}
            title={fly.name}
            subtitle={fly.tagline || fly.description?.slice(0, 110)}
            meta={sizeMeta(fly)}
            badges={[CATEGORY_LABEL[fly.category] || fly.category]}
            iconOnly={!fly.heroImageUrl}
          />
        </ScrollAnimation>
      ))}
    </div>
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

      <div className="bg-[#0D1117] pt-6 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Fly Library", href: "/flies/library" },
              { label: `Best Flies for ${river.name}` },
            ]}
          />
        </div>
      </div>

      <section className="bg-[#0D1117] pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8923A]">
            Hatch-chart pattern list
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white">
            Best Flies for {river.name}
            {h1Place}
          </h1>
          <p className="mt-5 text-lg text-white/75 leading-relaxed">{uniqueLede(river, place)}</p>
          <p className="mt-4 text-sm text-[#6E7681]">
            This is not a live report of other anglers&apos; catches. Presence and flow live on the{" "}
            <Link href={`/rivers/${river.slug}`} className="text-[#E8923A] hover:underline">
              {river.name} river page
            </Link>
            {dest ? (
              <>
                {" "}
                and the{" "}
                <Link href={`/destinations/${dest.slug}`} className="text-[#E8923A] hover:underline">
                  {dest.name} destination guide
                </Link>
              </>
            ) : null}
            .
          </p>
        </div>
      </section>

      <section className="bg-[#161B22] border-t border-[#21262D] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-3">What&apos;s hatching now</h2>
            <p className="text-[#A8B2BD] mb-6 max-w-3xl">
              Month, insect, size, and pattern from the {river.name} hatch chart
              {chart.length ? `. ${month} is highlighted when that month exists in the chart.` : "."}{" "}
              We do not invent a hatch that is not on the chart.
            </p>
            {chart.length > 0 ? (
              <HatchTable chart={chart} currentMonth={month} />
            ) : (
              <p className="text-[#A8B2BD]">
                No month-by-month hatch chart is stored for this river yet. Use the nymph, dry, and streamer lists below, then read the{" "}
                <Link href={`/rivers/${river.slug}`} className="text-[#E8923A] hover:underline">
                  river guide
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Nymphs</h2>
            <p className="text-[#A8B2BD] mb-6 max-w-3xl">
              Subsurface patterns matched to this river&apos;s chart and catalog. Fish them at the size the chart lists, not the size that looks good in the bin.
            </p>
            <FlyGrid flies={grouped.nymphs} />
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Dries</h2>
            <p className="text-[#A8B2BD] mb-6 max-w-3xl">
              Dries and terrestrials for the {river.name}. If the chart says a size 18 PMD, do not start with a 12.
            </p>
            <FlyGrid flies={grouped.dries} />
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Streamers</h2>
            <p className="text-[#A8B2BD] mb-6 max-w-3xl">
              Streamers and wets for stained water, banks, and low light. This is not a claim that streamers are &quot;on&quot; today.
            </p>
            <FlyGrid flies={grouped.streamers} />
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-3">Setup</h2>
            <p className="text-[#A8B2BD] max-w-3xl leading-relaxed">{setupCopy(river)}</p>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-6">FAQ</h2>
            <dl className="space-y-6 max-w-3xl">
              {faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-heading text-xl text-white">{f.question}</dt>
                  <dd className="mt-2 text-[#A8B2BD] leading-relaxed">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-6">Related</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href={`/rivers/${river.slug}`}
                className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
              >
                <p className="text-xs uppercase tracking-wide text-[#6E7681]">River guide</p>
                <p className="mt-1 text-lg text-white font-semibold">{river.name}</p>
                <p className="mt-2 text-sm text-[#A8B2BD]">Access, hatch chart, USGS gauge.</p>
              </Link>
              {dest && (
                <Link
                  href={`/destinations/${dest.slug}`}
                  className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6E7681]">Destination</p>
                  <p className="mt-1 text-lg text-white font-semibold">{dest.name}</p>
                  <p className="mt-2 text-sm text-[#A8B2BD]">Trip planning for this region.</p>
                </Link>
              )}
              {relatedFlies.map((fly) => (
                <Link
                  key={fly.id}
                  href={`/flies/${fly.slug}`}
                  className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6E7681]">Pattern</p>
                  <p className="mt-1 text-lg text-white font-semibold">{fly.name}</p>
                  <p className="mt-2 text-sm text-[#A8B2BD]">{CATEGORY_LABEL[fly.category] || fly.category}</p>
                </Link>
              ))}
              {guides.slice(0, 2).map((g) => (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6E7681]">Guide</p>
                  <p className="mt-1 text-lg text-white font-semibold">{g.name}</p>
                </Link>
              ))}
              {shops.slice(0, 2).map((s) => (
                <Link
                  key={s.id}
                  href={`/fly-shops/${s.slug}`}
                  className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6E7681]">Fly shop</p>
                  <p className="mt-1 text-lg text-white font-semibold">{s.name}</p>
                  <p className="mt-2 text-sm text-[#A8B2BD]">{s.address}</p>
                </Link>
              ))}
              {nearbyWaters.map((r) => (
                <Link
                  key={r.id}
                  href={`/rivers/${r.slug}`}
                  className="block rounded-xl border border-[#21262D] bg-[#0D1117] p-5 hover:border-[#E8923A]/40"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6E7681]">Nearby water</p>
                  <p className="mt-1 text-lg text-white font-semibold">{r.name}</p>
                  <p className="mt-2 text-sm text-[#A8B2BD]">Open the river guide, then its fly list.</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
