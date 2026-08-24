import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { Destination } from "@/types/entities";

interface Props {
  destinations: Destination[];
  /** The month the seasonal line is written against. */
  month: string;
}

/**
 * Seasonal framing straight off `bestMonths` — if the destination's own data
 * doesn't claim the month, we quote the months it does claim instead.
 */
export function seasonLine(bestMonths: string[], month: string): string | null {
  const months = bestMonths ?? [];
  if (months.length === 0) return null;
  if (months.includes(month)) return `Best in ${month}`;
  if (months.length === 1) return `Best in ${months[0]}`;
  return `Best ${months[0]}–${months[months.length - 1]}`;
}

/** Band 8 — three places, at photographic scale. */
export default function WhereToGo({ destinations, month }: Props) {
  if (destinations.length === 0) return null;

  return (
    <section className="bg-[var(--surface-page)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Where to go
          </h2>
          <Link
            href="/destinations"
            className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
          >
            All destinations &rarr;
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {destinations.map((destination) => {
            const season = seasonLine(destination.bestMonths, month);
            return (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-[var(--border-rule)]">
                  <SafeEntityImage
                    src={destination.heroImageUrl}
                    alt={destination.heroImageAlt ?? ""}
                    title={destination.name}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    scrimClassName="bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    {season && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/85">
                        {season}
                      </p>
                    )}
                    <h3 className="mt-1 font-heading text-3xl font-bold text-white drop-shadow">
                      {destination.name}
                    </h3>
                  </div>
                </div>
                {destination.tagline && (
                  <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-body)]">
                    {destination.tagline}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
