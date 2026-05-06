"use client";

/**
 * EditBoxDialog — edit name, tier, description, icon, capacity of an existing
 * fly box. Mirrors CreateBoxDialog. Also exposes a "Delete box" action with
 * confirmation; deletes are blocked by the API for default boxes and the
 * user's last remaining box.
 */
import { useState } from "react";
import { X, Crosshair, Backpack, Archive, Folder, Loader2, Trash2 } from "lucide-react";
import type { FlyBox, FlyBoxTier } from "@/lib/db/fly-boxes";

interface Props {
  box: FlyBox;
  onClose: () => void;
  onSaved: (updated: FlyBox) => void;
  onDeleted: () => void;
}

const TIERS: {
  key: FlyBoxTier;
  label: string;
  description: string;
  icon: typeof Crosshair;
}[] = [
  {
    key: "kill",
    label: "Kill Box",
    description: "Chest-worn. Top 12-20 flies. No hesitation.",
    icon: Crosshair,
  },
  {
    key: "support",
    label: "Support Box",
    description: "Pack/vest. Variations and situational patterns.",
    icon: Backpack,
  },
  {
    key: "archive",
    label: "Archive",
    description: "Storage. Modular inserts you don't bring streamside.",
    icon: Archive,
  },
  {
    key: "custom",
    label: "Custom",
    description: "Trip, region, or theme — your own structure.",
    icon: Folder,
  },
];

export default function EditBoxDialog({ box, onClose, onSaved, onDeleted }: Props) {
  const [name, setName] = useState(box.name);
  const [tier, setTier] = useState<FlyBoxTier>(box.tier);
  const [description, setDescription] = useState(box.description ?? "");
  const [icon, setIcon] = useState(box.icon ?? "");
  const [capacity, setCapacity] = useState<number | "">(
    typeof box.total_capacity === "number" ? box.total_capacity : "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/fly-boxes?id=${box.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tier,
          description: description.trim() || null,
          icon: icon.trim() || null,
          total_capacity: capacity === "" ? null : Number(capacity),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to save");
        return;
      }
      const data = (await res.json()) as { box: FlyBox };
      onSaved(data.box);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/fly-boxes?id=${box.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Delete failed");
        setConfirmDelete(false);
        return;
      }
      onDeleted();
    } catch {
      setError("Network error");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#0D1117] border border-[#30363D] shadow-2xl flex flex-col max-h-[90vh]">
        <header className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
          <h2 className="font-heading text-lg font-bold text-[#F0F6FC]">Edit fly box</h2>
          <button
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Tier picker */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-2">
              Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => {
                const active = tier === t.key;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTier(t.key)}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-[#E8923A] bg-[#E8923A]/10"
                        : "border-[#21262D] bg-[#161B22] hover:border-[#E8923A]/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon
                        className={`h-3.5 w-3.5 ${active ? "text-[#E8923A]" : "text-[#A8B2BD]"}`}
                      />
                      <span
                        className={`text-xs font-semibold ${active ? "text-[#F0F6FC]" : "text-[#A8B2BD]"}`}
                      >
                        {t.label}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#6E7681] leading-tight">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this box for?"
              rows={2}
              className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎯"
                maxLength={4}
                className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8B2BD] mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                value={capacity === "" ? "" : String(capacity)}
                onChange={(e) =>
                  setCapacity(
                    e.target.value === ""
                      ? ""
                      : Math.max(1, parseInt(e.target.value, 10)),
                  )
                }
                placeholder="e.g. 24"
                className="w-full bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
              />
            </div>
          </div>

          {/* Danger zone */}
          {!box.is_default && (
            <div className="mt-4 pt-3 border-t border-[#21262D]">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#A8B2BD] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete this box
                </button>
              ) : (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
                  <p className="text-xs text-[#F0F6FC] mb-2">
                    Delete <span className="font-semibold">{box.name}</span>? Flies in
                    this box stay in your collection if they&apos;re also in another box;
                    otherwise they remain accessible from My Flies.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-[#A8B2BD] hover:text-[#F0F6FC]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-[#21262D] px-4 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save changes
          </button>
        </footer>
      </div>
    </div>
  );
}
