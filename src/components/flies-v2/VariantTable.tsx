"use client";
/**
 * VariantTable — wraps the generic DataTable for the Variant row shape.
 *
 * Used on the v2 Pattern detail page and (later) on Box detail. Columns:
 * Photo · Size · Bead · Body · Rib · Tied · Bought · Target · Boxes · Last used.
 *
 * Inline editing for tied/bought/target lands in a follow-on commit — for now
 * the table is read-only display, with bulk-action hooks ready (Add to Box,
 * Tie Next, etc.).
 */
import Image from "next/image";
import { DataTable, DataTableColumn } from "@/components/data/DataTable";
import { totalOwned, deficit, isLowStock } from "@/types/fly-v2";
import type { VariantRow } from "@/types/fly-v2";

interface Props {
  variants: VariantRow[];
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qlasxtfbodyxbcuchvxz.supabase.co";

function variantPhotoUrl(row: VariantRow): string | null {
  if (!row.primary_photo) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/variant-photos/${row.primary_photo.storage_path}`;
}

function formatBead(row: VariantRow): string {
  if (!row.bead_material || row.bead_material === "none") return "—";
  const parts = [row.bead_material];
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

export default function VariantTable({ variants }: Props) {
  const columns: DataTableColumn<VariantRow>[] = [
    {
      key: "photo",
      label: "",
      width: "48px",
      sortable: false,
      render: (row) => {
        const url = variantPhotoUrl(row);
        if (url) {
          return (
            <div className="relative h-8 w-8 overflow-hidden rounded bg-[#161B22]">
              <Image src={url} alt="" fill sizes="32px" className="object-cover" />
            </div>
          );
        }
        return (
          <div className="h-8 w-8 rounded bg-[#161B22] flex items-center justify-center text-[10px] text-[#484F58]">
            +
          </div>
        );
      },
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
      width: "60px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.tied_count ?? 0,
      render: (row) => {
        const n = row.stock?.tied_count ?? 0;
        return n > 0 ? <span className="text-[#F0F6FC]">{n}</span> : <span className="text-[#484F58]">0</span>;
      },
    },
    {
      key: "bought",
      label: "Bought",
      width: "60px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.bought_count ?? 0,
      render: (row) => {
        const n = row.stock?.bought_count ?? 0;
        return n > 0 ? <span className="text-[#F0F6FC]">{n}</span> : <span className="text-[#484F58]">0</span>;
      },
    },
    {
      key: "target",
      label: "Target",
      width: "60px",
      mono: true,
      align: "right",
      accessor: (row) => row.stock?.target_count ?? 0,
      render: (row) => {
        const n = row.stock?.target_count ?? 0;
        const low = isLowStock(row.stock);
        return n > 0 ? (
          <span className={low ? "text-[#E8923A] font-medium" : "text-[#F0F6FC]"}>
            {totalOwned(row.stock)}/{n}
          </span>
        ) : (
          <span className="text-[#484F58]">—</span>
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
        {
          label: "Add to Kill Box",
          variant: "primary",
          onClick: (rows) => {
            console.log("[VariantTable] add to kill box (TODO):", rows.length);
          },
        },
        {
          label: "Mark to tie",
          onClick: (rows) => {
            console.log("[VariantTable] mark to tie (TODO):", rows.length);
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
