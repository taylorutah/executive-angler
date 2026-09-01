import Link from "next/link";

export type CategoryCounts = {
  rivers: number;
  flies: number;
  places: number;
  notes: number;
};

type Line = {
  label: string;
  href: string;
  count: number;
  line: string;
};

class ReferenceIndex {
  static figure(n: number): string {
    return n > 0 ? n.toLocaleString("en-US") : "—";
  }

  static lines({ rivers, flies, places, notes }: CategoryCounts): Line[] {
    return [
      {
        label: "Rivers",
        href: "/rivers",
        count: rivers,
        line: "Flow, hatches, access, and the regulations that actually apply.",
      },
      {
        label: "Flies",
        href: "/flies/library",
        count: flies,
        line: "The recipe, the sizes, and what each one is imitating.",
      },
      {
        label: "Places",
        href: "/destinations",
        count: places,
        line: "Where to go, and the rivers that make the flight worth it.",
      },
      {
        label: "Field Notes",
        href: "/articles",
        count: notes,
        line: "Reading water, gear that earns its place, and technique.",
      },
    ];
  }
}

/**
 * Water-desk table of contents. Destinations lead; the count is folio
 * intel; one copper verb says go. Not four doors, not a stat grid.
 */
export default function CategoryIndex(counts: CategoryCounts) {
  return (
    <section data-lane="resource" className="bg-[var(--paper)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <p className="ea-overline">The reference</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--text-1)] sm:text-4xl">
          Open a line.
        </h2>

        <ol className="mt-8 border-t border-[var(--border)]">
          {ReferenceIndex.lines(counts).map((entry) => (
            <li key={entry.href} className="border-b border-[var(--border)]">
              <Link
                href={entry.href}
                className="group relative flex min-h-11 flex-col gap-2 py-4 pl-4 pr-1 transition-colors before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-transparent before:transition-colors hover:bg-[var(--vellum)] hover:before:bg-[var(--action)] focus-visible:bg-[var(--vellum)] focus-visible:before:bg-[var(--action)] sm:py-6 sm:pl-6"
              >
                <span className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold leading-tight text-[var(--text-1)] transition-colors group-hover:text-[var(--action)] group-focus-visible:text-[var(--action)] sm:text-3xl">
                    {entry.label}
                  </h3>
                  <span className="shrink-0 font-ui text-[14px] font-medium text-[var(--action)] underline decoration-[var(--action)] underline-offset-4">
                    Open <span aria-hidden>&rarr;</span>
                  </span>
                </span>
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm leading-relaxed text-[var(--text-2)]">
                  <span className="num text-[var(--text-3)]">
                    {ReferenceIndex.figure(entry.count)}
                  </span>
                  <span>{entry.line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
