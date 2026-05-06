"use client";

/**
 * ManageMembershipSheet — multi-select sheet to add/remove a fly Stock Entry
 * (user_fly_box row) from one or more named boxes (fly_boxes rows).
 *
 * Membership is many-to-many: a single Stock Entry can live in Kill Box AND
 * Madison Trip Box. Counts and recipe stay synced because the underlying row
 * is the same.
 *
 * Used from:
 *   - Box detail page: "Move to other boxes"
 *   - Canonical fly page chip strip: "Manage memberships"
 *   - My Flies tile: "Edit boxes"
 */
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Loader2, Crosshair, Backpack, Archive, Folder, Check } from "lucide-react";
import type { FlyBoxTier } from "@/lib/db/fly-boxes";
import CreateBoxDialog from "./CreateBoxDialog";

interface BoxLite {
  id: string;
  name: string;
  tier: FlyBoxTier;
  icon?: string | null;
  is_default: boolean;
}

interface Props {
  /** The user_fly_box.id of the Stock Entry whose memberships we're managing. */
  userFlyBoxId: string;
  /** Display name for the modal title. */
  flyName: string;
  onClose: () => void;
  /** Optional callback when memberships change so the parent can refresh. */
  onChange?: () => void;
}

const TIER_META: Record<FlyBoxTier, { icon: typeof Crosshair; accent: string }> = {
  kill: { icon: Crosshair, accent: "text-[#E8923A]" },
  support: { icon: Backpack, accent: "text-[#0BA5C7]" },
  archive: { icon: Archive, accent: "text-[#A8B2BD]" },
  custom: { icon: Folder, accent: "text-[#A8B2BD]" },
};

const TIER_ORDER: FlyBoxTier[] = ["kill", "support", "archive", "custom"];

export default function ManageMembershipSheet({
  userFlyBoxId,
  flyName,
  onClose,
  onChange,
}: Props) {
  const [boxes, setBoxes] = useState<BoxLite[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [originalMemberships, setOriginalMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the user's boxes + this entry's current memberships
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [boxesRes, currentRes] = await Promise.all([
          fetch("/api/fly-boxes").then((r) => r.json()),
          // Reuse the membership query at the entry level by fetching all the
          // user's memberships and filtering. This API doesn't exist yet, so
          // we fetch each box's memberships and check.
          (async () => {
            const r = await fetch("/api/fly-boxes");
            const data = (await r.json()) as { boxes: BoxLite[] };
            const checks = await Promise.all(
              (data.boxes ?? []).map(async (b) => {
                const mr = await fetch(`/api/fly-boxes/${b.id}/membership`);
                const md = (await mr.json()) as {
                  memberships: { user_fly_box_id: string }[];
                };
                const has = (md.memberships ?? []).some(
                  (m) => m.user_fly_box_id === userFlyBoxId,
                );
                return { boxId: b.id, has };
              }),
            );
            return checks;
          })(),
        ]);
        if (cancelled) return;

        const allBoxes = (boxesRes.boxes ?? []) as BoxLite[];
        const set = new Set<string>();
        for (const c of currentRes) if (c.has) set.add(c.boxId);

        setBoxes(allBoxes);
        setMemberships(set);
        setOriginalMemberships(new Set(set));
      } catch (e) {
        if (!cancelled) {
          console.error("[ManageMembershipSheet] load error:", e);
          setError("Couldn't load your boxes. Try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userFlyBoxId]);

  function toggleBox(boxId: string) {
    setMemberships((prev) => {
      const next = new Set(prev);
      if (next.has(boxId)) next.delete(boxId);
      else next.add(boxId);
      return next;
    });
  }

  function handleCreated(newBox: { id: string; name: string; tier: FlyBoxTier }) {
    setBoxes((prev) => [
      ...prev,
      { id: newBox.id, name: newBox.name, tier: newBox.tier, icon: null, is_default: false },
    ]);
    setMemberships((prev) => new Set([...prev, newBox.id]));
    setCreateOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const toAdd: string[] = [];
      const toRemove: string[] = [];
      for (const id of memberships) if (!originalMemberships.has(id)) toAdd.push(id);
      for (const id of originalMemberships) if (!memberships.has(id)) toRemove.push(id);

      // Block removing the last membership (orphan protection).
      if (toRemove.length > 0 && memberships.size === 0) {
        setError(
          "This fly must live in at least one box. Add it to another box first, or remove it entirely from My Flies.",
        );
        return;
      }

      const ops = [
        ...toAdd.map((boxId) =>
          fetch(`/api/fly-boxes/${boxId}/membership`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_fly_box_id: userFlyBoxId }),
          }),
        ),
        ...toRemove.map((boxId) =>
          fetch(
            `/api/fly-boxes/${boxId}/membership?entry=${encodeURIComponent(userFlyBoxId)}`,
            { method: "DELETE" },
          ),
        ),
      ];
      const results = await Promise.all(ops);
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        setError(`${failed.length} update(s) failed`);
        return;
      }
      onChange?.();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const grouped = useMemo(() => {
    const m: Record<FlyBoxTier, BoxLite[]> = {
      kill: [],
      support: [],
      archive: [],
      custom: [],
    };
    for (const b of boxes) m[b.tier].push(b);
    return m;
  }, [boxes]);

  const dirty =
    [...memberships].some((id) => !originalMemberships.has(id)) ||
    [...originalMemberships].some((id) => !memberships.has(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#0D1117] border border-[#30363D] shadow-2xl flex flex-col max-h-[80vh]">
        <header className="flex items-center justify-between border-b border-[#21262D] px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-heading text-base font-bold text-[#F0F6FC] truncate">
              Manage box memberships
            </h2>
            <p className="text-xs text-[#6E7681] truncate">{flyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E7681] hover:text-[#F0F6FC] flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#6E7681]" />
            </div>
          ) : boxes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[#A8B2BD] mb-3">
                You don&apos;t have any boxes yet.
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#F0A65A]"
              >
                <Plus className="h-4 w-4" /> Create your first box
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {TIER_ORDER.map((tier) => {
                const list = grouped[tier];
                if (list.length === 0) return null;
                const meta = TIER_META[tier];
                const Icon = meta.icon;
                return (
                  <section key={tier}>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Icon className={`h-3 w-3 ${meta.accent}`} />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${meta.accent}`}
                      >
                        {tier}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {list.map((b) => {
                        const checked = memberships.has(b.id);
                        return (
                          <label
                            key={b.id}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                              checked
                                ? "border-[#E8923A]/50 bg-[#E8923A]/5"
                                : "border-[#21262D] bg-[#161B22] hover:border-[#30363D]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBox(b.id)}
                              className="w-4 h-4 accent-[#E8923A]"
                            />
                            {b.icon && <span className="text-sm">{b.icon}</span>}
                            <span className="flex-1 text-sm text-[#F0F6FC] truncate">
                              {b.name}
                            </span>
                            {b.is_default && (
                              <span className="text-[9px] uppercase tracking-wider text-[#6E7681]">
                                Default
                              </span>
                            )}
                            {checked && (
                              <Check className="h-3.5 w-3.5 text-[#E8923A] flex-shrink-0" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#30363D] px-3 py-2 text-xs text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New box
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
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
            disabled={saving || !dirty || loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
        </footer>

        {createOpen && (
          <CreateBoxDialog onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
        )}
      </div>
    </div>
  );
}
