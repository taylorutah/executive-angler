"use client";
/**
 * CatchLogger — workbench-style sheet for logging a catch during a session.
 *
 * Plan spec (web first; mobile follows the same shape):
 *   Tap 1: "Log Catch" from the session screen (opens this sheet)
 *   Tap 2: A variant tile in the Active Box grid → catch logged
 *
 * Supporting behavior:
 *   - "Repeat last fly" chip — shown when the session has a most-recent catch.
 *     One tap re-uses that variant.
 *   - Active Box grid — 4-column responsive grid of tiles. Each shows photo +
 *     pattern name + size + stock badge.
 *   - Search bar — instant filter by pattern name or size.
 *   - Species + length form fields above the grid (sticky).
 *   - Tile click commits the catch immediately (variant_id + current
 *     species/length form state).
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronLeft, Repeat, Search } from "@/icons";
import type { VariantRow } from "@/types/fly-v2";
import { logCatchAction } from "@/app/journal/[id]/actions";
import { COMMON_SPECIES } from "@/lib/species-suggestions";

/** Light haptic on supported browsers (mobile Safari + Chrome Android). */
function haptic() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try { navigator.vibrate(15); } catch { /* noop */ }
  }
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qlasxtfbodyxbcuchvxz.supabase.co";

interface Props {
  sessionId: string;
  /** Variants in the session's active box (preferred surface). */
  activeBoxVariants: VariantRow[];
  /** Active box display name (or "No active box"). */
  activeBoxName: string | null;
  /** Last catch logged in this session — used for "Repeat last fly" chip. */
  lastCatch?: {
    variant_id: string | null;
    fly_name: string | null;
    fly_size: string | null;
    species: string | null;
    length_inches: number | null;
  } | null;
  /** Default species value (typically the user's last catch species). */
  defaultSpecies?: string;
  /** Whether the sheet is open. */
  open: boolean;
  onClose: () => void;
  /** Called after a successful log so the parent can show an Undo toast. */
  onLogged?: (info: { catchId: string; flyName: string; size: string; species: string }) => void;
}

