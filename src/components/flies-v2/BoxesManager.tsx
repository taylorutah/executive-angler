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
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Plus, MoreVertical, Pencil, Trash2, Star, X, Check } from "lucide-react";
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
    <div className="mt-1.5 flex items-center gap-2 font-['IBM_Plex_Mono'] text-[10px] text-[#484F58]">
      <span className="text-[#6E7681]">{stats.total} flies</span>
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
        <button
          type="button"
          onClick={openAddTier}
          className="inline-flex items-center gap-2 rounded-md border border-[#30363D] bg-transparent px-3 py-1.5 text-sm font-medium text-[#A8B2BD] hover:border-[#E8923A] hover:text-[#F0F6FC] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Tier
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-[#E8923A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d17d28] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Box
        </button>
      </div>

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
                        className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-[#30363D] bg-[#0D1117] px-2 py-1 text-[#0BA5C7] focus:border-[#E8923A] focus:outline-none"
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
                          className="flex-1 rounded border border-[#30363D] bg-[#0D1117] px-2 py-1 text-xs text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={saveTierEdit}
                          disabled={tierBusy}
                          aria-label="Save tier"
                          className="rounded p-1 text-[#E8923A] hover:bg-[#1F2937] disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditTier}
                          disabled={tierBusy}
                          aria-label="Cancel"
                          className="rounded p-1 text-[#6E7681] hover:bg-[#1F2937] disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#0BA5C7]">
                        {t.label}
                      </h2>
                      <button
                        type="button"
                        onClick={() => startEditTier(t)}
                        aria-label={`Edit ${t.label} tier`}
                        title="Click to edit name or description"
                        className="group inline-flex items-center gap-1.5 rounded text-left text-xs text-[#6E7681] hover:text-[#F0F6FC]"
                      >
                        <span className="border-b border-dashed border-transparent group-hover:border-[#484F58]">
                          {t.description || (
                            <em className="italic text-[#484F58]">Add description…</em>
                          )}
                        </span>
                        <Pencil className="h-3 w-3 text-[#484F58] group-hover:text-[#E8923A]" />
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
                    className="rounded p-1 text-[#484F58] hover:text-red-400 hover:bg-[#1F2937] disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
              <h2 className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                Other
              </h2>
              <p className="text-xs text-[#6E7681]">
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
          <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-10 text-center">
            <Plus className="h-8 w-8 text-[#484F58] mx-auto mb-3" />
            <p className="text-[#A8B2BD] text-sm">No boxes yet.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#E8923A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d17d28]"
            >
              <Plus className="h-4 w-4" />
              Create your first box
            </button>
          </div>
        )}
      </section>

      {editor.kind !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editor.kind === "edit" ? "Edit box" : "New box"}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          onClick={closeEditor}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
            className="w-full max-w-md rounded-lg border border-[#30363D] bg-[#161B22] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
              <h2 className="font-heading text-lg text-[#F0F6FC]">
                {editor.kind === "edit" ? "Edit box" : "New box"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                aria-label="Close"
                className="rounded p-1 text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Name</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Madison Summer"
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Tier</span>
                <select
                  value={form.tier}
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] focus:border-[#E8923A] focus:outline-none"
                >
                  {tiers.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}{t.description ? ` — ${t.description}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="What lives in this box?"
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Capacity (optional)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.total_capacity}
                  onChange={(e) => setForm((f) => ({ ...f, total_capacity: e.target.value }))}
                  placeholder="e.g. 24"
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                />
              </label>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#21262D] px-4 py-3">
              <button
                type="button"
                onClick={closeEditor}
                disabled={busy}
                className="rounded px-3 py-1.5 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-[#E8923A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d17d28] disabled:opacity-50"
              >
                {busy ? "Saving…" : editor.kind === "edit" ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {addTierOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add tier"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !tierBusy && setAddTierOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitNewTier}
            className="w-full max-w-md rounded-lg border border-[#30363D] bg-[#161B22] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
              <h2 className="font-heading text-lg text-[#F0F6FC]">Add Tier</h2>
              <button
                type="button"
                onClick={() => setAddTierOpen(false)}
                disabled={tierBusy}
                aria-label="Close"
                className="rounded p-1 text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#1F2937] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Label</span>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newTierLabel}
                  onChange={(e) => setNewTierLabel(e.target.value)}
                  placeholder="e.g. Saltwater, Steelhead, Travel"
                  maxLength={TIER_LABEL_MAX}
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#A8B2BD]">Description (optional)</span>
                <textarea
                  value={newTierDesc}
                  onChange={(e) => setNewTierDesc(e.target.value)}
                  rows={2}
                  placeholder="When and where this tier fits"
                  maxLength={TIER_DESCRIPTION_MAX}
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                />
              </label>
              {addTierError && (
                <p className="text-xs text-red-400">{addTierError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#21262D] px-4 py-3">
              <button
                type="button"
                onClick={() => setAddTierOpen(false)}
                disabled={tierBusy}
                className="rounded px-3 py-1.5 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={tierBusy}
                className="rounded bg-[#E8923A] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d17d28] disabled:opacity-50"
              >
                {tierBusy ? "Saving…" : "Add"}
              </button>
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
    <div className="relative rounded-lg border border-[#21262D] bg-[#161B22] hover:border-[#E8923A]/40 transition-colors">
      <Link href={`/flies/boxes/${b.id}`} className="block p-4 pr-12">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded bg-[#0D1117] flex items-center justify-center">
            <Box className="h-5 w-5 text-[#6E7681]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[#F0F6FC] font-semibold text-sm truncate">
              {b.name}
              {b.is_default && (
                <span className="ml-2 rounded bg-[#0BA5C7]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#0BA5C7]">
                  Default
                </span>
              )}
            </h3>
            {b.description && (
              <p className="text-xs text-[#A8B2BD] mt-0.5 line-clamp-2">{b.description}</p>
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
          className="rounded p-1.5 text-[#6E7681] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {openMenuId === b.id && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[#30363D] bg-[#161B22] shadow-lg z-20 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" role="menuitem" onClick={() => onEdit(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#F0F6FC] hover:bg-[#1F2937]">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            {!b.is_default && (
              <button type="button" role="menuitem" onClick={() => onSetDefault(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#F0F6FC] hover:bg-[#1F2937]">
                <Star className="h-3.5 w-3.5" />
                Set as default
              </button>
            )}
            <button type="button" role="menuitem" onClick={() => onDelete(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-400 hover:bg-[#1F2937]">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

