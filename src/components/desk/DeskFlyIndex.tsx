import Link from "next/link";
import type { CardData } from "@/types/list-config";
import DeskPhotoCard from "./DeskPhotoCard";

const COLUMNS: { key: string; label: string }[] = [
  { key: "nymph", label: "Nymphs" },
  { key: "dry", label: "Dries" },
  { key: "streamer", label: "Streamers" },
];

/** Catalog slugs that must sit on the plate when the row is in `items`. */
export const PLATE_PIN_HREFS = ["/flies/soft-hackle-carrot"] as const;

export function arrangeFlyIndex(items: CardData[]): {
  plate: CardData[];
  rest: CardData[];
} {
  const pinned: CardData[] = [];
  const used = new Set<string>();
  for (const href of PLATE_PIN_HREFS) {
    const hit = items.find((item) => item.href === href);
    if (!hit || used.has(hit.href)) continue;
    pinned.push(hit);
    used.add(hit.href);
  }
  const remainder = items.filter((item) => !used.has(item.href));
  const plate = [...pinned, ...remainder].slice(0, 12);
  const onPlate = new Set(plate.map((item) => item.href));
  return { plate, rest: items.filter((item) => !onPlate.has(item.href)) };
}

function categoryKey(item: CardData): string {
  const raw = String(item._filterValues?.category ?? "").toLowerCase();
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

/** Plate of twelve specimens, then the rest of the bench in scan-dense columns. */
export default function DeskFlyIndex({ items }: { items: CardData[] }) {
  if (items.length === 0) return null;

  const { plate, rest } = arrangeFlyIndex(items);

  return (
    <div>
      <h2 className="mb-5 text-[var(--text-1)]">On the plate</h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {plate.map((item) => (
          <li key={item.href}>
            <DeskPhotoCard
              href={item.href}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
              title={item.title}
              meta={item.meta}
              density="plate"
            />
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-[var(--text-1)]">The rest of the bench</h2>
          <p className="prose mt-2">
            Patterns we keep, with the sizes on file. Not a catalog dump.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benchColumns(rest).map((col) => {
              const rows = rest.filter((item) => categoryKey(item) === col.key);
              if (rows.length === 0) return null;
              return (
                <div key={col.key}>
                  <p className="ea-overline mb-3">{col.label}</p>
                  <ul className="space-y-2">
                    {rows.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="card-hover ea-focus-ring group flex items-baseline justify-between gap-3"
                        >
                          <span className="text-[14px] text-[var(--text-1)] group-hover:text-[var(--accent)]">
                            {item.title}
                          </span>
                          {item.meta ? (
                            <span className="num shrink-0 text-[12px] text-[var(--text-3)]">
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
