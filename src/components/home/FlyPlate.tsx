import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { CanonicalFly } from "@/types/entities";
import { flyPlateAlt } from "./fly-plate";

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

/** Six tied-fly plates on dry-fly cream. Never insects. Never Lucide. */
export default function FlyPlate({ flies, flyCount }: Props) {
  if (flies.length === 0) return null;

  return (
    <section data-lane="resource" className="border-b border-[var(--border)] bg-[var(--paper)] py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <p className="ea-overline">The plate</p>
          <Link
            href="/flies"
            className="font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--accent)]"
          >
            {flyCount > 0 ? `All ${flyCount} patterns` : "All patterns"}
          </Link>
        </div>

        <ul className="grid grid-cols-2 border-t border-l border-[var(--border)] sm:grid-cols-3 lg:grid-cols-6">
          {flies.map((fly) => {
            const size = sizeLabel(fly.sizes);
            const imitates = fly.imitates?.[0];
            return (
              <li key={fly.id} className="border-b border-r border-[var(--border)]">
                <Link href={`/flies/${fly.slug}`} className="group block p-3 sm:p-4">
                  <div className="relative flex aspect-square w-full items-center justify-center bg-[var(--plate)]">
                    {fly.heroImageUrl ? (
                      <SafeEntityImage
                        src={fly.heroImageUrl}
                        alt={flyPlateAlt(fly.name, size, imitates)}
                        title={fly.name}
                        contain
                        className="object-contain"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)]">
                        {fly.name}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--accent)]">
                    {fly.name}
                  </h3>
                  <p className="mt-1 font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">
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
