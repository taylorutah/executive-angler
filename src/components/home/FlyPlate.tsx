import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { CanonicalFly } from "@/types/entities";

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

/** Band 7 — the fly plate, laid out like a naturalist's specimen sheet. */
export default function FlyPlate({ flies, flyCount }: Props) {
  if (flies.length === 0) return null;

  return (
    <section className="bg-[var(--surface-page)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            The fly plate
          </h2>
          <Link
            href="/flies/library"
            className="shrink-0 text-[14px] text-[var(--action)] underline-offset-4 hover:underline"
          >
            {flyCount > 0 ? `All ${flyCount} patterns` : "All patterns"} &rarr;
          </Link>
        </div>

        <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {flies.map((fly) => {
            const size = sizeLabel(fly.sizes);
            const imitates = fly.imitates?.[0];
            return (
              <li key={fly.id}>
                <Link href={`/flies/${fly.slug}`} className="group block text-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md border border-[var(--border-rule)] bg-[var(--surface-raised)]">
                    <SafeEntityImage
                      src={fly.heroImageUrl}
                      alt=""
                      title={fly.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  </div>
                  <h3 className="mt-3 font-heading text-[15px] font-semibold leading-tight text-[var(--text-primary)] group-hover:text-[var(--action)]">
                    {fly.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-meta)]">
                    {[size, imitates].filter(Boolean).join(" · ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
