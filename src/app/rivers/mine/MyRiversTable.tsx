"use client";
/**
 * The watchlist as a workbench surface — the reference adoption of
 * `WorkbenchTable`. Rows are 32px, zebra on Pool / Riverbed, and the keyboard
 * map is the shared one.
 *
 * Watch order is the one editable field: the column has always existed in
 * `user_favorite_sections` but had no UI. Hearted rivers with no pinned gauge
 * are synthesised rows (`favorite:<riverId>`) with no order to edit, and they
 * unwatch through /api/favorites instead.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import WorkbenchFilter from "@/components/workbench/WorkbenchFilter";
import WorkbenchKeyLegend from "@/components/workbench/WorkbenchKeyLegend";

export interface WatchedSection {
  id: string;
  river_slug: string;
  river_name: string;
  section_name: string | null;
  position: number;
}

const FAVORITE_PREFIX = "favorite:";

function isHeartedOnly(row: WatchedSection): boolean {
  return row.id.startsWith(FAVORITE_PREFIX);
}

async function unwatch(row: WatchedSection): Promise<void> {
  const res = isHeartedOnly(row)
    ? await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "river",
          entity_id: row.id.slice(FAVORITE_PREFIX.length),
        }),
      })
    : await fetch(`/api/dashboard/favorite-sections/${row.id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not unwatch");
}

export default function MyRiversTable({ sections }: { sections: WatchedSection[] }) {
  const router = useRouter();
  const filterRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  const q = query.trim().toLowerCase();
  const source = sections.filter((s) => !hiddenIds.has(s.id));
  const visible = q
    ? source.filter(
        (s) =>
          s.river_name.toLowerCase().includes(q) ||
          (s.section_name ?? "").toLowerCase().includes(q),
      )
    : source;

  return (
    <div className="mt-10">
      <WorkbenchFilter
        label="Filter your rivers"
        value={query}
        onChange={setQuery}
        inputRef={filterRef}
        className="mb-3"
      />

      <WorkbenchTable
        rows={visible}
        rowId={(s) => s.id}
        label="Your rivers"
        filterRef={filterRef}
        onActivate={(s) => router.push(`/rivers/${s.river_slug}`)}
        empty="No rivers match that filter."
        columns={[
          {
            key: "position",
            label: "Order",
            width: "72px",
            numeric: true,
            accessor: (s) => (isHeartedOnly(s) ? "—" : String(s.position)),
            editable: true,
            onCommit: async (row, value) => {
              if (isHeartedOnly(row)) throw new Error("Pin a gauge section to order it");
              const position = Number(value);
              if (!Number.isFinite(position)) throw new Error("Order must be a number");
              const res = await fetch(`/api/dashboard/favorite-sections/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position }),
              });
              if (!res.ok) throw new Error("Could not save the new order");
              router.refresh();
            },
          },
          { key: "river", label: "River", accessor: (s) => s.river_name },
          {
            key: "section",
            label: "Section",
            accessor: (s) => s.section_name ?? "—",
            width: "minmax(0, 0.8fr)",
          },
        ]}
        bulkActions={[
          {
            label: "Open",
            tone: "primary",
            onClick: (selected) => {
              if (selected[0]) router.push(`/rivers/${selected[0].river_slug}`);
            },
          },
          {
            label: "Unwatch",
            tone: "danger",
            onClick: async (selected) => {
              const ids = new Set(selected.map((s) => s.id));
              setHiddenIds((prev) => new Set([...prev, ...ids]));
              await Promise.all(selected.map((s) => unwatch(s).catch(() => null)));
              router.refresh();
            },
          },
        ]}
      />

      <WorkbenchKeyLegend />
    </div>
  );
}
