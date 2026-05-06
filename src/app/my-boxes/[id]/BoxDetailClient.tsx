"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Crosshair,
  Backpack,
  Archive,
  Folder,
  Trash2,
  Pencil,
  Loader2,
  Printer,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { FlyBox } from "@/lib/db/fly-boxes";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import QuickAddFliesSheet from "@/components/flies/QuickAddFliesSheet";
import EditBoxDialog from "@/components/flies/EditBoxDialog";

const TIER_META = {
  kill: { label: "Tier 1 · Kill", icon: Crosshair, accent: "text-[#E8923A]", border: "border-[#E8923A]/30" },
  support: { label: "Tier 2 · Support", icon: Backpack, accent: "text-[#0BA5C7]", border: "border-[#0BA5C7]/30" },
  archive: { label: "Tier 3 · Archive", icon: Archive, accent: "text-[#A8B2BD]", border: "border-[#30363D]" },
  custom: { label: "Custom", icon: Folder, accent: "text-[#A8B2BD]", border: "border-[#30363D]" },
} as const;

interface Props {
  box: FlyBox;
  initialEntries: FlyBoxEntry[];
}

export default function BoxDetailClient({ box, initialEntries }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [removing, setRemoving] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function downloadInventoryPdf() {
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/export/box-inventory-pdf?boxId=${box.id}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error || "Failed to generate PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safe = box.name.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
      a.download = `${safe}-inventory.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download inventory PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  const meta = TIER_META[box.tier];
  const Icon = meta.icon;
  const totalQuantity = entries.reduce((sum, e) => {
    const q = e.quantity_by_size;
    if (q && Object.keys(q).length > 0)
      return sum + Object.values(q).reduce((s, n) => s + (typeof n === "number" ? n : 0), 0);
    return sum;
  }, 0);
  const capacityPct =
    box.total_capacity && box.total_capacity > 0
      ? Math.min(100, Math.round((totalQuantity / box.total_capacity) * 100))
      : null;

  async function removeFromBox(entry: FlyBoxEntry) {
    if (!confirm(`Remove this fly from ${box.name}? It will stay in your collection if it's in another box.`)) return;
    setRemoving(entry.id);
    try {
      const res = await fetch(
        `/api/fly-boxes/${box.id}/membership?entry=${encodeURIComponent(entry.id)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error || "Failed to remove");
      }
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        <Link
          href="/my-boxes"
          className="inline-flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> All boxes
        </Link>

        <header
          className={`mb-6 rounded-xl border ${meta.border} bg-[#161B22] p-4 sm:p-5`}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${meta.accent}`} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${meta.accent}`}
                >
                  {meta.label}
                </span>
                {box.is_default && (
                  <span className="rounded-full bg-[#21262D] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#A8B2BD]">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {box.icon && <span className="text-2xl">{box.icon}</span>}
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F0F6FC]">
                  {box.name}
                </h1>
              </div>
              {box.description && (
                <p className="mt-2 text-sm text-[#A8B2BD] max-w-2xl leading-relaxed">
                  {box.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-xs text-[#A8B2BD]">
                <span className="text-[#F0F6FC] font-semibold">{entries.length}</span>{" "}
                {entries.length === 1 ? "fly" : "flies"} ·{" "}
                <span className="text-[#F0F6FC] font-semibold">{totalQuantity}</span> tied
              </div>
              {capacityPct !== null && (
                <div className="w-32">
                  <div className="h-1 w-full rounded-full bg-[#21262D] overflow-hidden">
                    <div
                      className={`h-full ${meta.accent.replace("text-", "bg-")}`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#6E7681] text-right">
                    {totalQuantity}/{box.total_capacity}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#E8923A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F0A65A] transition-colors"
              title="Quickly add personal flies in bulk"
            >
              <Sparkles className="h-3.5 w-3.5" /> Quick add
            </button>
            <Link
              href="/flies"
              className="inline-flex items-center gap-1 rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> From library
            </Link>
            <Link
              href="/journal/flies/workbench"
              className="inline-flex items-center gap-1 rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
              title="Tie flies for your boxes"
            >
              <Wrench className="h-3.5 w-3.5" /> Workbench
            </Link>
            <button
              type="button"
              onClick={downloadInventoryPdf}
              disabled={downloadingPdf || entries.length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors disabled:opacity-50"
              title={entries.length === 0 ? "Add some flies first" : "Download a printable inventory PDF"}
            >
              {downloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
              Print inventory
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#21262D] bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit box
            </button>
          </div>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
            <Plus className="mx-auto h-10 w-10 text-[#6E7681]" />
            <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">
              This box is empty
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
              Add flies from your library or your fly patterns. Same fly can live in
              multiple boxes — counts and recipe stay synced.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <EntryTile
                key={entry.id}
                entry={entry}
                removing={removing === entry.id}
                onRemove={() => removeFromBox(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {quickAddOpen && (
        <QuickAddFliesSheet
          boxId={box.id}
          boxName={box.name}
          onClose={() => setQuickAddOpen(false)}
          onSuccess={(count) => {
            setQuickAddOpen(false);
            // Hard reload to re-fetch entries server-side; otherwise client-side
            // we'd need to merge new entries into the grid manually.
            void count;
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      )}

      {editOpen && (
        <EditBoxDialog
          box={box}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            if (typeof window !== "undefined") window.location.reload();
          }}
          onDeleted={() => {
            setEditOpen(false);
            // After delete, navigate back to the boxes index.
            if (typeof window !== "undefined") window.location.href = "/my-boxes";
          }}
        />
      )}
    </div>
  );
}

function EntryTile({
  entry,
  removing,
  onRemove,
}: {
  entry: FlyBoxEntry;
  removing: boolean;
  onRemove: () => void;
}) {
  const canonical = entry.canonical_fly;
  const name = entry.custom_name || canonical?.name || "Untitled";
  const image = entry.custom_image_url || canonical?.hero_image_url;
  const slug = canonical?.slug;
  const detailHref = slug ? `/flies/${slug}?variant=${entry.id}` : "#";
  const total = entry.quantity_by_size
    ? Object.values(entry.quantity_by_size).reduce(
        (sum, n) => sum + (typeof n === "number" ? n : 0),
        0,
      )
    : 0;
  const sizesList = entry.quantity_by_size
    ? Object.entries(entry.quantity_by_size)
        .filter(([, n]) => typeof n === "number" && n > 0)
        .map(([size, n]) => `${n}×#${size}`)
        .join(" · ")
    : "";

  return (
    <div className="group flex flex-col rounded-xl border border-[#21262D] bg-[#161B22] hover:border-[#E8923A]/30 overflow-hidden transition-colors">
      <Link href={detailHref} className="block relative aspect-square bg-[#0D1117] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            🪰
          </div>
        )}
        {total > 0 && (
          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/15">
            {total}
          </span>
        )}
      </Link>
      <div className="p-2.5">
        <Link href={detailHref} className="block">
          <p className="text-[13px] font-semibold text-[#F0F6FC] truncate">{name}</p>
          {sizesList && (
            <p className="mt-0.5 text-[10px] text-[#6E7681] truncate">{sizesList}</p>
          )}
        </Link>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#6E7681] hover:text-red-400 disabled:opacity-50 transition-colors"
          title="Remove from this box"
        >
          {removing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Remove from box
        </button>
      </div>
    </div>
  );
}
