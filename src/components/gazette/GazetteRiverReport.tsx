import Image from "next/image";
import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import GazetteLiveGauge from "./GazetteLiveGauge";
import type { AccessPoint, CanonicalFly, HatchEntry, River } from "@/types/entities";
import { matchHatchPlate } from "@/lib/rivers/week-flies";
import type { RegulationSource } from "@/lib/rivers/regulations";

interface Plate {
  key: string;
  name: string;
  href?: string;
  imageUrl?: string;
  insect: string;
  size?: string;
}

interface Props {
  river: River;
  overline: string;
  place: string;
  siteId: string | null;
  plates: Plate[];
  accessPoints: AccessPoint[];
  regulations?: string;
  regsSource: RegulationSource;
  evidencePhoto?: { src: string; alt: string; caption: string };
}

export default function GazetteRiverReport({
  river,
  overline,
  place,
  siteId,
  plates,
  accessPoints,
  regulations,
  regsSource,
  evidencePhoto,
}: Props) {
  return (
    <article className="bg-[var(--paper)]">
      <div className="mx-auto max-w-[72rem] px-4 pt-8 sm:px-8">
        <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
          {overline}
        </p>
        <h1 className="mt-3 font-display text-[clamp(44px,7vw,72px)] font-semibold leading-[0.95] text-[var(--ink)]">
          {river.name}
        </h1>
      </div>

      <GazetteLiveGauge riverId={river.id} siteId={siteId} place={place} />

      {plates.length > 0 ? (
        <section className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
          <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Current hatches
          </h2>
          <ul className="mt-4 grid grid-cols-1 border-t border-l border-[var(--border)] sm:grid-cols-3">
            {plates.slice(0, 3).map((plate) => {
              const inner = (
                <>
                  {plate.imageUrl ? (
                    <div className="relative aspect-square w-full bg-[var(--plate)]">
                      <SafeEntityImage
                        src={plate.imageUrl}
                        alt={plate.name}
                        title={plate.name}
                        contain
                        className="object-contain"
                        sizes="33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-end bg-[var(--plate)] p-3">
                      <p className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--ink)]">
                        {plate.name}
                      </p>
                    </div>
                  )}
                  <p className="mt-2 font-display text-sm font-semibold text-[var(--ink)]">
                    {plate.name}
                  </p>
                  <p className="mt-0.5 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
                    {[plate.insect, plate.size].filter(Boolean).join(" · ")}
                  </p>
                </>
              );
              return (
                <li key={plate.key} className="border-b border-r border-[var(--border)] p-3">
                  {plate.href ? <Link href={plate.href} className="block">{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
        <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
          Access
        </h2>
        {accessPoints.length > 0 ? (
          <ul className="mt-3 border-t border-[var(--border)]">
            {accessPoints.map((ap, i) => (
              <li key={`${ap.name}-${i}`} className="border-b border-[var(--border)] py-3">
                <h3 className="font-display text-[17px] font-semibold text-[var(--ink)]">{ap.name}</h3>
                {ap.description ? (
                  <p className="mt-0.5 text-[15px] text-[var(--text-2)]">{ap.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[15px] text-[var(--text-3)]">No access points are listed yet.</p>
        )}
      </section>

      {regulations ? (
        <section className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
          <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Regulations
          </h2>
          <p className="mt-3 max-w-[var(--prose)] text-[17px] leading-relaxed text-[var(--text-2)]">
            {regulations}
          </p>
          <p className="mt-3 font-ui text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">
            Verify with{" "}
            <a href={regsSource.url} className="text-[var(--ink)] underline underline-offset-4" rel="noopener noreferrer">
              {regsSource.label}
            </a>
            . Retrieved {regsSource.retrievedOn}.
          </p>
        </section>
      ) : null}

      {evidencePhoto ? (
        <figure className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
          <div className="relative aspect-[16/7] w-full overflow-hidden bg-[var(--paper-deep)]">
            {evidencePhoto.src.startsWith("/") ? (
              <Image
                src={evidencePhoto.src}
                alt={evidencePhoto.alt}
                fill
                unoptimized
                sizes="(max-width: 1440px) 92vw, 1152px"
                className="object-cover"
              />
            ) : (
              <SafeEntityImage
                src={evidencePhoto.src}
                alt={evidencePhoto.alt}
                title={river.name}
                className="object-cover"
                sizes="(max-width: 1440px) 92vw, 1152px"
              />
            )}
          </div>
          <figcaption className="mt-3 text-center font-ui text-[11px] uppercase tracking-[0.18em] text-[var(--text-3)]">
            {evidencePhoto.caption}
          </figcaption>
        </figure>
      ) : null}

      <div className="mx-auto max-w-[72rem] border-t border-[var(--border)] px-4 py-12 sm:px-8">
        <h2 className="font-display text-[28px] font-semibold text-[var(--ink)]">
          Keep a journal on this river
        </h2>
        <Link
          href={`/journal/new?river=${river.slug}`}
          className="mt-5 inline-flex bg-[var(--accent)] px-4 py-2.5 font-ui text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--on-action)]"
        >
          Keep a journal
        </Link>
      </div>
    </article>
  );
}

export function platesFromHatches(
  hatches: HatchEntry[],
  flies: CanonicalFly[],
): Plate[] {
  return hatches.slice(0, 3).map((hatch, i) => {
    const plate = matchHatchPlate(hatch, flies);
    return {
      key: `${hatch.insect}-${hatch.pattern}-${i}`,
      name: plate.name,
      href: plate.href,
      imageUrl: plate.imageUrl,
      insect: hatch.insect,
      size: hatch.size,
    };
  });
}
