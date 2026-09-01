import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { CanonicalFly } from "@/types/entities";
import { flyPlateAlt, specimenScale } from "./fly-plate";

interface Props {
  flies: CanonicalFly[];
  flyCount: number;
}

function sizeLabel(sizes: CanonicalFly["sizes"]): string | null {
  const values = (sizes ?? []).map(String).filter(Boolean);
  if (values.length === 0) return null;
  if (values.length === 1) return `#${values[0]}`;
  return `#${values[0]}–${values[values.length - 1]}`;
}

/** Twelve macros as a specimen plate. Ruled grid, no card chrome, no shadows. */
export default function FlyPlate({ flies, flyCount }: Props) {
  if (flies.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-[var(--paper-deep)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <p className="ea-overline">The plate</p>
          <Link
            href="/flies/library"
            className="shrink-0 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {flyCount > 0 ? `All ${flyCount} patterns` : "All patterns"}{" "}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
          <p className="ea-overline mb-8 max-w-[20ch] leading-relaxed lg:mb-0 lg:pt-2">
            Plate I
            <br />
            Twelve patterns from the library, as specified.
            <br />
            Size and imitation from the record.
          </p>

          <ul className="grid grid-cols-3 border-t border-l border-[var(--border)] bg-[var(--paper)] sm:grid-cols-4 lg:grid-cols-6">
            {flies.map((fly) => {
              const size = sizeLabel(fly.sizes);
              const imitates = fly.imitates?.[0];
              const scale = specimenScale(fly.sizes);
              return (
                <li key={fly.id} className="border-b border-r border-[var(--border)]">
                  <Link href={`/flies/${fly.slug}`} className="group block p-3 sm:p-4">
                    <div className="relative flex aspect-square w-full items-center justify-center bg-[var(--paper-deep)]">
                      <div
                        className="relative"
                        style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
                      >
                        <SafeEntityImage
                          src={fly.heroImageUrl}
                          alt={flyPlateAlt(fly.name, size, imitates)}
                          title={fly.name}
                          contain
                          className="object-contain"
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold leading-tight text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                      {fly.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-3)]">
                      {[size, imitates].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
