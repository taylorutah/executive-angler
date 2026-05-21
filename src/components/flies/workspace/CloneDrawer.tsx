"use client";
/**
 * CloneDrawer — inline drawer/sheet for cloning a canonical fly into the
 * user's collection. Replaces the full-page nav to /journal/flies/new.
 *
 * Flow:
 *   1. Open with `canonicalFlyId` set.
 *   2. Fetch clone source (existing /api/fishing/flies/clone-source).
 *   3. User edits name + optional category + notes.
 *   4. Submit → POST /api/fishing/flies (clone_image_from_url passed
 *      automatically so the canonical's hero image carries over).
 *   5. On success, call onCreated with the new fly so the parent workspace
 *      can replace its optimistic placeholder with the real row.
 */
import { useEffect, useState } from "react";
import ResponsiveDrawer from "./ResponsiveDrawer";
import type { Fly } from "@/types/flies";

interface Props {
  open: boolean;
  canonicalFlyId: string | null;
  onOpenChange: (next: boolean) => void;
  /** Called when the user clicks Save, BEFORE the server responds.
   *  Used to push an optimistic placeholder into the parent's list. */
  onOptimisticStart: (placeholderName: string) => void;
  /** Called when the server responds with the real fly row. */
  onCreated: (fly: Fly) => void;
  /** Called when the server returns an error after onOptimisticStart fired. */
  onFailure: (error: string) => void;
}

interface CloneSource {
  sourceName: string;
  sourceSlug: string;
  sourceImageUrl: string | null;
  initial: {
    name?: string;
    type?: string;
    description?: string;
    video_url?: string;
  };
}

export default function CloneDrawer({
  open,
  canonicalFlyId,
  onOpenChange,
  onOptimisticStart,
  onCreated,
  onFailure,
}: Props) {
  const [source, setSource] = useState<CloneSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state.
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !canonicalFlyId) {
      setSource(null);
      setName("");
      setCategory("");
      setNotes("");
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(
      `/api/fishing/flies/clone-source?canonicalId=${encodeURIComponent(canonicalFlyId)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        const src = data as CloneSource;
        setSource(src);
        setName(src.initial.name ?? `${src.sourceName} (my version)`);
        setCategory(src.initial.type ?? "");
        setNotes(src.initial.description ?? "");
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load source fly");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, canonicalFlyId]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!source) return;
    setError(null);
    setBusy(true);

    // Pop an optimistic card into the parent list immediately. The drawer
    // can stay open until the server resolves (visible feedback that the
    // fly already exists in the list behind the overlay).
    onOptimisticStart(name.trim());

    const form = new FormData();
    form.set("name", name.trim());
    if (category) form.set("type", category);
    if (notes) form.set("description", notes);
    if (source.sourceImageUrl) {
      form.set("clone_image_from_url", source.sourceImageUrl);
    }

    try {
      const res = await fetch("/api/fishing/flies", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = await res.json();
        const msg = body.error ?? "Failed to clone";
        setError(msg);
        onFailure(msg);
        setBusy(false);
        return;
      }
      const fly = (await res.json()) as Fly;
      onCreated(fly);
      setBusy(false);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to clone";
      setError(msg);
      onFailure(msg);
      setBusy(false);
    }
  }

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={source ? `Clone ${source.sourceName}` : "Clone fly"}
      description={
        source
          ? "Tweak the name or materials, then save. The cloned fly lands in your collection immediately."
          : undefined
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || loading || !source}
            className="rounded-md bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] disabled:opacity-60"
          >
            {busy ? "Cloning…" : "Save clone"}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)] text-sm">
          Loading source fly…
        </div>
      ) : !source ? (
        <p className="py-12 text-center text-sm text-rose-500">
          {error ?? "No source fly."}
        </p>
      ) : (
        <div className="space-y-4">
          {error && (
            <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
              {error}
            </p>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Name
            </label>
            <input
              type="text"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
              placeholder="e.g. PT — Provo size 18"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
            >
              <option value="">— inherit from source —</option>
              <option value="dry">Dry fly</option>
              <option value="nymph">Nymph</option>
              <option value="streamer">Streamer</option>
              <option value="emerger">Emerger</option>
              <option value="wet">Wet fly</option>
              <option value="terrestrial">Terrestrial</option>
              <option value="egg">Egg</option>
              <option value="midge">Midge</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Notes / variation
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
              placeholder="What did you change? Material swaps, bead size, color tweak…"
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            You can edit recipe steps and add more detail from the fly's detail
            page after saving.
          </p>
        </div>
      )}
    </ResponsiveDrawer>
  );
}
