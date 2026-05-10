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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/data/DataTable";
import { totalOwned, isLowStock } from "@/types/fly-v2";
import type { VariantRow } from "@/types/fly-v2";
import type { FlyBoxV2 } from "@/lib/db/fly-v2";
import InlineNumberCell from "@/components/flies-v2/InlineNumberCell";
import VariantPhotoCell from "@/components/flies-v2/VariantPhotoCell";
import EditVariantModal from "@/components/flies-v2/EditVariantModal";
import { updateStockAction, addToBoxAction, deleteVariantsAction, updateBoxQuantityAction } from "@/app/flies/v2/actions";

interface Props {
  variants: VariantRow[];
  /** Pattern slug — needed by stock-update action for revalidation. */
  patternSlug: string;
  /** User's fly boxes. Empty array = signed out. */
  userBoxes: FlyBoxV2[];
  /** When set, shows a "Qty" column for per-box quantity tracking. */
  boxId?: string;
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

export default function VariantTable({ variants, patternSlug, userBoxes, boxId }: Props) {
  const router = useRouter();
  // Inline toast — the bulk-action server actions can't directly trigger UI,
  // and native alert() blocks the page (terrible on iOS, blocks Cypress/MCP
  // testing). A 2.5s auto-dismissing pill gives the user feedback without
  // freezing the page.
  const [toast, setToast] = useState<{ msg: string; tone: "info" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, tone: "info" | "error" = "info") => {
    setToast({ msg, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), tone === "error" ? 4500 : 2500);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // Edit modal — bulk action only opens when exactly one row is selected.
  const [editing, setEditing] = useState<VariantRow | null>(null);

  // Box-picker state — pending rows waiting for the user to choose a box.
  const [boxPicker, setBoxPicker] = useState<{ rows: VariantRow[] } | null>(null);

  const saveStock = (variantId: string, field: "tied_count" | "bought_count" | "target_count") =>
    (next: number) => updateStockAction({
      variant_id: variantId,
      pattern_slug: patternSlug,
      field,
      value: next,
    });

  const saveBoxQty = (variantId: string) =>
    (next: number) => updateBoxQuantityAction({
      box_id: boxId!,
      variant_id: variantId,
      quantity: next,
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
    ...(boxId ? [{
      key: "fly_name" as keyof VariantRow,
      label: "Fly",
      accessor: (row: VariantRow) => row.pattern?.name ?? row.display_name ?? "",
      render: (row: VariantRow) => {
        const name = row.pattern?.name ?? row.display_name ?? "Untitled";
        const slug = row.pattern?.slug;
        const href = slug ? `/flies/${slug}` : `/flies/by-id/${row.pattern_id}`;
        return (
          <Link
            href={href}
            className="text-[#F0F6FC] hover:text-[#E8923A] transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {name}
          </Link>
        );
      },
    }] : []),
    {
      key: "size",
      label: "Size",
      width: "70px",
      mono: true,
      align: "center",
      accessor: (row) => row.size,
      render: (row) => <span className="text-[#F0F6FC]">{row.size}</span>,
    },
    ...(boxId ? [{
      key: "box_qty" as keyof VariantRow,
      label: "In box",
      width: "72px",
      mono: true,
      align: "center" as const,
      accessor: (row: VariantRow) => row.box_quantity ?? 1,
      render: (row: VariantRow) => (
        <InlineNumberCell
          value={row.box_quantity ?? 1}
          onSave={saveBoxQty(row.id)}
          title="How many of this fly are in this box"
          align="center"
        />
      ),
    }] : []),
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
    ...(boxId ? [] : [{
      key: "rib",
      label: "Rib",
      accessor: (row: VariantRow) => row.rib_color ?? "",
      render: (row: VariantRow) => row.rib_color ? <span className="text-[#A8B2BD]">{row.rib_color}</span> : <span className="text-[#484F58]">—</span>,
    }]),
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
    <>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md px-4 py-2 text-sm font-medium shadow-lg ${
            toast.tone === "error"
              ? "bg-[#7F1D1D] text-white"
              : "bg-[#0BA5C7] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
      {editing && (
        <EditVariantModal
          variant={editing}
          patternSlug={patternSlug}
          open={true}
          onClose={() => setEditing(null)}
          onSaved={() => {
            showToast("Variant saved.");
            router.refresh();
          }}
        />
      )}
      {boxPicker && (
        <BoxPickerDialog
          boxes={userBoxes}
          variantCount={boxPicker.rows.length}
          onSelect={async (boxId) => {
            const rows = boxPicker.rows;
            setBoxPicker(null);
            const result = await addToBoxAction({
              pattern_slug: patternSlug,
              box_id: boxId,
              variant_ids: rows.map((r) => r.id),
            });
            if (!result.ok) {
              showToast(result.error ?? "Failed to add to box.", "error");
            } else if (result.added === 0) {
              showToast("Already in that box.");
              router.refresh();
            } else {
              const n = result.added ?? rows.length;
              showToast(`Added ${n} variant${n === 1 ? "" : "s"} to box.`);
              router.refresh();
            }
          }}
          onCancel={() => setBoxPicker(null)}
        />
      )}
    <DataTable<VariantRow>
      rows={variants}
      columns={columns}
      rowKey={(v) => v.id}
      density="compact"
      defaultSort={boxId ? { key: "fly_name", dir: "asc" } : { key: "size", dir: "asc" }}
      bulkActions={[
        {
          label: "Edit",
          variant: "default" as const,
          onClick: (rows: VariantRow[]) => {
            if (rows.length !== 1) {
              showToast("Select exactly one variant to edit.", "error");
              return;
            }
            setEditing(rows[0]);
          },
        },
        ...(userBoxes.length > 0
          ? [
              {
                label: "Add to my box",
                variant: "primary" as const,
                onClick: (rows: VariantRow[]) => {
                  setBoxPicker({ rows });
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
            // confirm() is acceptable here — destructive action, intentional block
            if (!window.confirm(msg)) return;
            const result = await deleteVariantsAction({
              pattern_slug: patternSlug,
              variant_ids: rows.map((r) => r.id),
            });
            if (!result.ok) {
              showToast(result.error ?? "Failed to delete.", "error");
            } else {
              const d = result.deleted ?? rows.length;
              showToast(`Deleted ${d} variant${d === 1 ? "" : "s"}.`);
              router.refresh();
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
    </>
  );
}

function BoxPickerDialog({
  boxes,
  variantCount,
  onSelect,
  onCancel,
}: {
  boxes: FlyBoxV2[];
  variantCount: number;
  onSelect: (boxId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#21262D]">
          <h2 className="text-[#F0F6FC] font-semibold text-sm">
            Add {variantCount === 1 ? "variant" : `${variantCount} variants`} to box
          </h2>
          <p className="text-[#6E7681] text-xs mt-0.5">Choose which box to add to</p>
        </div>
        <ul className="max-h-72 overflow-y-auto divide-y divide-[#21262D]">
          {boxes.map((box) => (
            <li key={box.id}>
              <button
                className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-[#21262D] transition-colors"
                onClick={() => onSelect(box.id)}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[#F0F6FC] text-sm truncate">{box.name}</span>
                  {box.description && (
                    <span className="block text-[#6E7681] text-xs truncate">{box.description}</span>
                  )}
                </span>
                <span className="text-[#484F58] text-xs font-['IBM_Plex_Mono'] shrink-0">
                  {box.tier}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-[#21262D]">
          <button
            className="w-full text-center text-sm text-[#6E7681] hover:text-[#A8B2BD] transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
