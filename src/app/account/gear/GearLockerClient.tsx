"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Star, Plus } from "lucide-react";
import type { GearItem, GearType } from "@/types/gear";
import GearForm from "@/components/gear/GearForm";

const GEAR_TYPES: { type: GearType; label: string; emoji: string; desc: string }[] = [
  { type: "rod", label: "Rods", emoji: "🎣", desc: "Fly rods" },
  { type: "reel", label: "Reels", emoji: "🪝", desc: "Fly reels" },
  { type: "line", label: "Lines", emoji: "〰️", desc: "Fly lines" },
  { type: "leader", label: "Leaders", emoji: "📏", desc: "Leaders" },
  { type: "tippet", label: "Tippet", emoji: "🧵", desc: "Tippet spools" },
  { type: "net", label: "Nets", emoji: "🥅", desc: "Landing nets" },
  { type: "waders", label: "Waders", emoji: "🦺", desc: "Waders & boots" },
  { type: "other", label: "Other", emoji: "🔧", desc: "Everything else" },
];

/** Build a compact one-line summary of euro leader sections */
function euroSectionsSummary(sections: Array<Record<string, unknown>>): string {
  return sections.map((sec) => {
    const role = sec.role as string;
    if (role === "tippet-ring") {
      return `Ring${sec.ring_size ? `: ${sec.ring_size}` : ""}`;
    }
    if (role === "tippet") {
      const parts: string[] = ["Tippet"];
      if (sec.length_ft) parts.push(`${sec.length_ft}ft`);
      if (sec.material) parts.push(sec.material as string);
      if (sec.x_size) parts.push(sec.x_size as string);
      return parts.join(" ");
    }
    // butt / level / sighter
    const label = role === "butt" ? "Butt"
                : role === "level" ? "Level"
                : "Sighter";
    const parts: string[] = [label];
    if (sec.length_ft) parts.push(`${sec.length_ft}ft`);
    if (sec.material_name) parts.push(sec.material_name as string);
    if (sec.lb_test) parts.push(`${sec.lb_test}lb`);
    if (sec.diameter_mm) parts.push(`${sec.diameter_mm}mm`);
    return parts.join(" ");
  }).join(" · ");
}

function specsToString(item: GearItem): string {
  const s = item.specs || {};
  const parts: string[] = [];
  if (item.type === "rod") {
    const rs = s as { length_ft?: number; weight_wt?: number; action?: string; pieces?: number };
    if (rs.length_ft) parts.push(`${rs.length_ft}ft`);
    if (rs.weight_wt) parts.push(`${rs.weight_wt}wt`);
    if (rs.action) parts.push(rs.action);
    if (rs.pieces) parts.push(`${rs.pieces}pc`);
  } else if (item.type === "reel") {
    const rs = s as { size?: string; drag?: string };
    if (rs.size) parts.push(`Size ${rs.size}`);
    if (rs.drag) parts.push(rs.drag);
  } else if (item.type === "line") {
    const ls = s as { taper?: string; weight?: number; density?: string };
    if (ls.taper && ls.weight) parts.push(`${ls.taper}${ls.weight}F`);
    if (ls.density) parts.push(ls.density);
  } else if (item.type === "leader") {
    const ls = s as { length_ft?: number; tippet_x?: string; style?: string };
    if (ls.length_ft) parts.push(`${ls.length_ft}ft`);
    if (ls.tippet_x) parts.push(ls.tippet_x);
    if (ls.style) parts.push(ls.style);
  } else if (item.type === "tippet") {
    const ts = s as { x_size?: string; material?: string; diameter_mm?: number };
    if (ts.x_size) parts.push(ts.x_size);
    if (ts.material) parts.push(ts.material);
    if (ts.diameter_mm) parts.push(`${ts.diameter_mm}mm`);
  }
  return parts.join(" · ");
}

interface GearCardProps {
  item: GearItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDefault: () => void;
}

