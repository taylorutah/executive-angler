import Link from "next/link";
import type { CardData } from "@/types/list-config";
import DeskPhotoCard from "./DeskPhotoCard";

const COLUMNS: { key: string; label: string }[] = [
  { key: "nymph", label: "Nymphs" },
  { key: "dry", label: "Dries" },
  { key: "streamer", label: "Streamers" },
];

function categoryKey(item: CardData): string {
  const raw = String(
    (item as CardData & { _filterValues?: Record<string, string | number> })._filterValues
      ?.category ?? "",
  ).toLowerCase();
  if (raw === "emerger" || raw === "midge" || raw === "egg") return "nymph";
  if (raw === "terrestrial" || raw === "wet") return "dry";
  if (raw === "nymph" || raw === "dry" || raw === "streamer") return raw;
  return raw || "other";
}

function benchColumns(rest: CardData[]): { key: string; label: string }[] {
  const known = new Set(COLUMNS.map((c) => c.key));
  const extra = new Map<string, string>();
  for (const item of rest) {
    const key = categoryKey(item);
    if (known.has(key) || extra.has(key)) continue;
    extra.set(key, key === "other" ? "Other" : key.replace(/^\w/, (c) => c.toUpperCase()));
  }
  return [...COLUMNS, ...[...extra].map(([key, label]) => ({ key, label }))];
}

/** Flies Index 81:17 — plate of twelve, then the rest of the bench. */
export default function DeskFlyIndex({ items }: { items: CardData[] }) {
  if (items.length === 0) return null;

  const plate = items.slice(0, 12);
  const rest = items.slice(12);

  return (
    <div>
      <h2
        className="mb-5 font-heading text-[28px] font-semibold text-[var(--text-primary)]"
        style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
      >
        On the water this week
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {plate.map((item) => (
          <li key={item.href}>
            <DeskPhotoCard
              href={item.href}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
              title={item.title}
              meta={item.meta}
            />
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <div className="mt-12">
          <h2
            className="font-heading text-[28px] font-semibold text-[var(--text-primary)]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            The rest of the bench
          </h2>
          <p className="prose mt-2 max-w-[640px] text-[16px] text-[var(--text-body)]">
            Patterns we actually keep. Sizes we fish. Not a catalog dump.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benchColumns(rest).map((col) => {
              const rows = rest.filter((item) => categoryKey(item) === col.key);
              if (rows.length === 0) return null;
              return (
                <div key={col.key}>
                  <p className="mb-3 font-ui text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-meta)]">
                    {col.label}
                  </p>
                  <ul className="space-y-2">
                    {rows.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="ea-focus-ring group flex items-baseline justify-between gap-3"
                        >
                          <span className="font-ui text-[14px] text-[var(--text-primary)] group-hover:text-[var(--action)]">
                            {item.title}
                          </span>
                          {item.meta ? (
                            <span className="shrink-0 font-ui text-[12px] text-[var(--text-meta)]">
                              {item.meta}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
