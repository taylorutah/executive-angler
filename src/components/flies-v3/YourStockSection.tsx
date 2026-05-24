"use client";
/**
 * YourStockSection — the user's saved versions of a fly on the canonical
 * detail page. Lists each configuration with inline counts, box badges,
 * and tie-next/favorite toggles. "+ Add another version" opens
 * ConfigureSheet.
 *
 * Each row has a per-row "manage boxes" popover (Box icon) and a leading
 * select checkbox that drives a sticky bulk-manage panel.
 *
 * Empty state (logged in, no versions) renders an explanation + Add a version.
 * Anonymous viewers see "Log in to track your stock of this fly."
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Wrench, Pencil, Trash2, Plus, Box as BoxIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Fly, FlyConfigurationWithBoxes } from "@/types/flies";
import ConfigureSheet from "./ConfigureSheet";
import { summarizeVersion } from "./summarize-version";

interface BoxOption { id: string; name: string; tier?: string }

interface Props {
  fly: Fly;
  isLoggedIn: boolean;
  versions: FlyConfigurationWithBoxes[];
  boxes: BoxOption[];
  loginRedirectPath: string;
}

export default function YourStockSection({ fly, isLoggedIn, versions, boxes, loginRedirectPath }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<FlyConfigurationWithBoxes | null>(null);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkOpen(false);
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] p-5 my-8">
        <h2 className="font-heading text-xl mb-2">Your stock</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          <a href={`/login?redirect=${encodeURIComponent(loginRedirectPath)}`} className="text-[#E8923A] hover:underline">
            Log in
          </a>{" "}
          to track your versions of this fly — sizes, beads, body colors, and how many you have in each box.
        </p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] p-5 my-8">
        <h2 className="font-heading text-xl mb-2">Your stock</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          You haven&apos;t saved a version of this fly yet. Add one to track it in your boxes and on the workbench.
        </p>
        <Button variant="solid" size="sm" icon={Plus} onClick={() => setCreating(true)}>
          Add a version
        </Button>

        {creating && (
          <ConfigureSheet
            fly={fly}
            boxes={boxes}
            open={creating}
            onClose={() => setCreating(false)}
            onSaved={() => router.refresh()}
          />
        )}
      </div>
    );
  }

  const selectedVersions = versions.filter((v) => selected.has(v.id));

  return (
    <section className="my-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-heading text-xl">Your stock</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            You tie this fly in {versions.length} version{versions.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button variant="pill" size="sm" icon={Plus} onClick={() => setCreating(true)}>
          Add another version
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-14 z-30 mb-2 flex items-center justify-between gap-3 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-3 py-2 shadow-sm">
          <span className="text-xs font-medium text-[#E8923A]">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="solid" size="sm" icon={BoxIcon} onClick={() => setBulkOpen(true)}>
              Manage boxes…
            </Button>
            <Button variant="outline" size="sm" icon={X} onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {bulkOpen && (
        <BulkManageBoxesPanel
          selectedVersions={selectedVersions}
          boxes={boxes}
          onClose={() => setBulkOpen(false)}
          onChanged={() => router.refresh()}
        />
      )}

      <ul className="space-y-2">
        {versions.map((v) => (
          <VersionCard
            key={v.id}
            version={v}
            fly={fly}
            boxes={boxes}
            selected={selected.has(v.id)}
            onToggleSelect={() => toggleSelect(v.id)}
            onEdit={() => setEditing(v)}
          />
        ))}
      </ul>

      {creating && (
        <ConfigureSheet
          fly={fly}
          boxes={boxes}
          open={creating}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <ConfigureSheet
          fly={fly}
          existing={editing}
          boxes={boxes}
          open={!!editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function VersionCard({
  version,
  fly,
  boxes,
  selected,
  onToggleSelect,
  onEdit,
}: {
  version: FlyConfigurationWithBoxes;
  fly: Fly;
  boxes: BoxOption[];
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [boxesOpen, setBoxesOpen] = useState(false);

  // Optimistic state — keeps the UI in sync with the click instantly,
  // independent of router.refresh() round-trip latency (notably slow under
  // Safari's stricter App Router cache behavior).
  const [optimisticFavorite, setOptimisticFavorite] = useState(version.is_favorite);
  const [optimisticTieNext, setOptimisticTieNext] = useState(version.is_tie_next);
  const [optimisticTied, setOptimisticTied] = useState(version.tied_count);

  // Reconcile optimistic state when fresh server props arrive.
  useEffect(() => { setOptimisticFavorite(version.is_favorite); }, [version.is_favorite]);
  useEffect(() => { setOptimisticTieNext(version.is_tie_next); }, [version.is_tie_next]);
  useEffect(() => { setOptimisticTied(version.tied_count); }, [version.tied_count]);

  const summary = summarizeVersion(version);
  const deficit = Math.max(0, version.target_count - optimisticTied - version.bought_count);

  async function toggle(field: "is_favorite" | "is_tie_next") {
    const prev = field === "is_favorite" ? optimisticFavorite : optimisticTieNext;
    const newVal = !prev;
    if (field === "is_favorite") setOptimisticFavorite(newVal);
    else setOptimisticTieNext(newVal);
    setBusy(true);
    try {
      const res = await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: version.id,
          [field]: newVal,
          ...(field === "is_tie_next" ? { tie_next_status: newVal ? "wanted" : "none" } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      if (field === "is_favorite") setOptimisticFavorite(prev);
      else setOptimisticTieNext(prev);
    } finally {
      setBusy(false);
    }
  }

  async function bumpTied(delta: number) {
    const prev = optimisticTied;
    const next = Math.max(0, prev + delta);
    setOptimisticTied(next);
    setBusy(true);
    try {
      const res = await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: version.id, tied_count: next }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      setOptimisticTied(prev);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete this version of ${fly.name}? Your catches stay intact.`)) return;
    setBusy(true);
    try {
      await fetch(`/api/fishing/fly-configurations?id=${encodeURIComponent(version.id)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const favoriteTip = optimisticFavorite
    ? `Remove ${summary} from your favorites`
    : `Mark ${summary} as a favorite version`;
  const tieNextTip = optimisticTieNext
    ? `Remove ${summary} from your "Tie Next" list`
    : `Add ${summary} to your "Tie Next" list (workbench queue)`;
  const boxTip = version.in_boxes.length > 0
    ? `Manage which fly boxes hold ${summary} (currently in ${version.in_boxes.length})`
    : `Add ${summary} to a fly box`;

  return (
    <li className={`relative rounded-lg border p-4 transition-colors ${
      selected
        ? "border-[#E8923A]/60 bg-[#E8923A]/5"
        : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D]"
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${summary}`}
          className="mt-1 h-4 w-4 flex-shrink-0 accent-[#E8923A] cursor-pointer"
        />
        <div className="flex items-start justify-between gap-3 flex-wrap flex-1 min-w-0">
          <div className="min-w-0">
            <p className="font-medium">{summary}</p>
            {version.in_boxes.length > 0 && (
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                In: {version.in_boxes.map((b) => b.box_name).join(", ")}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span>
                Tied <span className="font-semibold">{optimisticTied}</span> / Target{" "}
                <span className="font-semibold">{version.target_count}</span>
              </span>
              {deficit > 0 && (
                <span className="text-[#E8923A]">need {deficit} more</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={() => bumpTied(1)}
              title={`Tied one more — increase count for ${summary}`}
              aria-label={`Tied one more of ${summary}`}
              className="h-7 w-7 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-xs hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
            >
              +
            </button>
            <button
              type="button"
              disabled={busy || optimisticTied === 0}
              onClick={() => bumpTied(-1)}
              title={`Lost or used one — decrease count for ${summary}`}
              aria-label={`Used or lost one of ${summary}`}
              className="h-7 w-7 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-xs hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle("is_favorite")}
              title={favoriteTip}
              aria-label={favoriteTip}
              aria-pressed={optimisticFavorite}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs transition-colors ${
                optimisticFavorite
                  ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                  : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] hover:text-rose-500 hover:border-rose-500/40"
              }`}
            >
              <Heart className="h-3.5 w-3.5" fill={optimisticFavorite ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle("is_tie_next")}
              title={tieNextTip}
              aria-label={tieNextTip}
              aria-pressed={optimisticTieNext}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs transition-colors ${
                optimisticTieNext
                  ? "border-[#E8923A] bg-[#E8923A] text-white shadow-sm"
                  : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] hover:text-[#E8923A] hover:border-[#E8923A]/40"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setBoxesOpen((o) => !o)}
                title={boxTip}
                aria-label={boxTip}
                aria-haspopup="dialog"
                aria-expanded={boxesOpen}
                className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs transition-colors ${
                  version.in_boxes.length > 0
                    ? "border-[#0BA5C7] bg-[#0BA5C7] text-white shadow-sm"
                    : boxesOpen
                      ? "border-[#0BA5C7]/60 bg-[#0BA5C7]/15 text-[#0BA5C7]"
                      : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] hover:text-[#0BA5C7] hover:border-[#0BA5C7]/40"
                }`}
              >
                <BoxIcon className="h-3.5 w-3.5" />
              </button>
              {boxesOpen && (
                <ManageBoxesPopover
                  version={version}
                  boxes={boxes}
                  onClose={() => setBoxesOpen(false)}
                  onChanged={() => router.refresh()}
                />
              )}
            </div>
            <button
              type="button"
              onClick={onEdit}
              title={`Edit ${summary} — change size, materials, counts, or notes`}
              aria-label={`Edit ${summary}`}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={remove}
              title={`Delete ${summary} from your stock — past catches stay intact`}
              aria-label={`Delete ${summary}`}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function ManageBoxesPopover({
  version,
  boxes,
  onClose,
  onChanged,
}: {
  version: FlyConfigurationWithBoxes;
  boxes: BoxOption[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initial = new Set(version.in_boxes.map((b) => b.box_id));
  const [membership, setMembership] = useState<Set<string>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyBoxId, setBusyBoxId] = useState<string | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function toggleBox(boxId: string) {
    const wasIn = membership.has(boxId);
    setBusyBoxId(boxId);
    setError(null);
    setMembership((prev) => {
      const next = new Set(prev);
      if (wasIn) next.delete(boxId);
      else next.add(boxId);
      return next;
    });
    try {
      const res = wasIn
        ? await fetch(
            `/api/fishing/fly-configurations/box?configuration_id=${encodeURIComponent(version.id)}&box_id=${encodeURIComponent(boxId)}`,
            { method: "DELETE" },
          )
        : await fetch("/api/fishing/fly-configurations/box", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ configuration_id: version.id, box_id: boxId }),
          });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Failed");
      }
      onChanged();
    } catch (e) {
      setMembership((prev) => {
        const next = new Set(prev);
        if (wasIn) next.add(boxId);
        else next.delete(boxId);
        return next;
      });
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusyBoxId(null);
    }
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Manage which boxes this version is in"
      className="absolute right-0 top-9 z-40 w-64 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] bg-[var(--color-surface,#fff)] dark:bg-[#161B22] p-3 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">In which boxes?</p>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-text-muted)] hover:text-[#E8923A]"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {boxes.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          You don&apos;t have any boxes yet. Create one from the Flies hub.
        </p>
      ) : (
        <ul className="space-y-1 max-h-64 overflow-auto">
          {boxes.map((b) => {
            const checked = membership.has(b.id);
            const busy = busyBoxId === b.id;
            return (
              <li key={b.id}>
                <label className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] cursor-pointer ${busy ? "opacity-60" : ""}`}>
                  <span className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busy}
                      onChange={() => toggleBox(b.id)}
                      className="h-4 w-4 accent-[#E8923A] cursor-pointer"
                    />
                    <span className="truncate font-medium">{b.name}</span>
                  </span>
                  {b.tier && !b.name.toLowerCase().includes(b.tier.toLowerCase()) && (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] shrink-0">
                      {b.tier}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
      <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">Changes save instantly.</p>
    </div>
  );
}

function BulkManageBoxesPanel({
  selectedVersions,
  boxes,
  onClose,
  onChanged,
}: {
  selectedVersions: FlyConfigurationWithBoxes[];
  boxes: BoxOption[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [membershipByBox, setMembershipByBox] = useState<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    for (const b of boxes) {
      const ids = new Set<string>();
      for (const v of selectedVersions) {
        if (v.in_boxes.some((m) => m.box_id === b.id)) ids.add(v.id);
      }
      map.set(b.id, ids);
    }
    return map;
  });
  const [busyBoxId, setBusyBoxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function stateFor(boxId: string): "checked" | "indeterminate" | "unchecked" {
    const ids = membershipByBox.get(boxId);
    if (!ids || ids.size === 0) return "unchecked";
    if (ids.size === selectedVersions.length) return "checked";
    return "indeterminate";
  }

  async function toggleBox(boxId: string) {
    const state = stateFor(boxId);
    const currentIds = membershipByBox.get(boxId) ?? new Set<string>();
    const shouldAdd = state !== "checked";

    setBusyBoxId(boxId);
    setError(null);

    const targets: { configId: string; addOrRemove: "add" | "remove" }[] = [];
    if (shouldAdd) {
      for (const v of selectedVersions) {
        if (!currentIds.has(v.id)) targets.push({ configId: v.id, addOrRemove: "add" });
      }
    } else {
      for (const v of selectedVersions) {
        if (currentIds.has(v.id)) targets.push({ configId: v.id, addOrRemove: "remove" });
      }
    }

    const results = await Promise.allSettled(
      targets.map((t) =>
        t.addOrRemove === "add"
          ? fetch("/api/fishing/fly-configurations/box", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ configuration_id: t.configId, box_id: boxId }),
            }).then((r) => (r.ok ? { ok: true, configId: t.configId } : { ok: false, configId: t.configId }))
          : fetch(
              `/api/fishing/fly-configurations/box?configuration_id=${encodeURIComponent(t.configId)}&box_id=${encodeURIComponent(boxId)}`,
              { method: "DELETE" },
            ).then((r) => (r.ok ? { ok: true, configId: t.configId } : { ok: false, configId: t.configId })),
      ),
    );

    const successIds = new Set<string>();
    let failures = 0;
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value.ok) {
        successIds.add(r.value.configId);
      } else {
        failures += 1;
        if (r.status === "fulfilled") successIds.delete(r.value.configId);
        // failures: just skip — original membership stays
      }
      void i;
    });

    setMembershipByBox((prev) => {
      const next = new Map(prev);
      const ids = new Set(prev.get(boxId) ?? []);
      if (shouldAdd) {
        for (const id of successIds) ids.add(id);
      } else {
        for (const id of successIds) ids.delete(id);
      }
      next.set(boxId, ids);
      return next;
    });

    if (failures > 0) {
      setError(`${failures} update${failures === 1 ? "" : "s"} failed. The rest were saved.`);
    }
    setBusyBoxId(null);
    onChanged();
  }

  return (
    <div className="mb-3 rounded-lg border border-[#E8923A]/40 bg-[var(--color-surface,#fff)] dark:bg-[#161B22] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading text-base">Manage boxes for {selectedVersions.length} version{selectedVersions.length === 1 ? "" : "s"}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            A square box means all selected versions are in that box; an empty box means none; a dashed box means some.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      {boxes.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          You don&apos;t have any boxes yet. Create one from the Flies hub.
        </p>
      ) : (
        <ul className="grid gap-1 sm:grid-cols-2">
          {boxes.map((b) => {
            const state = stateFor(b.id);
            const busy = busyBoxId === b.id;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleBox(b.id)}
                  className={`w-full flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    state === "checked"
                      ? "border-[#E8923A]/40 bg-[#E8923A]/10 text-[var(--color-text)]"
                      : state === "indeterminate"
                        ? "border-[#0BA5C7]/40 bg-[#0BA5C7]/10"
                        : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
                  } ${busy ? "opacity-60" : ""}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                        state === "checked"
                          ? "border-[#E8923A] bg-[#E8923A] text-white"
                          : state === "indeterminate"
                            ? "border-[#0BA5C7] bg-[#0BA5C7] text-white"
                            : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D]"
                      }`}
                    >
                      {state === "checked" && <span className="text-[10px] leading-none">✓</span>}
                      {state === "indeterminate" && <span className="text-[10px] leading-none">–</span>}
                    </span>
                    <span className="truncate font-medium">{b.name}</span>
                  </span>
                  {b.tier && !b.name.toLowerCase().includes(b.tier.toLowerCase()) && (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] shrink-0">
                      {b.tier}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
