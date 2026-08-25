import Link from "next/link";

export type CategoryCounts = {
  rivers: number;
  flies: number;
  places: number;
  notes: number;
};

type Mark = "riffle" | "hook" | "valley" | "page";

type Row = {
  label: string;
  href: string;
  count: number;
  noun: string;
  descriptor: string;
  mark: Mark;
};

function formatCount(n: number): string {
  return n > 0 ? n.toLocaleString("en-US") : "—";
}

function CategoryMark({ mark }: { mark: Mark }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 74 74" className="h-full w-full text-[var(--text-primary)]" aria-hidden>
      {mark === "riffle" && (
        <>
          <path {...common} d="M10 24c8-6 14-6 22 0s14 6 22 0 14-6 20 0" />
          <path {...common} d="M10 36c8-6 14-6 22 0s14 6 22 0 14-6 20 0" />
          <path {...common} d="M10 48c8-6 14-6 22 0s14 6 22 0 14-6 20 0" />
          <ellipse {...common} cx="22" cy="58" rx="5" ry="2.4" />
          <ellipse {...common} cx="48" cy="56" rx="7" ry="2.8" />
        </>
      )}
      {mark === "hook" && (
        <>
          <path {...common} d="M28 14a6 6 0 1 1 8 0v22c0 10-8 16-16 16s-16-6-16-16" />
          <path {...common} d="M12 36l-6 4 8 1" />
          <path {...common} d="M32 18c8-6 16-4 20 2" />
          <path {...common} d="M32 22c10-4 16 0 20 6" />
          <path {...common} d="M32 26c8-2 14 2 18 8" />
          <path {...common} d="M28 14h8" />
        </>
      )}
      {mark === "valley" && (
        <>
          <path {...common} d="M8 50 L24 22 L36 40 L50 18 L66 50" />
          <path {...common} d="M14 50 L36 32 L60 50" />
          <path {...common} d="M36 28v10" />
          <circle {...common} cx="36" cy="24" r="3.2" />
          <path {...common} d="M8 54h58" />
        </>
      )}
      {mark === "page" && (
        <>
          <rect {...common} x="18" y="12" width="38" height="50" />
          <path {...common} d="M24 12v50" />
          <path {...common} d="M28 24h22" />
          <path {...common} d="M28 32h22" />
          <path {...common} d="M28 40h22" />
          <path {...common} d="M28 48h16" />
        </>
      )}
    </svg>
  );
}

function CountBlock({ value, noun, compact }: { value: number; noun: string; compact?: boolean }) {
  return (
    <div className={compact ? "text-right" : "text-right tabular-nums"}>
      <p
        className="font-heading font-medium leading-none tracking-tight text-[var(--text-primary)] tabular-nums"
        style={{ fontSize: compact ? "1.75rem" : "3.1rem" }}
      >
        {formatCount(value)}
      </p>
      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
        {noun}
      </p>
    </div>
  );
}

/**
 * Option A, "The index." Four rows replace the photo tiles and the counts band.
 * Specimen marks, not photographs. The descriptor does the job the pictures
 * were failing at.
 */
export default function CategoryIndex({ rivers, flies, places, notes }: CategoryCounts) {
  const rows: Row[] = [
    {
      label: "Rivers",
      href: "/rivers",
      count: rivers,
      noun: "rivers",
      descriptor:
        "Live flow off the gauge, hatch charts, access points and regulations — river by river.",
      mark: "riffle",
    },
    {
      label: "Flies",
      href: "/flies/library",
      count: flies,
      noun: "patterns",
      descriptor:
        "Patterns with the recipe, the materials, the sizes, and what each one is imitating.",
      mark: "hook",
    },
    {
      label: "Places",
      href: "/destinations",
      count: places,
      noun: "places",
      descriptor: "Where to go and when, and the rivers that make each one worth the flight.",
      mark: "valley",
    },
    {
      label: "Field Notes",
      href: "/articles",
      count: notes,
      noun: "notes",
      descriptor:
        "Reading water, gear that earns its place, technique, and the occasional argument.",
      mark: "page",
    },
  ];

  const total = rows.reduce((sum, row) => sum + (row.count > 0 ? row.count : 0), 0);

  return (
    <section data-lane="resource" className="bg-[var(--surface-page)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="grid grid-cols-[1fr_auto] items-end gap-6 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-meta)]">
              The reference
            </p>
            <p
              className="mt-3 max-w-[40ch] text-[16px] leading-relaxed text-[var(--text-body)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything here is one of four things.
            </p>
          </div>
          <CountBlock value={total} noun="entries" />
        </header>

        <div className="border-t-2 border-[var(--text-primary)]">
          {rows.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              className="group relative grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-4 border-b border-[var(--border-rule)] py-[22px] sm:grid-cols-[74px_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6 ea-focus-ring"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-[10px] -right-[10px] bg-transparent transition-colors duration-[140ms] group-hover:bg-[var(--surface-raised)]"
              />
              <span className="relative z-10 block h-[52px] w-[52px] border border-[var(--border-rule)] bg-[var(--surface-card)] p-1.5 sm:h-[74px] sm:w-[74px] sm:p-2">
                <CategoryMark mark={row.mark} />
              </span>
              <span className="relative z-10 min-w-0">
                <span className="flex items-baseline justify-between gap-4 sm:block">
                  <h2 className="font-heading text-[1.75rem] leading-none tracking-tight text-[var(--text-primary)] transition-colors duration-[140ms] group-hover:text-[var(--action)] sm:text-[2rem]">
                    {row.label}
                  </h2>
                  <span className="sm:hidden">
                    <CountBlock value={row.count} noun={row.noun} compact />
                  </span>
                </span>
                <p
                  className="mt-2 max-w-[52ch] text-[16px] leading-relaxed text-[var(--text-body)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {row.descriptor}
                </p>
              </span>
              <span className="relative z-10 hidden sm:block">
                <CountBlock value={row.count} noun={row.noun} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