function variantThumbUrl(v: VariantRow): string | null {
  if (!v.primary_photo) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/variant-photos/${v.primary_photo.storage_path}`;
}

export default function CatchLogger({
  sessionId,
  activeBoxVariants,
  activeBoxName,
  lastCatch,
  defaultSpecies = "",
  open,
  onClose,
  onLogged,
}: Props) {
  const [species, setSpecies] = useState(defaultSpecies || lastCatch?.species || "Rainbow Trout");
  const [length, setLength] = useState<string>(
    lastCatch?.length_inches != null ? String(lastCatch.length_inches) : ""
  );
  const [filter, setFilter] = useState("");
  const [lost, setLost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [committingId, setCommittingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 100);
  }, [open]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return activeBoxVariants;
    const q = filter.trim().toLowerCase();
    return activeBoxVariants.filter((v) => {
      const name = (v.pattern?.name ?? "").toLowerCase();
      const size = (v.size ?? "").toLowerCase();
      const body = (v.body_color ?? "").toLowerCase();
      return name.includes(q) || size.includes(q) || body.includes(q);
    });
  }, [activeBoxVariants, filter]);

  const commit = (variantId: string) => {
    if (committingId) return;
    setError(null);
    setCommittingId(variantId);
    const lengthN = length ? parseFloat(length) : undefined;
    const variant = activeBoxVariants.find((v) => v.id === variantId);
    startTransition(async () => {
      const r = await logCatchAction({
        session_id: sessionId,
        variant_id: variantId,
        species: species.trim() || undefined,
        length_inches: lengthN && Number.isFinite(lengthN) ? lengthN : undefined,
        lost,
      });
      setCommittingId(null);
      if (!r.ok) {
        setError(r.error ?? "Failed to log catch.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      haptic();
      onLogged?.({
        catchId: r.catchId ?? "",
        flyName: variant?.pattern?.name ?? "fly",
        size: variant?.size ?? "",
        species: species.trim() || "fish",
      });
      // Soft reset: keep species/length so next catch is fast; clear "lost"
      setFilter("");
      setLost(false);
      onClose();
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ink)]/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="relative w-full sm:max-w-2xl rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-float)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Cancel
          </button>
          <h2 className="text-[var(--text-1)] font-semibold text-sm">Log catch</h2>
          <span className="ea-overline">
            {activeBoxName ?? "No box active"}
          </span>
        </div>

        {/* Sticky form: species + length + search */}
        <div className="border-b border-[var(--border)] px-4 py-3 space-y-3 bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="ea-label">Species</label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                list="catch-logger-species"
                className="ea-input"
              />
              <datalist id="catch-logger-species">
                {COMMON_SPECIES.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div className="w-24">
              <label className="ea-label">Length (in)</label>
              <input
                type="number"
                step="0.5"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="—"
                className="ea-input num"
              />
            </div>
          </div>

          {/* Lost-the-fly toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
            <input
              type="checkbox"
              checked={lost}
              onChange={(e) => setLost(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
            />
            <span>I lost the fly on this catch (decrement stock)</span>
          </label>

          {/* Repeat last fly */}
          {lastCatch?.variant_id && (
            <button
              type="button"
              onClick={() => commit(lastCatch.variant_id!)}
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-3 py-2 text-sm text-[var(--accent)] hover:border-[var(--accent)] transition-colors disabled:opacity-60"
            >
              <Repeat className="h-3.5 w-3.5" />
              Repeat last fly · {lastCatch.fly_name}
              {lastCatch.fly_size && <span className="num text-xs">#{lastCatch.fly_size}</span>}
            </button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              ref={searchRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search variants…"
              className="ea-input pl-8"
            />
          </div>
        </div>

        {/* Variant grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeBoxVariants.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-2)]">
              <p>No variants in your active box.</p>
              <p className="text-xs text-[var(--text-3)] mt-1">
                <Link href="/flies?tab=boxes" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
                  Pick a box
                </Link>{" "}
                or{" "}
                <Link href="/flies" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
                  browse patterns
                </Link>{" "}
                to add variants.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-3)]">
              No variants match &ldquo;{filter}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filtered.map((v) => {
                const url = variantThumbUrl(v);
                const stocked = (v.stock?.tied_count ?? 0) + (v.stock?.bought_count ?? 0);
                const target = v.stock?.target_count ?? 0;
                const isCommitting = committingId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => commit(v.id)}
                    disabled={pending}
                    className={`group relative flex flex-col aspect-square overflow-hidden rounded-[var(--radius-card)] border bg-[var(--paper-deep)] text-left hover:border-[var(--accent)] transition-colors ${
                      isCommitting ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : "border-[var(--border)]"
                    } ${pending && !isCommitting ? "opacity-40" : ""}`}
                    title={`Log a ${v.pattern?.name ?? ""} #${v.size}`}
                  >
                    <span className="relative w-full flex-1">
                      {url ? (
                        <Image src={url} alt="" fill sizes="160px" className="ea-photo" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-[var(--text-3)] text-2xl">
                            {(v.pattern?.name ?? "?")[0]}
                          </span>
                        </span>
                      )}
                      {isCommitting && (
                        <span className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/50">
                          <span className="text-[var(--paper)] text-xs font-semibold">Logging…</span>
                        </span>
                      )}
                    </span>
                    <span className="w-full border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1.5">
                      <span className="block text-[var(--text-1)] text-xs font-medium truncate">
                        {v.pattern?.name ?? "Unknown"}
                      </span>
                      <span className="num text-xs text-[var(--text-3)] flex items-center justify-between">
                        <span>#{v.size}</span>
                        {target > 0 ? (
                          <span className={stocked < target ? "text-[var(--warning)]" : "text-[var(--accent)]"}>
                            {stocked}/{target}
                          </span>
                        ) : (
                          <span>{stocked}</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-2 text-xs text-[var(--danger)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
