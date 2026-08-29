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
  line: string;
};

function formatCount(n: number): string {
  return n > 0 ? n.toLocaleString("en-US") : "—";
}

/**
 * Directory index band — four link cells in one ruled row (2x2 on small
 * screens), hairline dividers, no cards, no shadows. Count is the display
 * figure; name and one-line descriptor below. An editorial table of
 * contents, not a stats dashboard.
 */
export default function CategoryIndex({ rivers, flies, places, notes }: CategoryCounts) {
  const doors: Door[] = [
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

  return (
    <section data-lane="resource" className="bg-[var(--paper)] py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <p className="ea-overline">The reference</p>
        <ul className="mt-4 grid grid-cols-1 border-t border-l border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
          {doors.map((door) => (
            <li
              key={door.href}
              className="border-b border-r border-[var(--border)]"
            >
              <Link
                href={door.href}
                className="group block h-full p-4 transition-colors hover:bg-[var(--paper-deep)] sm:p-6"
              >
                <span className="ea-stat-value block">{formatCount(door.count)}</span>
                <h2 className="mt-2 font-display text-xl font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                  {door.label}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-2)]">{door.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
