"use client";
/**
 * BoxesManager — full CRUD on the user's fly_boxes from /flies/boxes.
 *
 * Tiers are now per-user. The 4 baseline tiers (kill/support/archive/custom)
 * always exist; users can rename them, edit their descriptions, and add new
 * tiers. Tier list comes from profiles.tier_definitions (jsonb) and is saved
 * via PUT /api/profile/tier-definitions. Box mutations call /api/fly-boxes.
 */
import Link from "next/link";
import BoxesTable from "./BoxesTable";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Plus, MoreVertical, Pencil, Trash2, Star, X, Check } from "@/icons";
import { Button } from "@/components/ui/Button";
import type { FlyBoxV2, BoxStats } from "@/lib/db/fly-v2";
import {
  DEFAULT_TIER_KEYS,
  TIER_DESCRIPTION_MAX,
  TIER_LABEL_MAX,
  slugifyTierKey,
  type TierDefinition,
} from "@/lib/flies/tier-definitions";

const CATEGORY_SHORT: Record<string, string> = {
  dry: "Dry",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet",
  terrestrial: "Terres.",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

function BoxStatLine({ stats }: { stats?: BoxStats }) {
  if (!stats || stats.total === 0) return null;
  const top = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <div className="mt-1.5 flex items-center gap-2 num text-xs text-[var(--text-3)]">
      <span>{stats.total} flies</span>
      {top.map(([cat, count]) => (
        <span key={cat}>
          {count} {CATEGORY_SHORT[cat] ?? cat}
        </span>
      ))}
    </div>
  );
}

type EditorMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; box: FlyBoxV2 };

interface FormState {
  name: string;
  tier: string;
  description: string;
  total_capacity: string;
}

