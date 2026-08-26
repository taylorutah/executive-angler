import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Destination } from "@/types/entities";
import { photoAlt } from "./homepage-images";
import SectionMark from "./SectionMark";

interface Props {
  destinations: Destination[];
  month: string;
}

export function seasonLine(bestMonths: string[], month: string): string | null {
  const months = bestMonths ?? [];
  if (months.length === 0) return null;
  if (months.includes(month)) return `Best in ${month}`;
  if (months.length === 1) return `Best in ${months[0]}`;
  return `Best ${months[0]}–${months[months.length - 1]}`;
}

/** Three seasonal DestinationPlates. Not a booking widget. */
export default function WhereToGo({ destinations, month }: Props) {
  if (destinations.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <SectionMark n="03" label="Where to go" />
          <Link
            href="/destinations"
            className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
          >
            All destinations <span aria-hidden>&rarr;</span>
          </Link>
        </div>

        <ul className="grid gap-10 lg:grid-cols-3">
          {destinations.map((destination) => {
            const season = seasonLine(destination.bestMonths, month);
            const caption = destination.tagline ?? destination.region;
            const fallback = [destination.name, destination.region].filter(Boolean).join(", ");
            return (
              <li key={destination.id}>
                <Link href={`/destinations/${destination.slug}`} className="group block">
                  <div className="photo-card relative aspect-[3/4] w-full overflow-hidden border border-[var(--border-rule)]">
                    <SafeEntityImage
                      src={destination.heroImageUrl}
                      alt={photoAlt(destination.heroImageAlt, fallback)}
                      title={destination.name}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="mt-5 font-heading text-3xl font-bold leading-tight text-[var(--text-primary)]">
                    {destination.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-body)]">{caption}</p>
                  {season && (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
                      {season}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
