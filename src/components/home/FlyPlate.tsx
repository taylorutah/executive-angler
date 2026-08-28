import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { CanonicalFly } from "@/types/entities";
import { flyPlateAlt } from "./fly-plate";
import HomeGutter from "./HomeGutter";

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

/** Twelve patterns. Clip the photo, keep the name, copper on hover. */
export default function FlyPlate({ flies, flyCount }: Props) {
  if (flies.length === 0) return null;

  return (
    <section data-lane="resource" className="bg-[var(--paper)] pb-10 pt-12">
      <HomeGutter>
        <h2
          className="font-heading text-[28px] font-semibold leading-none text-[var(--ink)] sm:text-[36px]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          The plate
        </h2>
        <p className="mt-4 font-ui text-[14px] text-[var(--graphite)]">
          {flyCount > 0 ? (
            <>
              <span className="sm:hidden">On the water this week.</span>
              <span className="hidden sm:inline">Twelve patterns on the water this week.</span>
            </>
          ) : (
            "Patterns from the library."
          )}
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {flies.map((fly) => {
            const size = sizeLabel(fly.sizes);
            const imitates = fly.imitates?.[0];
            return (
              <li key={fly.id}>
                <Link href={`/flies/${fly.slug}`} className="group block">
                  <div className="photo-lift relative aspect-square w-full border border-[var(--border-rule)]">
                    <SafeEntityImage
                      src={fly.heroImageUrl}
                      alt={flyPlateAlt(fly.name, size, imitates)}
                      title={fly.name}
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                  <h3 className="hover-copper mt-1.5 font-ui text-[12px] font-medium text-[var(--ink)] group-hover:text-[var(--copper)]">
                    {fly.name}
                  </h3>
                  {size && (
                    <p className="mt-0.5 font-ui text-[11px] text-[var(--slate)]">{size}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/flies/library"
          className="mt-4 inline-block font-ui text-[13px] font-medium text-[var(--action)] hover:text-[var(--action-hover)] lg:hidden"
        >
          All flies →
        </Link>
      </HomeGutter>
    </section>
  );
}
