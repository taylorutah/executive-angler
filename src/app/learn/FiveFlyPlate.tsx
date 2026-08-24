import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import type { LearnFly } from "./types";

function sizeLabel(sizes: string[]): string | null {
  const values = sizes.map(String).filter(Boolean);
  if (values.length === 0) return null;
  if (values.length === 1) return `#${values[0]}`;
  return `#${values[0]}–${values[values.length - 1]}`;
}

/** The first five, as a specimen plate — each fly has a job. */
export default function FiveFlyPlate({ flies }: { flies: LearnFly[] }) {
  if (flies.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
      {flies.map((fly) => {
        const size = sizeLabel(fly.sizes);
        const imitates = fly.imitates[0];
        return (
          <li key={fly.id}>
            <Link href={`/flies/${fly.slug}`} className="ea-focus-ring group block">
              <div className="relative aspect-square w-full overflow-hidden rounded-md border border-[var(--border-rule)] bg-[var(--surface-raised)]">
                <SafeEntityImage
                  src={fly.heroImageUrl}
                  alt=""
                  title={fly.name}
                  className="object-cover transition-transform duration-[160ms] ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              <h3 className="mt-3 font-heading text-[17px] font-semibold leading-tight text-[var(--text-primary)] underline decoration-transparent underline-offset-4 group-hover:text-[var(--action)] group-hover:decoration-[var(--action)]">
                {fly.name}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-body)]">
                {[fly.category, size, imitates].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-body)]">
                {fly.job}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
