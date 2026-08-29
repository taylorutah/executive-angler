import Link from "next/link";
import DeskMast from "@/components/desk/DeskMast";
import DeskPhotoCard from "@/components/desk/DeskPhotoCard";
import DeskSeeAll from "@/components/desk/DeskSeeAll";
import HomeGutter from "@/components/home/HomeGutter";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { getAllDestinations, getAllLodges, getAllRivers } from "@/lib/db";
import type { Destination, Lodge, River } from "@/types/entities";

function excerpt(text: string, max = 280): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function lodgeMeta(lodge: Lodge, dest?: Destination, river?: River): string {
  return [dest?.name || dest?.state, river?.name].filter(Boolean).join(" · ");
}

function pickFeatured(lodges: Lodge[]): Lodge | null {
  return (
    lodges.find((l) => l.featured && l.heroImageUrl) ??
    lodges.find((l) => Boolean(l.heroImageUrl)) ??
    lodges[0] ??
    null
  );
}

function pickWeek(lodges: Lodge[], featuredId: string | undefined, limit = 5): Lodge[] {
  const rest = lodges.filter((l) => l.id !== featuredId);
  const featuredRest = rest.filter((l) => l.featured);
  const out = [...featuredRest];
  for (const lodge of rest) {
    if (out.length >= limit) break;
    if (out.some((l) => l.id === lodge.id)) continue;
    out.push(lodge);
  }
  return out.slice(0, limit);
}

/** Lodges / 1440 — FIND / Lodges. Frame 84:3. */
export default async function LodgesDeskPage() {
  const [lodges, destinations, rivers] = await Promise.all([
    getAllLodges(),
    getAllDestinations(),
    getAllRivers(),
  ]);
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const riverById = new Map(rivers.map((r) => [r.id, r]));
  const featured = pickFeatured(lodges);
  const week = pickWeek(lodges, featured?.id);
  const featuredDest = featured ? destById.get(featured.destinationId) : undefined;
  const featuredRiver = featured?.nearbyRiverIds?.[0]
    ? riverById.get(featured.nearbyRiverIds[0])
    : undefined;
  const featuredLine = featured ? lodgeMeta(featured, featuredDest, featuredRiver) : "";
  const onDesk = (featured ? 1 : 0) + week.length;

  return (
    <>
      <DeskMast
        kicker="FIND"
        title="Lodges"
        lede="Beds on water we keep. Not a booking engine. We name the house. We do not take the reservation."
        titleSize="phrase"
        ledeFace="ui"
      />

      <section className="bg-[var(--paper)] pb-4">
        <HomeGutter>
          <div className="mb-8 flex h-10 items-center justify-between">
            <div
              className="flex overflow-hidden rounded-[2px] border border-[var(--border-rule)]"
              role="group"
              aria-label="View density"
            >
              <span className="bg-[var(--ink)] px-3.5 py-2 font-ui text-[12px] font-medium text-[var(--hero-type)]">
                Pictures
              </span>
              <Link
                href="/lodges/all?view=list"
                className="ea-focus-ring bg-[var(--paper)] px-3.5 py-2 font-ui text-[12px] text-[var(--graphite)]"
              >
                List
              </Link>
            </div>
            <Link
              href="/lodges/all"
              className="ea-focus-ring rounded-[2px] border border-[var(--border-rule)] bg-[var(--paper)] px-[18px] py-2 font-ui text-[13px] font-medium text-[var(--ink)]"
            >
              Refine
            </Link>
          </div>

          {featured ? (
            <div className="grid items-start gap-8 pb-10 lg:grid-cols-[minmax(0,794fr)_minmax(0,454fr)]">
              <Link
                href={`/lodges/${featured.slug}`}
                className="photo-lift relative aspect-[794/420] w-full border border-[var(--border-rule)]"
              >
                <SafeEntityImage
                  src={featured.heroImageUrl}
                  alt={featured.heroImageAlt || featured.name}
                  title={featured.name}
                  fallback="quiet"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  priority
                />
              </Link>
              <div className="flex flex-col gap-3">
                <p className="font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                  On the desk
                </p>
                <Link href={`/lodges/${featured.slug}`}>
                  <h2
                    className="hover-copper font-heading text-[32px] font-semibold leading-[38px] text-[var(--ink)] hover:text-[var(--copper)] sm:text-[36px] sm:leading-[40px]"
                    style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                  >
                    {featured.name}
                  </h2>
                </Link>
                {featuredLine ? (
                  <p className="font-ui text-[14px] leading-[18px] text-[var(--slate)]">
                    {featuredLine}
                  </p>
                ) : null}
                {featured.description ? (
                  <p className="font-ui text-[16px] leading-6 text-[var(--graphite)]">
                    {excerpt(featured.description)}
                  </p>
                ) : null}
                <p className="font-ui text-[16px] leading-6 text-[var(--ink)]">
                  We do not take the reservation.
                </p>
                {featured.websiteUrl ? (
                  <a
                    href={featured.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-copper font-ui text-[14px] font-medium text-[var(--copper)]"
                  >
                    Their site →
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {week.length > 0 ? (
            <div className="pb-4">
              <h2
                className="mb-4 font-heading text-[28px] font-semibold leading-8 text-[var(--ink)]"
                style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
              >
                Also on the desk this week
              </h2>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {week.map((lodge) => {
                  const dest = destById.get(lodge.destinationId);
                  const river = lodge.nearbyRiverIds?.[0]
                    ? riverById.get(lodge.nearbyRiverIds[0])
                    : undefined;
                  return (
                    <li key={lodge.id}>
                      <DeskPhotoCard
                        href={`/lodges/${lodge.slug}`}
                        imageUrl={lodge.heroImageUrl}
                        imageAlt={lodge.heroImageAlt || lodge.name}
                        title={lodge.name}
                        meta={lodgeMeta(lodge, dest, river) || lodge.priceRange}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <DeskSeeAll
            kicker="THE LIST"
            title={`${onDesk} on the desk. Every lodge we keep.`}
            href="/lodges/all"
            label="Every lodge we keep →"
          />
        </HomeGutter>
      </section>
    </>
  );
}
