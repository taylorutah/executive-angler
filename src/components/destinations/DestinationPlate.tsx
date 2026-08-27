import SafeEntityImage from "@/components/media/SafeEntityImage";
import { formatBestMonthsLabel } from "@/lib/destinations/season";

interface Props {
  name: string;
  tagline?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroImageCredit?: string;
  heroImageCreditUrl?: string;
  bestMonths: string[];
  primarySpecies: string[];
  region?: string;
}

/**
 * Place header: photograph, name, season, species.
 * Not a booking widget. No lodge lifestyle photography.
 * Brand Bible v4.1 §12 DestinationPlate.
 */
export default function DestinationPlate({
  name,
  tagline,
  heroImageUrl,
  heroImageAlt,
  heroImageCredit,
  heroImageCreditUrl,
  bestMonths,
  primarySpecies,
  region,
}: Props) {
  const monthsLabel = formatBestMonthsLabel(bestMonths);
  const species = (primarySpecies ?? []).filter(Boolean);

  return (
    <header className="bg-[var(--surface-page)]">
      <figure className="relative m-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          <SafeEntityImage
            src={heroImageUrl}
            alt={heroImageAlt || `Fly fishing in ${name}`}
            title={name}
            meta={region}
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {heroImageCredit && (
          <figcaption className="mx-auto max-w-7xl px-4 pt-2.5 font-ui text-[13px] text-[var(--text-meta)] sm:px-6 lg:px-8">
            {heroImageCreditUrl ? (
              <a
                href={heroImageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--action)]"
              >
                {heroImageCredit}
              </a>
            ) : (
              heroImageCredit
            )}
          </figcaption>
        )}
      </figure>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        {region && (
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
            {region}
          </p>
        )}
        <h1 className="font-heading mt-1 text-4xl leading-[1.05] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          {name}
        </h1>
        {tagline && (
          <p className="mt-4 max-w-[68ch] font-body text-xl leading-snug text-[var(--text-body)] sm:text-2xl">
            {tagline}
          </p>
        )}

        <dl className="mt-8 grid gap-6 border-t border-[var(--border-rule)] pt-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Season
            </dt>
            <dd className="mt-1.5 text-[15px] text-[var(--text-primary)]">
              {monthsLabel || "Best months not listed yet."}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-meta)]">
              Species
            </dt>
            <dd className="mt-1.5 text-[15px] text-[var(--text-primary)]">
              {species.length > 0 ? species.join(" · ") : "Species not listed yet."}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
