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
    <section data-lane="resource" className="bg-[var(--surface-page)] pb-10 pt-12">
      <HomeGutter>
        <h2
          className="font-heading text-[36px] font-semibold leading-none text-[var(--text-primary)]"
          style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
        >
          The plate
        </h2>
        <p className="mt-4 font-ui text-[14px] text-[var(--text-body)]">
          <span className="sm:hidden">On the water this week.</span>
          <span className="hidden sm:inline">
            {flyCount > 0
              ? "Twelve patterns on the water this week."
              : "Patterns from the library."}
          </span>
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
                  <h3 className="mt-1.5 font-ui text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--action)]">
                    {fly.name}
                  </h3>
                  {size && (
                    <p className="mt-0.5 font-ui text-[11px] text-[var(--text-meta)]">{size}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/flies/library"
          className="mt-4 inline-block font-ui text-[13px] font-medium text-[var(--action)] hover:text-[var(--action-hover)]"
        >
          All flies →
        </Link>
      </HomeGutter>
    </section>
  );
}
