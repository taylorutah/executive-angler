"use client";
/**
 * Fly boxes as a workbench surface — the dense alternative to the tier grid.
 *
 * Name and capacity edit in place. Tier stays in the grid's editor because it
 * is a constrained choice, not free text.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import type { BoxStats, FlyBoxV2 } from "@/lib/db/fly-v2";
import type { TierDefinition } from "@/lib/flies/tier-definitions";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import WorkbenchFilter from "@/components/workbench/WorkbenchFilter";
import WorkbenchKeyLegend from "@/components/workbench/WorkbenchKeyLegend";

interface Props {
  boxes: FlyBoxV2[];
  stats: Record<string, BoxStats>;
  tiers: TierDefinition[];
  /** Apply a server-confirmed box back into the parent's state. */
  onBoxSaved: (box: FlyBoxV2) => void;
  onDeleteMany: (boxes: FlyBoxV2[]) => Promise<void>;
  onSetDefault: (box: FlyBoxV2) => void;
}

async function patchBox(id: string, body: Record<string, unknown>): Promise<FlyBoxV2> {
  const res = await fetch(`/api/fly-boxes?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Could not save this box");
  return json.box as FlyBoxV2;
}

export default function BoxesTable({
  boxes,
  stats,
  tiers,
  onBoxSaved,
  onDeleteMany,
  onSetDefault,
}: Props) {
  const router = useRouter();
  const filterRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const tierLabel = (key: string) => tiers.find((t) => t.key === key)?.label ?? key;
  const q = query.trim().toLowerCase();
  const visible = q
    ? boxes.filter((b) => `${b.name} ${tierLabel(b.tier)}`.toLowerCase().includes(q))
    : boxes;

  return (
    <div>
      <WorkbenchFilter
        label="Filter boxes"
        value={query}
        onChange={setQuery}
        inputRef={filterRef}
        className="mb-3"
      />

      <WorkbenchTable
        rows={visible}
        rowId={(b) => b.id}
        label="Fly boxes"
        filterRef={filterRef}
        onActivate={(b) => router.push(`/flies/boxes/${b.id}`)}
        empty="No boxes match that filter."
        columns={[
          {
            key: "name",
            label: "Box",
            width: "minmax(0, 2fr)",
            accessor: (b) => b.name,
            editable: true,
            onCommit: async (box, value) => {
              const name = value.trim();
              if (!name) throw new Error("A box needs a name");
              onBoxSaved(await patchBox(box.id, { name }));
              router.refresh();
            },
          },
          { key: "tier", label: "Tier", width: "130px", accessor: (b) => tierLabel(b.tier) },
          {
            key: "flies",
            label: "Flies",
            width: "64px",
            numeric: true,
            accessor: (b) => stats[b.id]?.total ?? 0,
          },
          {
            key: "capacity",
            label: "Capacity",
            width: "84px",
            numeric: true,
            accessor: (b) => (b.total_capacity == null ? "—" : String(b.total_capacity)),
            editable: true,
            onCommit: async (box, value) => {
              const raw = value.trim();
              if (raw && !Number.isFinite(Number(raw))) throw new Error("Capacity must be a number");
              onBoxSaved(
                await patchBox(box.id, { total_capacity: raw === "" || raw === "—" ? null : raw }),
              );
              router.refresh();
            },
          },
          {
            key: "default",
            label: "Default",
            width: "72px",
            render: (b) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(b);
                }}
                aria-label={
                  b.is_default ? `${b.name} is the default box` : `Make ${b.name} the default box`
                }
                aria-pressed={b.is_default}
                className="ea-focus-ring p-0.5"
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    b.is_default ? "fill-current text-[var(--action)]" : "text-[var(--text-meta)]"
                  }`}
                />
              </button>
            ),
          },
        ]}
        bulkActions={[
          {
            label: "Delete",
            tone: "danger",
            onClick: (selected) => onDeleteMany(selected),
          },
        ]}
      />

      <WorkbenchKeyLegend />
    </div>
  );
}
