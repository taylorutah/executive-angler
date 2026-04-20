"use client";

import { ArrowRight } from "lucide-react";

type RecipeLike = {
  name?: string | null;
  type?: string | null;
  size?: string | null;
  hook?: string | null;
  bead_size?: string | null;
  bead_color?: string | null;
  bead_material?: string | null;
  bead_size_mm?: number | string | null;
  fly_color?: string | null;
  body_color?: string | null;
  body_material?: string | null;
  tail_color?: string | null;
  thorax_color?: string | null;
  collar_color?: string | null;
  rib_material?: string | null;
  wing_material?: string | null;
  materials?: string | null;
  description?: string | null;
  video_url?: string | null;
  tags?: string[] | null;
};

interface Props {
  parent: RecipeLike;
  child: RecipeLike;
  /** Optional labels for the two sides. Defaults: "Parent" / "Variant". */
  parentLabel?: string;
  childLabel?: string;
  /** When true, render as an inline compact row list instead of side-by-side. */
  compact?: boolean;
}

const FIELD_LABELS: { key: keyof RecipeLike; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "size", label: "Size" },
  { key: "hook", label: "Hook" },
  { key: "bead_material", label: "Bead material" },
  { key: "bead_size_mm", label: "Bead (mm)" },
  { key: "bead_size", label: "Bead size" },
  { key: "bead_color", label: "Bead color" },
  { key: "fly_color", label: "Fly color" },
  { key: "body_color", label: "Body color" },
  { key: "body_material", label: "Body material" },
  { key: "tail_color", label: "Tail color" },
  { key: "thorax_color", label: "Thorax color" },
  { key: "collar_color", label: "Collar color" },
  { key: "rib_material", label: "Rib material" },
  { key: "wing_material", label: "Wing material" },
  { key: "materials", label: "Materials" },
  { key: "description", label: "Notes" },
  { key: "video_url", label: "Video" },
  { key: "tags", label: "Tags" },
];

function normalize(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) return val.join(", ");
  return String(val).trim();
}

export default function RecipeDiff({
  parent,
  child,
  parentLabel = "Parent",
  childLabel = "Variant",
  compact = false,
}: Props) {
  const rows = FIELD_LABELS.map(({ key, label }) => {
    const parentVal = normalize(parent[key]);
    const childVal = normalize(child[key]);
    if (parentVal === childVal) return null;
    return { key, label, parentVal, childVal };
  }).filter(Boolean) as {
    key: keyof RecipeLike;
    label: string;
    parentVal: string;
    childVal: string;
  }[];

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#21262D] bg-[#0D1117] px-4 py-3 text-xs text-[#6E7681]">
        No recipe differences — this variant is identical to its parent.
      </div>
    );
  }

  if (compact) {
    return (
      <ul className="space-y-1 text-xs">
        {rows.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center gap-1">
            <span className="font-semibold text-[#A8B2BD]">{r.label}:</span>
            <span className="rounded bg-[#21262D] px-1.5 py-0.5 text-[#6E7681] line-through decoration-[#6E7681]/50">
              {r.parentVal || "—"}
            </span>
            <ArrowRight className="h-3 w-3 text-[#6E7681]" />
            <span className="rounded bg-[#E8923A]/15 px-1.5 py-0.5 text-[#E8923A]">
              {r.childVal || "—"}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#21262D] bg-[#0D1117]">
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-stretch text-xs">
        <div className="bg-[#161B22] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#6E7681]">
          Field
        </div>
        <div className="bg-[#161B22] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#A8B2BD]">
          {parentLabel}
        </div>
        <div className="bg-[#161B22] px-2 py-2" />
        <div className="bg-[#161B22] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#E8923A]">
          {childLabel}
        </div>
        {rows.map((r) => (
          <DiffRow key={r.key} label={r.label} parent={r.parentVal} child={r.childVal} />
        ))}
      </div>
    </div>
  );
}

function DiffRow({
  label,
  parent,
  child,
}: {
  label: string;
  parent: string;
  child: string;
}) {
  return (
    <>
      <div className="border-t border-[#21262D] px-3 py-2 font-medium text-[#A8B2BD]">
        {label}
      </div>
      <div className="border-t border-[#21262D] px-3 py-2 text-[#6E7681] line-through decoration-[#6E7681]/40 break-words">
        {parent || <span className="italic text-[#6E7681]/60">empty</span>}
      </div>
      <div className="border-t border-[#21262D] px-2 py-2 flex items-center justify-center text-[#6E7681]">
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
      <div className="border-t border-[#21262D] px-3 py-2 text-[#F0F6FC] break-words">
        {child || <span className="italic text-[#6E7681]/60">empty</span>}
      </div>
    </>
  );
}
