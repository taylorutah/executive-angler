"use client";
/**
 * BoxesManager — full CRUD on the user's fly_boxes from /flies/boxes.
 *
 * Server page hands us the initial list. All mutations call /api/fly-boxes
 * (POST / PATCH / DELETE) and refresh the local list optimistically. We
 * also call router.refresh() after mutations so the page (and its server
 * components) re-render with fresh DB state.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Plus, MoreVertical, Pencil, Trash2, Star, X, Check } from "lucide-react";
import type { FlyBoxV2, FlyBoxTier, BoxStats } from "@/lib/db/fly-v2";

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

const TIER_LABELS: Record<FlyBoxTier, string> = {
  kill: "Kill",
  support: "Support",
  archive: "Archive",
  custom: "Custom",
};

const TIER_DESCRIPTIONS_DEFAULT: Record<FlyBoxTier, string> = {
  kill: "Chest-worn, 12–20 highest-confidence flies",
  support: "Pack/vest variations and situational patterns",
  archive: "Truck/garage modular inserts",
  custom: "Trip-specific, regional, themed",
};

type EditorMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; box: FlyBoxV2 };

interface FormState {
  name: string;
  tier: FlyBoxTier;
  description: string;
  total_capacity: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  tier: "custom",
  description: "",
  total_capacity: "",
};

export default function BoxesManager({
  initialBoxes,
  initialStats,
  initialTierDescriptions = {},
}: {
  initialBoxes: FlyBoxV2[];
  initialStats: Record<string, BoxStats>;
  initialTierDescriptions?: Record<string, string>;
}) {
  const router = useRouter();
  const [boxes, setBoxes] = useState<FlyBoxV2[]>(initialBoxes);
  const [stats] = useState<Record<string, BoxStats>>(initialStats);
  const [editor, setEditor] = useState<EditorMode>({ kind: "closed" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [tierOverrides, setTierOverrides] =
    useState<Record<string, string>>(initialTierDescriptions);
  const [editingTier, setEditingTier] = useState<FlyBoxTier | null>(null);
  const [tierDraft, setTierDraft] = useState("");
  const [tierBusy, setTierBusy] = useState(false);

  function descriptionFor(tier: FlyBoxTier): string {
    const override = tierOverrides[tier];
    return typeof override === "string" && override.trim()
      ? override
      : TIER_DESCRIPTIONS_DEFAULT[tier];
  }

  function startEditTier(tier: FlyBoxTier) {
    setTierDraft(descriptionFor(tier));
    setEditingTier(tier);
  }

  function cancelEditTier() {
    setEditingTier(null);
    setTierDraft("");
  }

  async function saveTier(tier: FlyBoxTier) {
    const next = tierDraft.trim();
    // Empty = reset to default (clear override server-side).
    if (next === descriptionFor(tier).trim() && (next.length > 0 || !tierOverrides[tier])) {
      cancelEditTier();
      return;
    }
    setTierBusy(true);
    try {
      const res = await fetch("/api/profile/tier-descriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier_descriptions: { [tier]: next || null } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save.");
      setTierOverrides((json.tier_descriptions ?? {}) as Record<string, string>);
      cancelEditTier();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tier description.");
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

  const groups: Record<FlyBoxTier, FlyBoxV2[]> = {
    kill: [], support: [], archive: [], custom: [],
  };
  for (const b of boxes) groups[b.tier].push(b);

  function openCreate() {
    setForm(EMPTY_FORM);
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
      <div className="mb-6 flex items-center justify-end">
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
        {(Object.keys(TIER_LABELS) as FlyBoxTier[]).map((tier) => {
          const items = groups[tier];
          if (items.length === 0) return null;
          return (
            <div key={tier}>
              <div className="mb-3">
                <h2 className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#0BA5C7]">
                  {TIER_LABELS[tier]}
                </h2>
                {editingTier === tier ? (
                  <div className="mt-1 flex items-start gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={tierDraft}
                      onChange={(e) => setTierDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveTier(tier);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEditTier();
                        }
                      }}
                      maxLength={200}
                      placeholder={TIER_DESCRIPTIONS_DEFAULT[tier]}
                      disabled={tierBusy}
                      className="flex-1 rounded border border-[#30363D] bg-[#0D1117] px-2 py-1 text-xs text-[#F0F6FC] placeholder-[#484F58] focus:border-[#E8923A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveTier(tier)}
                      disabled={tierBusy}
                      aria-label="Save description"
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
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditTier(tier)}
                    aria-label={`Edit ${TIER_LABELS[tier]} description`}
                    title="Click to edit"
                    className="group inline-flex items-center gap-1.5 rounded text-left text-xs text-[#6E7681] hover:text-[#F0F6FC]"
                  >
                    <span className="border-b border-dashed border-transparent group-hover:border-[#484F58]">
                      {descriptionFor(tier)}
                    </span>
                    <Pencil className="h-3 w-3 text-[#484F58] group-hover:text-[#E8923A]" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((b) => (
                  <div
                    key={b.id}
                    className="relative rounded-lg border border-[#21262D] bg-[#161B22] hover:border-[#E8923A]/40 transition-colors"
                  >
                    <Link
                      href={`/flies/boxes/${b.id}`}
                      className="block p-4 pr-12"
                    >
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
                            <p className="text-xs text-[#A8B2BD] mt-0.5 line-clamp-2">
                              {b.description}
                            </p>
                          )}
                          <BoxStatLine stats={stats[b.id]} />
                        </div>
                      </div>
                    </Link>

                    <div
                      className="absolute top-2 right-2"
                      ref={openMenuId === b.id ? menuRef : null}
                    >
                      <button
                        type="button"
                        aria-label="Box actions"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === b.id ? null : b.id);
                        }}
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
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => openEdit(b)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#F0F6FC] hover:bg-[#1F2937]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          {!b.is_default && (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => setDefault(b)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#F0F6FC] hover:bg-[#1F2937]"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Set as default
                            </button>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => deleteBox(b)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-400 hover:bg-[#1F2937]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

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
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as FlyBoxTier }))}
                  className="mt-1 w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm text-[#F0F6FC] focus:border-[#E8923A] focus:outline-none"
                >
                  {(Object.keys(TIER_LABELS) as FlyBoxTier[]).map((t) => (
                    <option key={t} value={t}>
                      {TIER_LABELS[t]} — {descriptionFor(t)}
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
    </>
  );
}
