import type { ReactNode } from "react";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import EntityIdentityBand from "@/components/ui/EntityIdentityBand";
import FactList from "@/components/ui/FactList";
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
  toolbar?: ReactNode;
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
  toolbar,
}: Props) {
  const monthsLabel = formatBestMonthsLabel(bestMonths);
  const species = (primarySpecies ?? []).filter(Boolean);

  return (
    <header className="bg-[var(--paper)]">
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
          <figcaption className="mx-auto max-w-[var(--container)] px-4 pt-2 text-[13px] text-[var(--text-3)] sm:px-6 lg:px-8">
            {heroImageCreditUrl ? (
              <a
                href={heroImageCreditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)]"
              >
                {heroImageCredit}
              </a>
            ) : (
              heroImageCredit
            )}
          </figcaption>
        )}
      </figure>

      <EntityIdentityBand
        toolbar={toolbar}
        overline={region}
        title={name}
        meta={tagline}
        spec={
          <FactList
            className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4"
            facts={[
              { label: "Season", value: monthsLabel || "Best months not listed yet." },
              {
                label: "Species",
                className: "col-span-2 sm:col-span-3",
                value: species.length > 0 ? species.join(" · ") : "Species not listed yet.",
              },
            ]}
          />
        }
      />
    </header>
  );
}
