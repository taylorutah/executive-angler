"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Star, Plus, Ruler, RefreshCw, Waves, GitBranch, Split, Grid3X3, Layers, Package, type LucideIcon } from "@/icons";
import type { GearItem, GearType } from "@/types/gear";
import GearForm from "@/components/gear/GearForm";
import GearLockerTable from "./GearLockerTable";
import FirstRunEmpty from "@/app/today/FirstRunEmpty";

const GEAR_TYPES: { type: GearType; label: string; Icon: LucideIcon; desc: string }[] = [
  { type: "rod", label: "Rods", Icon: Ruler, desc: "Fly rods" },
  { type: "reel", label: "Reels", Icon: RefreshCw, desc: "Fly reels" },
  { type: "line", label: "Lines", Icon: Waves, desc: "Fly lines" },
  { type: "leader", label: "Leaders", Icon: GitBranch, desc: "Leaders" },
  { type: "tippet", label: "Tippet", Icon: Split, desc: "Tippet spools" },
  { type: "net", label: "Nets", Icon: Grid3X3, desc: "Landing nets" },
  { type: "waders", label: "Waders", Icon: Layers, desc: "Waders & boots" },
  { type: "other", label: "Other", Icon: Package, desc: "Everything else" },
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

  const euroSections = (() => {
    if (item.type !== "leader") return null;
    const s = item.specs as Record<string, unknown>;
    if (s?.style !== "euro") return null;
    const secs = s?.sections as Array<Record<string, unknown>> | undefined;
    if (!secs?.length) return null;
    return euroSectionsSummary(secs);
  })();

  return (
    <div className="py-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="font-semibold text-[var(--text-1)] text-sm truncate">{item.name}</span>
            {item.is_default && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)] rounded-[var(--radius-pill)] px-2 py-0.5">
                <Star className="h-3 w-3 fill-current" /> Default
              </span>
            )}
          </div>
          {(item.maker || item.model) && (
            <p className="text-xs text-[var(--text-2)] leading-snug">
              {[item.maker, item.model].filter(Boolean).join(" ")}
            </p>
          )}
          {specs && <p className="text-xs text-[var(--text-3)] leading-snug">{specs}</p>}
          {euroSections && (
            <p className="text-xs text-[var(--text-3)] mt-0.5 leading-snug line-clamp-2">
              {euroSections}
            </p>
          )}
          {item.notes && <p className="text-xs text-[var(--text-3)] italic mt-0.5 line-clamp-1">{item.notes}</p>}
        </div>

        {/* Actions — always visible (mobile has no hover) */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onToggleDefault}
            title={item.is_default ? "Remove default" : "Set as default"}
            aria-label={item.is_default ? "Remove default" : "Set as default"}
            className={`p-1.5 rounded-[var(--radius-md)] transition-colors ${
              item.is_default
                ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                : "text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${item.is_default ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={onEdit}
            aria-label="Edit"
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-0.5">
              <button
                onClick={onDelete}
                className="text-xs font-medium text-[var(--danger)] border border-[var(--danger)]/30 rounded-[var(--radius-md)] px-2 py-1 hover:bg-[var(--danger)]/10 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[var(--text-3)] border border-[var(--border)] rounded-[var(--radius-md)] px-2 py-1 hover:bg-[var(--paper-deep)] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete"
              className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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
  const [layout, setLayout] = useState<"cards" | "table">("cards");

  const fetchGear = useCallback(async () => {
    try {
      const res = await fetch("/api/gear");
      if (!res.ok) {
        console.error("Failed to fetch gear:", res.statusText);
        return;
      }
      const data: Record<string, GearItem[]> | GearItem[] = await res.json();
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
      if (saved.is_default) {
        next = next.map((i) => i.id === saved.id ? i : i.type === saved.type ? { ...i, is_default: false } : i);
      }
      return next;
    });
  }

  const itemsOfType = (type: GearType) => items.filter((i) => i.type === type);
  const isFirstOfType = (type: GearType) => itemsOfType(type).length === 0;

  const totalItems = items.length;
  const totalDefaults = items.filter((i) => i.is_default).length;

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header bar — mirrors Dashboard */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Account
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Gear Locker</h1>
              <p className="text-xs sm:text-sm text-[var(--text-2)] mt-1 max-w-[var(--prose)]">
                Track your rods, reels, lines, and leaders. Mark a default per type and it auto-attaches to every new session you log.
              </p>
            </div>
            <div className="ea-segmented shrink-0" role="group" aria-label="Gear layout">
              {(["cards", "table"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLayout(mode)}
                  aria-pressed={layout === mode}
                  className="ea-segment capitalize"
                >
                  {mode}
                </button>
              ))}
            </div>
            {!loading && totalItems > 0 && (
              <div className="flex items-center gap-4 shrink-0">
                <div>
                  <div className="ea-stat-value">{totalItems}</div>
                  <div className="ea-stat-label mt-1">Items</div>
                </div>
                <div className="h-8 w-px bg-[var(--border)]" />
                <div>
                  <div className="ea-stat-value">{totalDefaults}</div>
                  <div className="ea-stat-label mt-1">Defaults</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" />
          </div>
        ) : totalItems === 0 ? (
          <FirstRunEmpty
            surface="gear"
            purpose="The locker holds the rods, reels, and lines that attach to a new session."
            actionLabel="Add a rod"
            example="Nothing is required to start. A session can carry a rod once one lives here."
            action={
              <button
                type="button"
                data-empty-action
                onClick={() => openAdd("rod")}
                className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--accent)] hover:underline"
              >
                Add a rod
              </button>
            }
          />
        ) : layout === "table" ? (
          <GearLockerTable
            items={items}
            onItemSaved={handleSaved}
            onEdit={openEdit}
            onToggleDefault={handleToggleDefault}
            onDeleteMany={async (selected) => {
              const ids = new Set(selected.map((i) => i.id));
              setItems((prev) => prev.filter((i) => !ids.has(i.id)));
              await Promise.all(
                selected.map((i) =>
                  fetch(`/api/gear?id=${i.id}`, { method: "DELETE" }).catch(() => null),
                ),
              );
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {GEAR_TYPES.map(({ type, label, Icon }) => {
              const typeItems = itemsOfType(type);
              return (
                <section
                  key={type}
                  className="ea-card flex flex-col"
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="flex items-center gap-2.5 text-xl text-[var(--text-1)] min-w-0">
                      <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0" aria-hidden>
                        <Icon className="h-4 w-4 text-[var(--accent)]" />
                      </span>
                      <span className="truncate">{label}</span>
                      {typeItems.length > 0 && (
                        <span className="text-sm font-normal text-[var(--text-3)] shrink-0">
                          ({typeItems.length})
                        </span>
                      )}
                    </h2>
                    <button
                      type="button"
                      onClick={() => openAdd(type)}
                      aria-label={`Add ${label.toLowerCase()}`}
                      className="ea-btn ea-btn-secondary ea-btn-sm shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>

                  {typeItems.length === 0 ? (
                    <button
                      onClick={() => openAdd(type)}
                      className="flex-1 w-full border border-dashed border-[var(--border-strong)] rounded-[var(--radius-md)] py-5 text-center text-xs text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors min-h-[100px] flex flex-col items-center justify-center gap-2"
                    >
                      <span className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center" aria-hidden>
                        <Icon className="h-5 w-5 text-[var(--accent)]" />
                      </span>
                      No {label.toLowerCase()} yet
                    </button>
                  ) : (
                    <div className="divide-y divide-[var(--border)] flex-1">
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
