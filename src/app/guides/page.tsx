import type { Metadata } from "next";
import Link from "next/link";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import { getAllGuides, getAllDestinations } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const guides = await getAllGuides();
  const n = guides.length;
  return {
    title: brandedTitle(`${n} Expert Fly Fishing Guides — Compare & Book`),
    description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. From Montana to Mongolia — find your next guide and book direct.`,
    alternates: { canonical: `${SITE_URL}/guides` },
    openGraph: {
      title: `${n} Expert Fly Fishing Guides`,
      description: `Browse ${n} vetted fly fishing guides worldwide with rates, specialties, and reviews. Find your next guide and book direct.`,
      images: ["/api/og?title=Fly%20Fishing%20Guides&subtitle=Expert%20Professionals&type=default"],
    },
  };
}

export default async function GuidesPage() {
  const [guides, destinations] = await Promise.all([getAllGuides(), getAllDestinations()]);
  const sortedGuides = [...guides].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <DeskMast
        title="Guides"
        lede={`${guides.length} people who know a river. Their site takes the day. We do not book it.`}
      />

      <section className="bg-[var(--surface-page)] pb-16">
        <HomeGutter>
          <ul>
            {sortedGuides.map((guide) => {
              const dest = destinations.find((d) => d.id === guide.destinationId);
              return (
                <li key={guide.id} className="border-t border-[var(--border-rule)]">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0">
                      <h2
                        className="font-heading text-[22px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)]"
                        style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
                      >
                        {guide.name}
                      </h2>
                      <p className="mt-1 font-ui text-[14px] text-[var(--text-body)]">
                        {[dest?.name, guide.specialties.slice(0, 2).join(", ")]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 font-ui text-[13px] font-medium text-[var(--action)]">
                      View →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </HomeGutter>
      </section>
    </>
  );
}
