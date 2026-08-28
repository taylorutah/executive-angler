"use client";
/**
 * The gear locker as a workbench surface — the dense alternative to the
 * type cards.
 *
 * Name and maker edit in place. Delete is the locker's existing soft delete
 * (`is_active = false`), so a bulk delete is recoverable server-side.
 */
import { useRef, useState } from "react";
import { Star } from "@/icons";
import type { GearItem, GearType } from "@/types/gear";
import WorkbenchTable from "@/components/workbench/WorkbenchTable";
import WorkbenchFilter from "@/components/workbench/WorkbenchFilter";
import WorkbenchKeyLegend from "@/components/workbench/WorkbenchKeyLegend";

const TYPE_LABELS: Record<GearType, string> = {
  rod: "Rod",
  reel: "Reel",
  line: "Line",
  leader: "Leader",
  tippet: "Tippet",
  net: "Net",
  waders: "Waders",
  other: "Other",
};

/** Line weight — the one number rods and lines share. Null for everything else. */
function lineWeight(item: GearItem): number | null {
  const specs = (item.specs ?? {}) as { weight_wt?: unknown; weight?: unknown };
  const raw = specs.weight_wt ?? specs.weight;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function putGear(id: string, body: Record<string, unknown>): Promise<GearItem> {
  const res = await fetch(`/api/gear?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Could not save this item");
  }
  return (await res.json()) as GearItem;
}

interface Props {
  items: GearItem[];
  /** Apply a server-confirmed item back into the parent's state. */
  onItemSaved: (item: GearItem) => void;
  onEdit: (item: GearItem) => void;
  onToggleDefault: (item: GearItem) => void;
  onDeleteMany: (items: GearItem[]) => Promise<void>;
}

export default function GearLockerTable({
  items,
  onItemSaved,
  onEdit,
  onToggleDefault,
  onDeleteMany,
}: Props) {
  const filterRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter((i) =>
        `${i.name} ${i.maker ?? ""} ${i.model ?? ""} ${i.type}`.toLowerCase().includes(q),
      )
    : items;

  return (
    <div>
      <WorkbenchFilter
        label="Filter gear"
        value={query}
        onChange={setQuery}
        inputRef={filterRef}
        className="mb-3"
      />

      <WorkbenchTable
        rows={visible}
        rowId={(i) => i.id}
        label="Gear locker"
        filterRef={filterRef}
        onActivate={(i) => onEdit(i)}
        empty="No gear matches that filter."
        columns={[
          {
            key: "name",
            label: "Item",
            width: "minmax(0, 2fr)",
            accessor: (i) => i.name,
            editable: true,
            onCommit: async (item, value) => {
              const name = value.trim();
              if (!name) throw new Error("Gear needs a name");
              onItemSaved(await putGear(item.id, { name }));
            },
          },
          {
            key: "type",
            label: "Type",
            width: "92px",
            accessor: (i) => TYPE_LABELS[i.type] ?? i.type,
          },
          {
            key: "maker",
            label: "Maker",
            accessor: (i) => i.maker ?? "—",
            editable: true,
            onCommit: async (item, value) => {
              const maker = value.trim();
              onItemSaved(await putGear(item.id, { maker: maker && maker !== "—" ? maker : null }));
            },
          },
          { key: "model", label: "Model", accessor: (i) => i.model ?? "—" },
          {
            key: "weight",
            label: "Wt",
            width: "56px",
            numeric: true,
            accessor: (i) => {
              const wt = lineWeight(i);
              return wt == null ? "—" : String(wt);
            },
          },
          {
            key: "default",
            label: "Default",
            width: "72px",
            render: (i) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDefault(i);
                }}
                aria-label={
                  i.is_default
                    ? `${i.name} is the default ${i.type}`
                    : `Make ${i.name} the default ${i.type}`
                }
                aria-pressed={i.is_default}
                className="ea-focus-ring p-0.5"
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    i.is_default ? "fill-current text-[var(--accent)]" : "text-[var(--text-3)]"
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
