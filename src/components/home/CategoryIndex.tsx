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
 * Four doors — card links with honest counts. Fraunces title + stat numeral +
 * one line. Three type sizes per card: 20 title, 30 count, 14 line.
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {doors.map((door) => (
            <Link
              key={door.href}
              href={door.href}
              className="group ea-card card-hover block"
            >
              <span className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)] transition-colors group-hover:text-[var(--accent)]">
                  {door.label}
                </h2>
                <span className="ea-stat-value">{formatCount(door.count)}</span>
              </span>
              <p className="mt-2 text-sm text-[var(--text-2)]">{door.line}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
