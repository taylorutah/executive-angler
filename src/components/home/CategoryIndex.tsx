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
};

class ReferenceIndex {
  static figure(n: number): string {
    return n > 0 ? n.toLocaleString("en-US") : "—";
  }

  static lines({ rivers, flies, places, notes }: CategoryCounts): Line[] {
    return [
      { label: "Rivers", href: "/rivers", count: rivers },
      { label: "Flies", href: "/flies", count: flies },
      { label: "Places", href: "/destinations", count: places },
      { label: "Field Notes", href: "/articles", count: notes },
    ];
  }
}

/** Hanging index. Live counts as type — not four doors, not a stat grid. */
export default function CategoryIndex(counts: CategoryCounts) {
  return (
    <section data-lane="resource" className="border-b border-[var(--border)] bg-[var(--paper)]">
      <div className="house-measure mx-auto max-w-[var(--container)] px-4 py-8 sm:px-6">
        <ol className="flex flex-wrap gap-x-8 gap-y-2">
          {ReferenceIndex.lines(counts).map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="group inline-flex items-baseline gap-2 font-ui text-[13px] uppercase tracking-[0.12em] text-[var(--ink)]"
              >
                <span className="num text-[15px]">{ReferenceIndex.figure(entry.count)}</span>
                <span className="text-[var(--text-3)] group-hover:text-[var(--ink)]">
                  {entry.label}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
