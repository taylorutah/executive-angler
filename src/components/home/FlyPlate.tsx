import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { CanonicalFly } from "@/types/entities";
import SectionMark from "./SectionMark";

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

/** Full-bleed specimen wall — two rows of six, hairline rules, a margin caption. */
export default function FlyPlate({ flies, flyCount }: Props) {
  if (flies.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <SectionMark n="02" label="The plate" />
          <Link
            href="/flies/library"
            className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
          >
            {flyCount > 0 ? `All ${flyCount} patterns` : "All patterns"}{" "}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
          <p className="mb-8 max-w-[20ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-[var(--text-meta)] lg:mb-0 lg:pt-2">
            Plate I
            <br />
            Twelve patterns from the library, as specified.
            <br />
            Size and imitation from the record.
          </p>

          <ul className="grid grid-cols-3 border-t border-l border-[var(--rule)] sm:grid-cols-4 lg:grid-cols-6">
            {flies.map((fly) => {
              const size = sizeLabel(fly.sizes);
              const imitates = fly.imitates?.[0];
              return (
                <li key={fly.id} className="border-b border-r border-[var(--rule)]">
                  <Link href={`/flies/${fly.slug}`} className="group block p-3 sm:p-5">
                    <div className="relative aspect-square w-full overflow-hidden bg-[var(--vellum)]">
                      <SafeEntityImage
                        src={fly.heroImageUrl}
                        alt=""
                        title={fly.name}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="mt-4 font-heading text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--text-primary)] group-hover:text-[var(--action)]">
                      {fly.name}
                    </h3>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
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
