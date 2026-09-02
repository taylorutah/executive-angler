import Image from "next/image";
import Link from "next/link";
import GazettePlate from "./GazettePlate";
import GazetteLiveGauge from "./GazetteLiveGauge";
import type { GaugeSnapshot } from "@/components/home/conditions";
import type { HydroReading } from "@/components/hydrograph/geometry";
import type { AccessPoint, Article, CanonicalFly, HatchEntry, River } from "@/types/entities";
import { matchHatchPlate } from "@/lib/rivers/week-flies";
import type { RegulationSource } from "@/lib/rivers/regulations";

interface Plate {
  key: string;
  name: string;
  href?: string;
  imageUrl?: string;
  insect: string;
  size?: string;
  etch?: CanonicalFly["category"];
}

interface Props {
  river: River;
  crumbs: { label: string; href?: string }[];
  meta: string;
  place: string;
  siteId: string | null;
  siteName?: string | null;
  plates: Plate[];
  accessPoints: AccessPoint[];
  regulations?: string;
  regsSource: RegulationSource;
  evidencePhoto?: { src: string; alt: string; caption: string };
  fieldNote?: Article | null;
  initialSnapshot?: GaugeSnapshot | null;
  initialHistory?: HydroReading[];
}

function formatLonLat(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${ns} ${Math.abs(lat).toFixed(4)}° ${ew} ${Math.abs(lon).toFixed(4)}°`;
}

function regulationLines(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Still 3 — station report. Masthead lives in the header.
 * Live gauge as type. Hydrograph beside FISH THIS NOW + REGULATIONS.
 * ACCESS hanging left of the evidence etching and the journal box.
 */
export default function GazetteRiverReport({
  river,
  crumbs,
  meta,
  place,
  siteId,
  siteName,
  plates,
  accessPoints,
  regulations,
  regsSource,
  evidencePhoto,
  fieldNote,
  initialSnapshot = null,
  initialHistory,
}: Props) {
  return (
    <article className="bg-[var(--paper)]">
      <div className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)]">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`}>
              {i > 0 ? <span aria-hidden> / </span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[var(--ink)]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--ink)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-4 font-display text-[clamp(44px,7vw,72px)] font-semibold leading-[0.95] text-[var(--ink)]">
          {river.name}
        </h1>
        {meta ? (
          <p className="mt-3 font-ui text-[12px] uppercase tracking-[0.18em] text-[var(--text-3)]">
            {meta}
          </p>
        ) : null}
        <div className="mt-5 h-px bg-[var(--border)]" aria-hidden />
      </div>

      <GazetteLiveGauge
        riverId={river.id}
        siteId={siteId}
        siteName={siteName}
        place={place}
        initialSnapshot={initialSnapshot}
        initialHistory={initialHistory}
      >
        <div>
          {plates.length > 0 ? (
            <section>
              <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                Fish this now
              </h2>
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {plates.slice(0, 3).map((plate) => (
                  <li key={plate.key}>
                    <GazettePlate
                      name={[plate.name, plate.size].filter(Boolean).join(" ")}
                      href={plate.href}
                      etch={plate.etch}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {regulations ? (
            <section className={plates.length > 0 ? "mt-8" : ""}>
              <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                Regulations ({regsSource.label})
              </h2>
              <ul className="ea-diamond-list mt-4 font-body text-[15px] leading-relaxed text-[var(--text-2)]">
                {regulationLines(regulations).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-3 font-body text-[15px] italic text-[var(--text-3)]">
                Regulations change. Verify before you fish.
              </p>
            </section>
          ) : null}
        </div>
      </GazetteLiveGauge>

      <div className="mx-auto grid max-w-[72rem] gap-8 border-t border-[var(--border)] px-4 py-8 sm:px-8 lg:grid-cols-3 lg:items-start">
        <section>
          <h2 className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
            Access
          </h2>
          {accessPoints.length > 0 ? (
            <ul className="ea-diamond-list mt-4">
              {accessPoints.map((ap, i) => (
                <li key={`${ap.name}-${i}`} className="pb-3">
                  <p className="font-body text-[16px] font-semibold text-[var(--ink)]">
                    {ap.name}
                    {Number.isFinite(ap.latitude) && Number.isFinite(ap.longitude)
                      ? ` · ${formatLonLat(ap.latitude, ap.longitude)}`
                      : ""}
                  </p>
                  {ap.description ? (
                    <p className="mt-0.5 font-body text-[15px] text-[var(--text-2)]">
                      {ap.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[15px] text-[var(--text-3)]">
              No access points are listed yet.
            </p>
          )}
        </section>

        {evidencePhoto ? (
          <figure>
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-[var(--paper-deep)]">
              <Image
                src={evidencePhoto.src}
                alt={evidencePhoto.alt}
                fill
                unoptimized
                sizes="(max-width: 1440px) 92vw, 1152px"
                className="ea-evidence object-cover"
              />
            </div>
            <figcaption className="mt-3 font-body text-[14px] italic text-[var(--text-3)]">
              {evidencePhoto.caption}
            </figcaption>
          </figure>
        ) : (
          <div />
        )}

        <div>
          {fieldNote ? (
            <Link href={`/articles/${fieldNote.slug}`} className="group block">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--copper)]">
                Field note
              </p>
              <h2 className="mt-3 font-display text-[22px] font-semibold text-[var(--ink)] group-hover:text-[var(--copper)]">
                {fieldNote.title}
              </h2>
              <p className="mt-2 font-ui text-[14px] tracking-[0.16em] text-[var(--ink)]" aria-hidden>
                →
              </p>
            </Link>
          ) : null}
          <Link href={`/journal/new?river=${river.slug}`} className="ea-journal-box mt-6">
            Keep a journal on this river
          </Link>
        </div>
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
    const matched = flies.find((fly) => fly.slug && plate.href?.endsWith(fly.slug));
    return {
      key: `${hatch.insect}-${hatch.pattern}-${i}`,
      name: plate.name,
      href: plate.href,
      imageUrl: plate.imageUrl,
      insect: hatch.insect,
      size: hatch.size,
      etch: matched?.category,
    };
  });
}