export default function BoxesManager({
  initialBoxes,
  initialStats,
  initialTierDefinitions,
}: {
  initialBoxes: FlyBoxV2[];
  initialStats: Record<string, BoxStats>;
  initialTierDefinitions: TierDefinition[];
}) {
  const router = useRouter();
  const [boxes, setBoxes] = useState<FlyBoxV2[]>(initialBoxes);
  const [stats] = useState<Record<string, BoxStats>>(initialStats);
  const [tiers, setTiers] = useState<TierDefinition[]>(initialTierDefinitions);
  const emptyForm: FormState = {
    name: "",
    tier: initialTierDefinitions.find((t) => t.key === "custom")?.key ?? initialTierDefinitions[0]?.key ?? "custom",
    description: "",
    total_capacity: "",
  };
  const [layout, setLayout] = useState<"grid" | "table">("grid");
  const [editor, setEditor] = useState<EditorMode>({ kind: "closed" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Tier inline edit (label + description on one row).
  const [editingTierKey, setEditingTierKey] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [tierBusy, setTierBusy] = useState(false);

  // "+ Add tier" modal.
  const [addTierOpen, setAddTierOpen] = useState(false);
  const [newTierLabel, setNewTierLabel] = useState("");
  const [newTierDesc, setNewTierDesc] = useState("");
  const [addTierError, setAddTierError] = useState<string | null>(null);

  function tierFor(key: string): TierDefinition | undefined {
    return tiers.find((t) => t.key === key);
  }

  function startEditTier(t: TierDefinition) {
    setLabelDraft(t.label);
    setDescDraft(t.description);
    setEditingTierKey(t.key);
  }

  function cancelEditTier() {
    setEditingTierKey(null);
    setLabelDraft("");
    setDescDraft("");
  }

  async function persistTiers(next: TierDefinition[]): Promise<TierDefinition[]> {
    const res = await fetch("/api/profile/tier-definitions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier_definitions: next }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to save tiers.");
    return (json.tier_definitions ?? next) as TierDefinition[];
  }

  async function saveTierEdit() {
    if (!editingTierKey) return;
    const label = labelDraft.trim();
    const description = descDraft.trim();
    if (!label) {
      alert("Label is required.");
      return;
    }
    setTierBusy(true);
    try {
      const next = tiers.map((t) =>
        t.key === editingTierKey ? { ...t, label, description } : t,
      );
      const saved = await persistTiers(next);
      setTiers(saved);
      cancelEditTier();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setTierBusy(false);
    }
  }

  async function deleteCustomTier(key: string) {
    if (DEFAULT_TIER_KEYS.has(key)) return;
    if (groups[key] && groups[key].length > 0) {
      alert("This tier still contains boxes. Move or delete them first.");
      return;
    }
    if (!confirm(`Delete tier "${tierFor(key)?.label ?? key}"?`)) return;
    setTierBusy(true);
    try {
      const next = tiers.filter((t) => t.key !== key);
      const saved = await persistTiers(next);
      setTiers(saved);
      setOpenMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tier.");
    } finally {
      setTierBusy(false);
    }
  }

  function openAddTier() {
    setNewTierLabel("");
    setNewTierDesc("");
    setAddTierError(null);
    setAddTierOpen(true);
  }

  async function submitNewTier(e: React.FormEvent) {
    e.preventDefault();
    const label = newTierLabel.trim();
    const description = newTierDesc.trim();
    if (!label) {
      setAddTierError("Label is required.");
      return;
    }
    // Derive a unique key from the label.
    const base = slugifyTierKey(label) || "tier";
    const existingKeys = new Set(tiers.map((t) => t.key));
    let key = base;
    let n = 2;
    while (existingKeys.has(key)) {
      key = `${base}-${n++}`;
      if (n > 99) break;
    }
    setTierBusy(true);
    setAddTierError(null);
    try {
      const next: TierDefinition[] = [...tiers, { key, label, description }];
      const saved = await persistTiers(next);
      setTiers(saved);
      setAddTierOpen(false);
    } catch (err) {
      setAddTierError(err instanceof Error ? err.message : "Failed to add tier.");
    } finally {
      setTierBusy(false);
    }
  }

  // Close any open kebab menu on outside click or Escape.
  useEffect(() => {
    if (!openMenuId) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  // Group boxes by tier key. Unknown keys (rare — e.g. legacy custom tier
  // that hasn't been added to the user's list) flow into an "Other" bucket.
  const groups: Record<string, FlyBoxV2[]> = {};
  for (const t of tiers) groups[t.key] = [];
  const orphanedBoxes: FlyBoxV2[] = [];
  for (const b of boxes) {
    if (groups[b.tier]) groups[b.tier].push(b);
    else orphanedBoxes.push(b);
  }

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setEditor({ kind: "create" });
  }

  function openEdit(box: FlyBoxV2) {
    setForm({
      name: box.name,
      tier: box.tier,
      description: box.description ?? "",
      total_capacity: box.total_capacity == null ? "" : String(box.total_capacity),
    });
    setError(null);
    setEditor({ kind: "edit", box });
    setOpenMenuId(null);
  }

  function closeEditor() {
    if (busy) return;
    setEditor({ kind: "closed" });
    setError(null);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        tier: form.tier,
        description: form.description.trim() || null,
        total_capacity: form.total_capacity.trim() === ""
          ? null
          : Math.max(0, Math.floor(Number(form.total_capacity))) || null,
      };
      const url = editor.kind === "edit" ? `/api/fly-boxes?id=${editor.box.id}` : "/api/fly-boxes";
      const method = editor.kind === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save box.");
      const saved = json.box as FlyBoxV2;
      setBoxes((prev) => {
        if (editor.kind === "edit") {
          return prev.map((b) => (b.id === saved.id ? saved : b));
        }
        return [...prev, saved];
      });
      setEditor({ kind: "closed" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save box.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteBox(box: FlyBoxV2) {
    if (!confirm(`Delete "${box.name}"? Variants in this box are kept (they may belong to other boxes).`)) return;
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/fly-boxes?id=${box.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete box.");
      setBoxes((prev) => prev.filter((b) => b.id !== box.id));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete box.");
    }
  }

  async function setDefault(box: FlyBoxV2) {
    setOpenMenuId(null);
    if (box.is_default) return;
    try {
      const res = await fetch(`/api/fly-boxes?id=${box.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to set default.");
      const saved = json.box as FlyBoxV2;
      setBoxes((prev) => prev.map((b) => ({
        ...b,
        is_default: b.id === saved.id,
      })));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set default.");
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-end gap-2">
        <div className="ea-segmented mr-auto">
          {(["grid", "table"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLayout(mode)}
              aria-pressed={layout === mode}
              className="ea-segment ea-focus-ring capitalize"
            >
              {mode}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" icon={Plus} onClick={openAddTier}>
          Add Tier
        </Button>
        <Button variant="solid" size="sm" icon={Plus} onClick={openCreate}>
          New Box
        </Button>
      </div>

      {layout === "table" ? (
        <BoxesTable
          boxes={boxes}
          stats={stats}
          tiers={tiers}
          onBoxSaved={(saved) =>
            setBoxes((prev) => prev.map((b) => (b.id === saved.id ? saved : b)))
          }
          onSetDefault={setDefault}
          onDeleteMany={async (selected) => {
            const ids = new Set(selected.map((b) => b.id));
            setBoxes((prev) => prev.filter((b) => !ids.has(b.id)));
            await Promise.all(
              selected.map((b) =>
                fetch(`/api/fly-boxes?id=${b.id}`, { method: "DELETE" }).catch(() => null),
              ),
            );
            router.refresh();
          }}
        />
      ) : (
      <section className="space-y-8">
        {tiers.map((t) => {
          const items = groups[t.key] ?? [];
          const isEditing = editingTierKey === t.key;
          const isDefault = DEFAULT_TIER_KEYS.has(t.key);
          return (
            <div key={t.key}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        autoFocus
                        type="text"
                        value={labelDraft}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); saveTierEdit(); }
                          else if (e.key === "Escape") { e.preventDefault(); cancelEditTier(); }
                        }}
                        maxLength={TIER_LABEL_MAX}
                        placeholder="Tier name"
                        disabled={tierBusy}
                        className="ea-input"
                      />
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={descDraft}
                          onChange={(e) => setDescDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); saveTierEdit(); }
                            else if (e.key === "Escape") { e.preventDefault(); cancelEditTier(); }
                          }}
                          maxLength={TIER_DESCRIPTION_MAX}
                          placeholder="Description (optional)"
                          disabled={tierBusy}
                          className="ea-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={saveTierEdit}
                          disabled={tierBusy}
                          aria-label="Save tier"
                          className="rounded-[var(--radius-sm)] p-2 text-[var(--accent)] hover:bg-[var(--paper-deep)] disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditTier}
                          disabled={tierBusy}
                          aria-label="Cancel"
                          className="rounded-[var(--radius-sm)] p-2 text-[var(--text-3)] hover:bg-[var(--paper-deep)] disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="ea-overline">
                        {t.label}
                      </h2>
                      <button
                        type="button"
                        onClick={() => startEditTier(t)}
                        aria-label={`Edit ${t.label} tier`}
                        title="Click to edit name or description"
                        className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-left text-xs text-[var(--text-3)] hover:text-[var(--text-1)]"
                      >
                        <span className="border-b border-dashed border-transparent group-hover:border-[var(--text-3)]">
                          {t.description || (
                            <em className="italic">Add description…</em>
                          )}
                        </span>
                        <Pencil className="h-3.5 w-3.5 text-[var(--text-3)] group-hover:text-[var(--accent)]" />
                      </button>
                    </>
                  )}
                </div>
                {!isEditing && !isDefault && (
                  <button
                    type="button"
                    onClick={() => deleteCustomTier(t.key)}
                    disabled={tierBusy}
                    aria-label={`Delete ${t.label} tier`}
                    title="Delete this tier"
                    className="rounded-[var(--radius-sm)] p-2 text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--paper-deep)] disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((b) => (
                    <BoxCard
                      key={b.id}
                      box={b}
                      stats={stats[b.id]}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      menuRef={menuRef}
                      onEdit={openEdit}
                      onDelete={deleteBox}
                      onSetDefault={setDefault}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {orphanedBoxes.length > 0 && (
          <div>
            <div className="mb-3">
              <h2 className="ea-overline text-[var(--danger)]">
                Other
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Boxes whose tier was removed. Re-assign them via Edit.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orphanedBoxes.map((b) => (
                <BoxCard
                  key={b.id}
                  box={b}
                  stats={stats[b.id]}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  menuRef={menuRef}
                  onEdit={openEdit}
                  onDelete={deleteBox}
                  onSetDefault={setDefault}
                />
              ))}
            </div>
          </div>
        )}

        {boxes.length === 0 && (
          <div className="ea-card ea-empty">
            <Plus className="h-8 w-8 text-[var(--text-3)]" />
            <p>No boxes yet.</p>
            <div>
              <Button variant="solid" size="sm" icon={Plus} onClick={openCreate}>
                Create your first box
              </Button>
            </div>
          </div>
        )}
      </section>
      )}

      {editor.kind !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editor.kind === "edit" ? "Edit box" : "New box"}
          className="ea-modal-overlay z-30 flex items-center justify-center p-4"
          onClick={closeEditor}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
            className="ea-modal max-w-md p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">
                {editor.kind === "edit" ? "Edit box" : "New box"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                aria-label="Close"
                className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Name</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Madison Summer"
                  className="ea-input mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Tier</span>
                <select
                  value={form.tier}
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                  className="ea-input mt-1"
                >
                  {tiers.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}{t.description ? ` — ${t.description}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="What lives in this box?"
                  className="ea-input mt-1"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Capacity (optional)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.total_capacity}
                  onChange={(e) => setForm((f) => ({ ...f, total_capacity: e.target.value }))}
                  placeholder="e.g. 24"
                  className="ea-input mt-1"
                />
              </label>

              {error && (
                <p className="ea-field-error">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
              <Button variant="outline" size="sm" onClick={closeEditor} disabled={busy}>
                Cancel
              </Button>
              <Button variant="solid" size="sm" type="submit" disabled={busy} loading={busy}>
                {busy ? "Saving…" : editor.kind === "edit" ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {addTierOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add tier"
          className="ea-modal-overlay z-30 flex items-center justify-center p-4"
          onClick={() => !tierBusy && setAddTierOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitNewTier}
            className="ea-modal max-w-md p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-[var(--text-1)]">Add Tier</h2>
              <button
                type="button"
                onClick={() => setAddTierOpen(false)}
                disabled={tierBusy}
                aria-label="Close"
                className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Label</span>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newTierLabel}
                  onChange={(e) => setNewTierLabel(e.target.value)}
                  placeholder="e.g. Saltwater, Steelhead, Travel"
                  maxLength={TIER_LABEL_MAX}
                  className="ea-input mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[var(--text-2)]">Description (optional)</span>
                <textarea
                  value={newTierDesc}
                  onChange={(e) => setNewTierDesc(e.target.value)}
                  rows={2}
                  placeholder="When and where this tier fits"
                  maxLength={TIER_DESCRIPTION_MAX}
                  className="ea-input mt-1"
                />
              </label>
              {addTierError && (
                <p className="ea-field-error">{addTierError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
              <Button variant="outline" size="sm" onClick={() => setAddTierOpen(false)} disabled={tierBusy}>
                Cancel
              </Button>
              <Button variant="solid" size="sm" type="submit" disabled={tierBusy} loading={tierBusy}>
                {tierBusy ? "Saving…" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function BoxCard({
  box: b,
  stats,
  openMenuId,
  setOpenMenuId,
  menuRef,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  box: FlyBoxV2;
  stats?: BoxStats;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onEdit: (b: FlyBoxV2) => void;
  onDelete: (b: FlyBoxV2) => void;
  onSetDefault: (b: FlyBoxV2) => void;
}) {
  return (
    <div className="ea-card card-hover relative p-0">
      <Link href={`/flies/boxes/${b.id}`} className="block p-4 pr-12">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--paper-deep)] flex items-center justify-center">
            <Box className="h-5 w-5 text-[var(--text-3)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[var(--text-1)] font-semibold text-sm truncate">
              {b.name}
              {b.is_default && (
                <span className="ml-2 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--accent)]">
                  Default
                </span>
              )}
            </h3>
            {b.description && (
              <p className="text-xs text-[var(--text-2)] mt-0.5 line-clamp-2">{b.description}</p>
            )}
            <BoxStatLine stats={stats} />
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2" ref={openMenuId === b.id ? menuRef : null}>
        <button
          type="button"
          aria-label="Box actions"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === b.id ? null : b.id); }}
          className="rounded-[var(--radius-sm)] p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--paper-deep)]"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {openMenuId === b.id && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 w-44 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-float)] z-20 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" role="menuitem" onClick={() => onEdit(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--text-1)] hover:bg-[var(--paper-deep)]">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            {!b.is_default && (
              <button type="button" role="menuitem" onClick={() => onSetDefault(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--text-1)] hover:bg-[var(--paper-deep)]">
                <Star className="h-3.5 w-3.5" />
                Set as default
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => onDelete(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--danger)] hover:bg-[var(--paper-deep)]">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

