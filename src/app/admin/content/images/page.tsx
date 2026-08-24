import type { Metadata } from "next";
import { listImageGaps, type ImageGap } from "@/lib/db/image-gaps";

export const metadata: Metadata = {
  title: "Image gaps — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ENTITY_ORDER = [
  "fly_shops",
  "guides",
  "canonical_flies",
  "destinations",
  "rivers",
  "articles",
  "lodges",
  "species",
];

function groupByEntity(gaps: ImageGap[]): Map<string, ImageGap[]> {
  const map = new Map<string, ImageGap[]>();
  for (const g of gaps) {
    const list = map.get(g.entity) ?? [];
    list.push(g);
    map.set(g.entity, list);
  }
  return map;
}

export default async function AdminImageGapsPage() {
  const gaps = await listImageGaps();
  const grouped = groupByEntity(gaps);
  const entities = [
    ...ENTITY_ORDER.filter((e) => grouped.has(e)),
    ...[...grouped.keys()].filter((e) => !ENTITY_ORDER.includes(e)),
  ];

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-rule)] px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Image gaps</h1>
        <p className="mt-1 text-sm text-[var(--text-body)] max-w-2xl">
          Null heroes and Unsplash URLs, grouped by entity. Rehost is listed
          but disabled until Taylor confirms the write path (EXIF including GPS
          must be stripped on ingest). Rivers are expected to be empty.
        </p>
      </header>

      <div className="px-6 py-8 space-y-10 max-w-5xl">
        {entities.map((entity) => {
          const rows = grouped.get(entity) ?? [];
          const nulls = rows.filter((r) => r.kind === "null").length;
          const unsplash = rows.filter((r) => r.kind === "unsplash").length;
          return (
            <section key={entity}>
              <div className="flex items-end justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">{entity}</h2>
                  <p className="text-xs text-[var(--text-meta)]">
                    {nulls} null · {unsplash} Unsplash · {rows.length} total
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Rehost is read-only until confirmed. Ingest must strip EXIF including GPS."
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--border-rule)] text-[var(--text-meta)] cursor-not-allowed"
                >
                  Rehost Unsplash to Supabase
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[var(--border-rule)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--surface-raised)] text-left text-[10px] uppercase tracking-wider text-[var(--text-meta)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Slug</th>
                      <th className="px-3 py-2 font-medium">Kind</th>
                      <th className="px-3 py-2 font-medium">Column</th>
                      <th className="px-3 py-2 font-medium">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={`${r.entity}-${r.id}-${r.column}-${r.kind}`}
                        className="border-t border-[var(--border-rule)]"
                      >
                        <td className="px-3 py-2 text-[var(--text-primary)]">{r.name}</td>
                        <td className="px-3 py-2 font-mono text-xs text-[var(--text-body)]">
                          {r.slug}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              r.kind === "null"
                                ? "text-[var(--state-negative)]"
                                : "text-[var(--action)]"
                            }
                          >
                            {r.kind}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-[var(--text-meta)]">
                          {r.column}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-[var(--text-meta)] max-w-[280px] truncate">
                          {r.url || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
