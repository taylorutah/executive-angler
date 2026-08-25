"use client";
/**
 * Journal sessions as a workbench surface.
 *
 * The feed stays the default view; this is the dense alternative for scanning
 * or tidying a long log. Session titles edit in place.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FishingSession } from "@/types/fishing-log";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import WorkbenchFilter from "@/components/workbench/WorkbenchFilter";
import WorkbenchKeyLegend from "@/components/workbench/WorkbenchKeyLegend";

interface Props {
  sessions: FishingSession[];
  /** Logged catch counts keyed by session id. */
  fishBySession: Record<string, number>;
}

function sessionTitle(s: FishingSession): string {
  return s.title?.trim() || s.river_name || "Untitled session";
}

export function JournalTable({ sessions, fishBySession }: Props) {
  const router = useRouter();
  const filterRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(sessions);

  const q = query.trim().toLowerCase();
  const visible = q
    ? rows.filter((s) =>
        `${sessionTitle(s)} ${s.river_name ?? ""} ${s.date}`.toLowerCase().includes(q),
      )
    : rows;

  return (
    <div>
      <WorkbenchFilter
        label="Filter sessions"
        value={query}
        onChange={setQuery}
        inputRef={filterRef}
        className="mb-3"
      />

      <WorkbenchTable
        rows={visible}
        rowId={(s) => s.id}
        label="Fishing sessions"
        filterRef={filterRef}
        onActivate={(s) => router.push(`/journal/${s.id}`)}
        empty="No sessions match that filter."
        columns={[
          { key: "date", label: "Date", width: "104px", numeric: true, accessor: (s) => s.date },
          {
            key: "title",
            label: "Session",
            width: "minmax(0, 2fr)",
            accessor: sessionTitle,
            editable: true,
            onCommit: async (session, value) => {
              const title = value.trim();
              if (!title) throw new Error("A session needs a name");
              const res = await fetch(`/api/fishing/session?id=${session.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
              });
              if (!res.ok) throw new Error("Could not rename this session");
              router.refresh();
            },
          },
          { key: "river", label: "River", accessor: (s) => s.river_name || "—" },
          {
            key: "fish",
            label: "Fish",
            width: "64px",
            numeric: true,
            accessor: (s) => fishBySession[s.id] ?? s.total_fish ?? 0,
          },
          {
            key: "temp",
            label: "Water °F",
            width: "80px",
            numeric: true,
            accessor: (s) => (s.water_temp_f == null ? "—" : String(s.water_temp_f)),
          },
        ]}
        bulkActions={[
          {
            label: "Delete",
            tone: "danger",
            onClick: async (selected) => {
              const ids = new Set(selected.map((s) => s.id));
              setRows((prev) => prev.filter((s) => !ids.has(s.id)));
              await Promise.all(
                selected.map((s) =>
                  fetch(`/api/fishing/session?id=${s.id}`, { method: "DELETE" }).catch(() => null),
                ),
              );
              router.refresh();
            },
          },
        ]}
      />

      <WorkbenchKeyLegend />
    </div>
  );
}
