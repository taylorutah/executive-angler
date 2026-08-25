"use client";
/**
 * The watchlist as a workbench surface — the reference adoption of
 * `WorkbenchTable`. Rows are 32px, zebra on Pool / Riverbed, the section
 * column is numeric-free text and the keyboard map is the shared one.
 *
 * Unwatching is the only bulk action a watchlist needs.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import { WORKBENCH_KEYMAP } from "@/lib/workbench/keymap";

export interface WatchedSection {
  id: string;
  river_slug: string;
  river_name: string;
  section_name: string | null;
}

export default function MyRiversTable({ sections }: { sections: WatchedSection[] }) {
  const router = useRouter();
  const filterRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = q
    ? sections.filter(
        (s) =>
          s.river_name.toLowerCase().includes(q) ||
          (s.section_name ?? "").toLowerCase().includes(q),
      )
    : sections;

  return (
    <div className="mt-10">
      <label className="sr-only" htmlFor="watchlist-filter">
        Filter your rivers
      </label>
      <input
        id="watchlist-filter"
        ref={filterRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter — press /"
        className="mb-3 w-full max-w-xs border border-[var(--border-rule)] bg-[var(--surface-raised)] px-2 py-1.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus-visible:outline-2 focus-visible:outline-[var(--signal-live)] focus-visible:outline-offset-[3px]"
      />

      <WorkbenchTable
        rows={rows}
        rowId={(s) => s.id}
        label="Your rivers"
        filterRef={filterRef}
        onActivate={(s) => router.push(`/rivers/${s.river_slug}`)}
        empty="No rivers match that filter."
        columns={[
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
        ]}
      />

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-meta)]">
        {WORKBENCH_KEYMAP.map((k) => (
          <span key={k.action}>
            <span className="num text-[var(--text-body)]">{k.keys.join(" ")}</span> {k.label}
          </span>
        ))}
      </p>
    </div>
  );
}
