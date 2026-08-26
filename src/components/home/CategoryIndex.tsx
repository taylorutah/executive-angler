import Link from "next/link";

export type CategoryCounts = {
  rivers: number;
  flies: number;
  places: number;
  notes: number;
};

type Door = {
  label: string;
  href: string;
  count: number;
  noun: string;
  line: string;
};

function formatCount(n: number): string {
  return n > 0 ? n.toLocaleString("en-US") : "—";
}

/**
 * Four doors — TypographicPlate tiles with honest counts.
 * 2×2. Not a three-up icon-and-paragraph grid. No new glyphs.
 */
export default function CategoryIndex({ rivers, flies, places, notes }: CategoryCounts) {
  const doors: Door[] = [
    {
      label: "Rivers",
      href: "/rivers",
      count: rivers,
      noun: "rivers",
      line: "Flow, hatches, access, and the regulations that actually apply.",
    },
    {
      label: "Flies",
      href: "/flies/library",
      count: flies,
      noun: "patterns",
      line: "The recipe, the sizes, and what each one is imitating.",
    },
    {
      label: "Places",
      href: "/destinations",
      count: places,
      noun: "places",
      line: "Where to go, and the rivers that make the flight worth it.",
    },
    {
      label: "Field Notes",
      href: "/articles",
      count: notes,
      noun: "notes",
      line: "Reading water, gear that earns its place, and technique.",
    },
  ];

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
          The reference
        </p>
        <div className="mt-6 grid grid-cols-2 border-t-2 border-l border-[var(--ink)]">
          {doors.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className="group ea-focus-ring relative border-b border-r border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-6 sm:px-7 sm:py-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 border border-transparent transition-[border-color] duration-[140ms] ease-out group-hover:border-[var(--ink)]"
              />
              <span className="relative block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
                  {door.noun}
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-heading text-[1.65rem] leading-none tracking-tight text-[var(--text-primary)] sm:text-[2.15rem]">
                    {door.label}
                  </h2>
                  <span className="font-heading text-[1.75rem] font-medium tabular-nums leading-none text-[var(--text-primary)] sm:text-[2.75rem]">
                    {formatCount(door.count)}
                  </span>
                </span>
                <p
                  className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[var(--text-body)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {door.line}
                </p>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