function GearCard({ item, onEdit, onDelete, onToggleDefault }: GearCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const specs = specsToString(item);

  // Euro leader section summary
  const euroSections = (() => {
    if (item.type !== "leader") return null;
    const s = item.specs as Record<string, unknown>;
    if (s?.style !== "euro") return null;
    const secs = s?.sections as Array<Record<string, unknown>> | undefined;
    if (!secs?.length) return null;
    return euroSectionsSummary(secs);
  })();

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 flex items-start gap-3 hover:border-[#6E7681] transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#F0F6FC] text-sm truncate">{item.name}</span>
          {item.is_default && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold bg-[#E8923A]/15 text-[#E8923A] border border-[#E8923A]/20 rounded-full px-2 py-0.5">
              <Star className="h-2.5 w-2.5 fill-current" /> DEFAULT
            </span>
          )}
        </div>
        {(item.maker || item.model) && (
          <p className="text-xs text-[#A8B2BD] mb-1">
            {[item.maker, item.model].filter(Boolean).join(" ")}
          </p>
        )}
        {specs && <p className="text-xs text-[#6E7681]">{specs}</p>}
        {euroSections && (
          <p className="text-[10px] text-[#6E7681]/70 mt-1 leading-relaxed">
            {euroSections}
          </p>
        )}
        {item.notes && <p className="text-xs text-[#6E7681] italic mt-1 line-clamp-2">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Default toggle */}
        <button
          onClick={onToggleDefault}
          title={item.is_default ? "Remove default" : "Set as default"}
          className={`p-1.5 rounded-lg transition-colors ${
            item.is_default
              ? "text-[#E8923A] bg-[#E8923A]/10 hover:bg-[#E8923A]/20"
              : "text-[#6E7681] hover:text-[#E8923A] hover:bg-[#E8923A]/10"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${item.is_default ? "fill-current" : ""}`} />
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-[#6E7681] hover:text-[#0BA5C7] hover:bg-[#0BA5C7]/10 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onDelete}
              className="text-[10px] font-semibold text-red-500 border border-red-500/30 rounded px-2 py-1 hover:bg-red-500/10 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] text-[#6E7681] border border-[#21262D] rounded px-2 py-1 hover:bg-[#21262D] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-[#6E7681] hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function GearLockerClient() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GearItem | null>(null);
  const [activeType, setActiveType] = useState<GearType>("rod");

  const fetchGear = useCallback(async () => {
    try {
      const res = await fetch("/api/gear");
      if (!res.ok) {
        console.error("Failed to fetch gear:", res.statusText);
        return;
      }
      const data: Record<string, GearItem[]> | GearItem[] = await res.json();
      // API returns grouped object — flatten to array
      const flat: GearItem[] = Array.isArray(data)
        ? data
        : Object.values(data).flat();
      setItems(flat.filter((i) => i.is_active));
    } catch (err) {
      console.error("Gear fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGear(); }, [fetchGear]);

  function openAdd(type: GearType) {
    setActiveType(type);
    setEditItem(null);
    setFormOpen(true);
  }

  function openEdit(item: GearItem) {
    setEditItem(item);
    setActiveType(item.type);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/gear?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete gear item");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete gear error:", err);
      alert("Failed to delete gear item. Please try again.");
    }
  }

  async function handleToggleDefault(item: GearItem) {
    try {
      const res = await fetch(`/api/gear?id=${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: !item.is_default }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Toggle default error:", data.error);
        alert(data.error || "Failed to update gear item");
        return;
      }
      const updated: GearItem = await res.json();
      setItems((prev) => prev.map((i) => {
        if (i.id === updated.id) return updated;
        // Clear other defaults of same type when setting new default
        if (updated.is_default && i.type === updated.type) return { ...i, is_default: false };
        return i;
      }));
    } catch (err) {
      console.error("Toggle default error:", err);
      alert("Failed to update gear item. Please try again.");
    }
  }

  function handleSaved(saved: GearItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === saved.id);
      let next = exists
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [...prev, saved];
      // If this is now the default, clear others of the same type
      if (saved.is_default) {
        next = next.map((i) => i.id === saved.id ? i : i.type === saved.type ? { ...i, is_default: false } : i);
      }
      return next;
    });
  }

  const itemsOfType = (type: GearType) => items.filter((i) => i.type === type);
  const isFirstOfType = (type: GearType) => itemsOfType(type).length === 0;

  return (
    <div className="min-h-screen bg-[#0D1117] pb-16">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/account" className="flex items-center gap-1.5 text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Account
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-[#E8923A] mb-1">Gear Locker</h1>
          <p className="text-sm text-[#6E7681]">
            Track your rods, reels, lines, and leaders — like Strava&apos;s shoe tracking, but for fly fishing.
            Mark a default and it auto-attaches to every new session you log.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-[#E8923A]/30 border-t-[#E8923A] animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {GEAR_TYPES.map(({ type, label, emoji }) => {
              const typeItems = itemsOfType(type);
              return (
                <section key={type}>
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-[#F0F6FC] uppercase tracking-wide">
                      <span>{emoji}</span>
                      {label}
                      {typeItems.length > 0 && (
                        <span className="text-xs font-normal text-[#6E7681] normal-case tracking-normal">
                          ({typeItems.length})
                        </span>
                      )}
                    </h2>
                    <button
                      onClick={() => openAdd(type)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#0BA5C7] hover:text-[#0BA5C7]/80 border border-[#0BA5C7]/20 hover:border-[#0BA5C7]/40 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add {label.replace(/s$/, "")}
                    </button>
                  </div>

                  {typeItems.length === 0 ? (
                    <button
                      onClick={() => openAdd(type)}
                      className="w-full border border-dashed border-[#21262D] rounded-xl py-6 text-center text-sm text-[#6E7681] hover:border-[#E8923A]/30 hover:text-[#E8923A]/60 transition-colors"
                    >
                      <span className="text-2xl block mb-1">{emoji}</span>
                      No {label.toLowerCase()} yet — add one
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {typeItems.map((item) => (
                        <GearCard
                          key={item.id}
                          item={item}
                          onEdit={() => openEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          onToggleDefault={() => handleToggleDefault(item)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <GearForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
        onSaved={handleSaved}
        initialType={activeType}
        editItem={editItem}
        isFirstOfType={isFirstOfType(activeType)}
      />
    </div>
  );
}
