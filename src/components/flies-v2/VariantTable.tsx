"use client";
/**
 * VariantTable — wraps the generic DataTable for the Variant row shape.
 *
 * Used on the v2 Pattern detail page and (later) on Box detail. Columns:
 * Photo · Size · Bead · Body · Rib · Tied · Bought · Target · Boxes · Last used.
 *
 * Tied / Bought / Target cells are inline-editable via InlineNumberCell.
 * Edits go through the updateStockAction server action and revalidate the
 * page automatically.
 */
import { DataTable, DataTableColumn } from "@/components/data/DataTable";
import { totalOwned, isLowStock } from "@/types/fly-v2";
import type { VariantRow } from "@/types/fly-v2";
import InlineNumberCell from "@/components/flies-v2/InlineNumberCell";
import VariantPhotoCell from "@/components/flies-v2/VariantPhotoCell";
import { updateStockAction, addToBoxAction, deleteVariantsAction } from "@/app/flies/v2/actions";

interface Props {
  variants: VariantRow[];
  /** Pattern slug — needed by stock-update action for revalidation. */
  patternSlug: string;
  /** User's default fly_box id (used by "Add to Kill Box" bulk action). null = signed out. */
  defaultBoxId: string | null;
}

function formatBead(row: VariantRow): string {
  if (!row.bead_material || row.bead_material === "none") return "—";
  const parts: string[] = [row.bead_material];
  if (row.bead_weight_mm) parts.push(`${row.bead_weight_mm}mm`);
  if (row.bead_color) parts.push(row.bead_color);
  return parts.join(" · ");
}

function formatLastUsed(row: VariantRow): string {
  const ts = row.stock?.last_used_at;
  if (!ts) return "—";
  const date = new Date(ts);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function VariantTable({ variants, patternSlug, defaultBoxId }: Props) {
  const saveStock = (variantId: string, field: "tied_count" | "bought_count" | "target_count") =>
    (next: number) => updateStockAction({
      variant_id: variantId,
      pattern_slug: patternSlug,
      field,
      value: next,
    });
  const columns: DataTableColumn<VariantRow>[] = [
    {
      key: "photo",
      label: "",
      width: "48px",
      sortable: false,
      render: (row) => (
        <VariantPhotoCell
          variantId={row.id}
          patternSlug={patternSlug}
          storagePath={row.primary_photo?.storage_path ?? null}
        />
      ),
    },
    {
      key: "size",
      label: "Size",
      width: "70px",
      mono: true,
      align: "center",
      accessor: (row) => row.size,
      render: (row) => <span className="text-[#F0F6FC]">{row.size}</span>,
    },
    {
      key: "bead",
      label: "Bead",
      width: "200px",
      accessor: (row) => row.bead_material ?? "",
      render: (row) => <span className="text-[#A8B2BD]">{formatBead(row)}</span>,
    },
    {
      key: "body",
      label: "Body",
      accessor: (row) => row.body_color ?? "",
      render: (row) => row.body_color ? <span className="text-[#A8B2BD]">{row.body_color}</span> : <span className="text-[#484F58]">—</span>,
    },
    {
      key: "rib",
      label: "Rib",
      accessor: (row) => row.rib_color ?? "",
      render: (row) => row.rib_color ? <span className="text-[#A8B2BD]">{row.rib_color}</span> : <span className="text-[#484F58]">—</span>,
    },
    {
      key: "tied",
      label: "Tied",
      width: "70px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.tied_count ?? 0,
      render: (row) => (
        <InlineNumberCell
          value={row.stock?.tied_count ?? 0}
          onSave={saveStock(row.id, "tied_count")}
          title="Tied flies in inventory"
        />
      ),
    },
    {
      key: "bought",
      label: "Bought",
      width: "70px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.bought_count ?? 0,
      render: (row) => (
        <InlineNumberCell
          value={row.stock?.bought_count ?? 0}
          onSave={saveStock(row.id, "bought_count")}
          title="Purchased flies in inventory"
        />
      ),
    },
    {
      key: "target",
      label: "Target",
      width: "90px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.target_count ?? 0,
      render: (row) => {
        const n = row.stock?.target_count ?? 0;
        const owned = totalOwned(row.stock);
        const low = isLowStock(row.stock);
        return (
          <div className="flex items-center justify-end gap-1 w-full">
            <span className={`font-['IBM_Plex_Mono'] text-[13px] ${low ? "text-[#E8923A]" : owned > 0 ? "text-[#F0F6FC]" : "text-[#484F58]"}`}>
              {owned}/
            </span>
            <InlineNumberCell
              value={n}
              onSave={saveStock(row.id, "target_count")}
              title="Target tied count (deficit lights up amber when below)"
            />
          </div>
        );
      },
    },
    {
      key: "boxes",
      label: "Boxes",
      width: "60px",
      mono: true,
      align: "right",
      accessor: (row) => row.box_count,
      render: (row) =>
        row.box_count > 0 ? (
          <span className="text-[#0BA5C7]">{row.box_count}</span>
        ) : (
          <span className="text-[#484F58]">0</span>
        ),
    },
    {
      key: "last_used",
      label: "Last used",
      width: "100px",
      mono: true,
      accessor: (row) => row.stock?.last_used_at ?? "",
      render: (row) => (
        <span className="text-[#6E7681] text-[12px]">{formatLastUsed(row)}</span>
      ),
    },
  ];

  return (
    <DataTable<VariantRow>
      rows={variants}
      columns={columns}
      rowKey={(v) => v.id}
      density="compact"
      defaultSort={{ key: "size", dir: "asc" }}
      bulkActions={[
        ...(defaultBoxId
          ? [
              {
                label: "Add to my box",
                variant: "primary" as const,
                onClick: async (rows: VariantRow[]) => {
                  const result = await addToBoxAction({
                    pattern_slug: patternSlug,
                    box_id: defaultBoxId,
                    variant_ids: rows.map((r) => r.id),
                  });
                  if (!result.ok) {
                    alert(result.error ?? "Failed to add to box.");
                  } else if (result.added === 0) {
                    alert("Already in your default box.");
                  } else {
                    const n = result.added ?? rows.length;
                    alert(`Added ${n} variant${n === 1 ? "" : "s"} to your default box.`);
                  }
                },
              },
            ]
          : []),
        {
          label: "Delete",
          variant: "danger" as const,
          onClick: async (rows: VariantRow[]) => {
            const n = rows.length;
            const msg = `Delete ${n} variant${n === 1 ? "" : "s"}? Catches that referenced ${n === 1 ? "it" : "them"} will keep their history, but ${n === 1 ? "it" : "they"} will be hidden from this table.`;
            if (!confirm(msg)) return;
            const result = await deleteVariantsAction({
              pattern_slug: patternSlug,
              variant_ids: rows.map((r) => r.id),
            });
            if (!result.ok) {
              alert(result.error ?? "Failed to delete.");
            }
          },
        },
      ]}
      empty={
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#A8B2BD]">No variants yet.</p>
          <p className="text-xs text-[#6E7681]">
            Click <span className="text-[#E8923A]">+ New Variant</span> to add your first spec.
          </p>
        </div>
      }
    />
  );
}
