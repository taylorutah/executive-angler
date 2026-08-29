import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

type BrandPermission = {
  brand: string;
  asset: string;
  entity: string;
  route: string;
  status: string;
  flagged_for_taylor: boolean;
};

function loadBrandPermissions(): BrandPermission[] {
  const raw = readFileSync(
    join(process.cwd(), "scripts/tier3-image-permissions.json"),
    "utf8",
  );
  return JSON.parse(raw) as BrandPermission[];
}

export default async function AdminImageGapsPage() {
  const gaps = await listImageGaps();
  const grouped = groupByEntity(gaps);
  const entities = [
    ...ENTITY_ORDER.filter((e) => grouped.has(e)),
    ...[...grouped.keys()].filter((e) => !ENTITY_ORDER.includes(e)),
  ];
  const permissions = loadBrandPermissions();
  const flagged = permissions.filter((p) => p.flagged_for_taylor).length;

  return (
    <div className="min-h-screen text-[var(--text-1)]">
      <header className="border-b border-[var(--border)] px-6 py-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Image gaps</h1>
        <p className="mt-1 text-sm text-[var(--text-2)] max-w-2xl">
          We host every image. Unsplash ingest strips EXIF including GPS.
          Gear-brand and lodge shots are not bulk-downloaded — they sit in the
          permissions table until Taylor picks a route. Rehost stays disabled
          until a service-role ingest has proven the EXIF strip.
        </p>
      </header>

      <section className="px-6 pt-8 max-w-5xl">
        <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">Tier 3 — ask, don’t copy</h2>
        <p className="text-xs text-[var(--text-3)] mb-3">
          {flagged} unresolved items flagged for Taylor. Removing a hotlink
          does not remove the copyright.
        </p>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] mb-10">
          <table className="ea-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Entity</th>
                <th>Route</th>
                <th>Status</th>
                <th>Asset</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.asset}>
                  <td className="text-[var(--text-1)]">{p.brand}</td>
                  <td className="num text-xs text-[var(--text-2)]">{p.entity}</td>
                  <td className="text-[var(--text-2)]">{p.route}</td>
                  <td className="text-[var(--danger)]">{p.status}</td>
                  <td className="num text-xs text-[var(--text-3)] max-w-[280px] truncate">
                    {p.asset}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="px-6 py-8 space-y-10 max-w-5xl">
        {entities.map((entity) => {
          const rows = grouped.get(entity) ?? [];
          const nulls = rows.filter((r) => r.kind === "null").length;
          const unsplash = rows.filter((r) => r.kind === "unsplash").length;
          return (
            <section key={entity}>
              <div className="flex items-end justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">{entity}</h2>
                  <p className="text-xs text-[var(--text-3)] num">
                    {nulls} null · {unsplash} Unsplash · {rows.length} total
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Rehost is read-only until confirmed. Ingest must strip EXIF including GPS."
                  className="ea-btn ea-btn-secondary ea-btn-sm"
                >
                  Rehost Unsplash to Supabase
                </button>
              </div>
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                <table className="ea-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Kind</th>
                      <th>Column</th>
                      <th>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={`${r.entity}-${r.id}-${r.column}-${r.kind}`}>
                        <td className="text-[var(--text-1)]">{r.name}</td>
                        <td className="num text-xs text-[var(--text-2)]">
                          {r.slug}
                        </td>
                        <td>
                          <span
                            className={
                              r.kind === "null"
                                ? "text-[var(--danger)]"
                                : "text-[var(--accent)]"
                            }
                          >
                            {r.kind}
                          </span>
                        </td>
                        <td className="num text-xs text-[var(--text-3)]">
                          {r.column}
                        </td>
                        <td className="num text-xs text-[var(--text-3)] max-w-[280px] truncate">
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
