import DeskMast from "@/components/desk/DeskMast";
import DeskPhotoCard from "@/components/desk/DeskPhotoCard";
import DeskSeeAll from "@/components/desk/DeskSeeAll";
import HomeGutter from "@/components/home/HomeGutter";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { hostedStillUrl } from "@/lib/media/image-url";
import Link from "next/link";

export type FindDeskItem = {
  id: string;
  href: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string;
  meta?: string;
  description?: string | null;
  websiteUrl?: string | null;
  featured?: boolean;
};

function excerpt(text: string, max = 280): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function pickFeatured(items: FindDeskItem[]): FindDeskItem | null {
  return (
    items.find((item) => item.featured && hostedStillUrl(item.imageUrl)) ??
    items.find((item) => Boolean(hostedStillUrl(item.imageUrl))) ??
    items[0] ??
    null
  );
}

function pickWeek(items: FindDeskItem[], featuredId: string | undefined, limit = 5): FindDeskItem[] {
  const rest = items.filter((item) => item.id !== featuredId);
  const featuredRest = rest.filter((item) => item.featured);
  const out = [...featuredRest];
  for (const item of rest) {
    if (out.length >= limit) break;
    if (out.some((kept) => kept.id === item.id)) continue;
    out.push(item);
  }
  return out.slice(0, limit);
}

interface Props {
  title: string;
  lede: string;
  featuredInkLine: string;
  seeAllHref: string;
  seeAllNoun: string;
  items: FindDeskItem[];
}

/** FIND magazine — Lodges 84:3 language for leftover Find indexes. */
export default function FindDesk({
  title,
  lede,
  featuredInkLine,
  seeAllHref,
  seeAllNoun,
  items,
}: Props) {
  const featured = pickFeatured(items);
  const week = pickWeek(items, featured?.id);
  const onDesk = (featured ? 1 : 0) + week.length;
  const featuredStill = featured ? hostedStillUrl(featured.imageUrl) : undefined;

  return (
    <>
      <DeskMast
        kicker="FIND"
        title={title}
        lede={lede}
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
                href={`${seeAllHref}?view=list`}
                className="ea-focus-ring bg-[var(--paper)] px-3.5 py-2 font-ui text-[12px] text-[var(--graphite)]"
              >
                List
              </Link>
            </div>
            <Link
              href={seeAllHref}
              className="ea-focus-ring rounded-[2px] border border-[var(--border-rule)] bg-[var(--paper)] px-[18px] py-2 font-ui text-[13px] font-medium text-[var(--ink)]"
            >
              Refine
            </Link>
          </div>

          {featured ? (
            <div className="grid items-start gap-8 pb-10 lg:grid-cols-[minmax(0,794fr)_minmax(0,454fr)]">
              <Link
                href={featured.href}
                className="photo-lift relative aspect-[794/420] w-full border border-[var(--border-rule)]"
              >
                <SafeEntityImage
                  src={featuredStill}
                  alt={featured.imageAlt || featured.name}
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
                <Link href={featured.href}>
                  <h2
                    className="hover-copper font-heading text-[32px] font-semibold leading-[38px] text-[var(--ink)] hover:text-[var(--copper)] sm:text-[36px] sm:leading-[40px]"
                    style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                  >
                    {featured.name}
                  </h2>
                </Link>
                {featured.meta ? (
                  <p className="font-ui text-[14px] leading-[18px] text-[var(--slate)]">
                    {featured.meta}
                  </p>
                ) : null}
                {featured.description ? (
                  <p className="font-ui text-[16px] leading-6 text-[var(--graphite)]">
                    {excerpt(featured.description)}
                  </p>
                ) : null}
                <p className="font-ui text-[16px] leading-6 text-[var(--ink)]">{featuredInkLine}</p>
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
                {week.map((item) => (
                  <li key={item.id}>
                    <DeskPhotoCard
                      href={item.href}
                      imageUrl={hostedStillUrl(item.imageUrl)}
                      imageAlt={item.imageAlt || item.name}
                      title={item.name}
                      meta={item.meta}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <DeskSeeAll
            kicker="THE LIST"
            title={`${onDesk} on the desk. Every ${seeAllNoun} we keep.`}
            href={seeAllHref}
            label={`Every ${seeAllNoun} we keep →`}
          />
        </HomeGutter>
      </section>
    </>
  );
}
