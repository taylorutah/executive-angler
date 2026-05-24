"use client";

/**
 * DeleteFlyPatternDialog — confirmation modal for hard-deleting a personal
 * fly pattern (fly_patterns row).
 *
 * The reason this exists: catches.fly_pattern_id has no ON DELETE clause in
 * the schema, so a bare delete leaves dangling FKs. The legacy server-side
 * handler does null the FK before deleting, but the angler never sees what
 * they're about to orphan. This dialog surfaces the count up front and
 * offers three explicit choices so journal records stay clean.
 *
 *   1. Keep records      → null the FK, keep fly_name text snapshot.
 *                          Catches stay in the journal with the recipe
 *                          name frozen at delete time.
 *   2. Reassign to fly Y → bulk-update catches.fly_pattern_id to Y first,
 *                          then delete the source pattern. Useful when
 *                          you're consolidating two near-duplicates.
 *   3. Delete catches too→ behind a typed confirmation. Removes the
 *                          catches themselves; sessions stay.
 *
 * Called by the personal-pattern edit page. The dialog handles the usage
 * fetch, reassignment / catch-deletion API calls, then invokes the
 * `onConfirmedDelete` callback that performs the actual pattern delete.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  Loader2,
  Trash2,
  AlertCircle,
  ArrowRight,
  Check,
  Anchor,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UsageSession {
  id: string;
  title: string | null;
  fished_at: string | null;
  river_name: string | null;
  catch_count: number;
}

interface UsageResponse {
  pattern: { id: string; name: string };
  catch_count: number;
  session_count: number;
  sessions: UsageSession[];
  truncated: boolean;
}

interface FlyPick {
  id: string;
  name: string;
  type?: string | null;
  image_url?: string | null;
}

type Mode = "keep" | "reassign" | "delete-catches";

interface Props {
  open: boolean;
  flyId: string;
  flyName: string;
  /** Where to send the angler after the delete succeeds. */
  onDeleted: () => void;
  onClose: () => void;
}

export default function DeleteFlyPatternDialog({
  open,
  flyId,
  flyName,
  onDeleted,
  onClose,
}: Props) {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [otherFlies, setOtherFlies] = useState<FlyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("keep");
  const [reassignTarget, setReassignTarget] = useState<string>("");
  const [reassignQuery, setReassignQuery] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [usageRes, fliesRes] = await Promise.all([
          fetch(`/api/fishing/flies/${flyId}/usage`, { credentials: "same-origin" }),
          fetch(`/api/fishing/flies`, { credentials: "same-origin" }),
        ]);
        if (cancelled) return;
        if (!usageRes.ok) {
          setError("Couldn't load catch usage.");
          return;
        }
        const u = (await usageRes.json()) as UsageResponse;
        setUsage(u);
        if (fliesRes.ok) {
          const list = (await fliesRes.json()) as FlyPick[];
          setOtherFlies(
            (Array.isArray(list) ? list : []).filter((f) => f.id !== flyId),
          );
        }
      } catch (e) {
        if (!cancelled) {
          console.error("[DeleteFlyPatternDialog] load:", e);
          setError("Network error loading usage.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, flyId]);

  // Reset transient state when closed so the next open starts fresh.
  useEffect(() => {
    if (open) return;
    setMode("keep");
    setReassignTarget("");
    setReassignQuery("");
    setConfirmText("");
    setError(null);
    setSubmitting(false);
  }, [open]);

  const filteredFlies = useMemo(() => {
    const q = reassignQuery.trim().toLowerCase();
    if (!q) return otherFlies.slice(0, 25);
    return otherFlies
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 25);
  }, [otherFlies, reassignQuery]);

  const catchCount = usage?.catch_count ?? 0;
  const sessionCount = usage?.session_count ?? 0;
  const hasCatches = catchCount > 0;

  // For "delete catches too" we require typing the fly name verbatim — same
  // pattern as PatternEditDrawer's archive flow.
  const canDeleteCatches =
    mode === "delete-catches" && confirmText.trim() === flyName.trim();

  const submitDisabled =
    submitting ||
    loading ||
    (mode === "reassign" && !reassignTarget) ||
    (mode === "delete-catches" && !canDeleteCatches);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      // Reassign first (if chosen) so the pattern delete that follows doesn't
      // touch those catches.
      if (mode === "reassign" && hasCatches) {
        const res = await fetch(`/api/fishing/flies/${flyId}/reassign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ target_fly_pattern_id: reassignTarget }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error || "Reassign failed.");
          setSubmitting(false);
          return;
        }
      }

      // Final delete. `destroy_catches=true` removes the catches outright;
      // omitted, the server nulls the FK and keeps the fly_name snapshot.
      const destroy = mode === "delete-catches" && hasCatches;
      const deleteUrl = destroy
        ? `/api/fishing/flies?id=${encodeURIComponent(flyId)}&destroy_catches=true`
        : `/api/fishing/flies?id=${encodeURIComponent(flyId)}`;
      const delRes = await fetch(deleteUrl, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!delRes.ok) {
        const data = (await delRes.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Delete failed.");
        setSubmitting(false);
        return;
      }
      onDeleted();
      onClose();
    } catch (e) {
      console.error("[DeleteFlyPatternDialog] confirm:", e);
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-fly-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full sm:max-w-xl bg-[#0D1117] border border-[#21262D] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-[#21262D]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400 flex-shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
              Delete fly pattern
            </p>
            <h2 id="delete-fly-title" className="font-heading text-lg text-[#F0F6FC] truncate">
              {flyName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#161B22] rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6E7681] py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking your journal…
            </div>
          ) : (
            <>
              {/* Usage summary */}
              {hasCatches ? (
                <div className="rounded-lg border border-[#E8923A]/30 bg-[#E8923A]/5 p-3 text-sm text-[#F0F6FC] flex items-start gap-2">
                  <Anchor className="h-4 w-4 text-[#E8923A] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p>
                      This fly is in{" "}
                      <span className="font-semibold text-[#E8923A]">
                        {catchCount} {catchCount === 1 ? "catch" : "catches"}
                      </span>{" "}
                      across{" "}
                      <span className="font-semibold text-[#E8923A]">
                        {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                      </span>
                      .
                    </p>
                    {usage && usage.sessions.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-[#A8B2BD]">
                        {usage.sessions.map((s) => (
                          <li key={s.id} className="flex items-center gap-1.5">
                            <Link
                              href={`/journal/${s.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#E8923A] hover:underline truncate"
                            >
                              {s.title ||
                                [s.river_name, formatDate(s.fished_at)]
                                  .filter(Boolean)
                                  .join(" · ") ||
                                "Untitled session"}
                            </Link>
                            <span className="text-[#6E7681]">
                              · {s.catch_count}{" "}
                              {s.catch_count === 1 ? "catch" : "catches"}
                            </span>
                          </li>
                        ))}
                        {usage.truncated && (
                          <li className="text-[#6E7681] italic">+ more sessions…</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-[#21262D] bg-[#161B22] p-3 text-xs text-[#A8B2BD]">
                  This fly isn&apos;t referenced in any journal catches.
                  Safe to delete.
                </p>
              )}

              {/* Mode options */}
              {hasCatches && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A8B2BD]">
                    What should happen to those catches?
                  </p>

                  <ModeOption
                    active={mode === "keep"}
                    onClick={() => setMode("keep")}
                    title="Keep the catches"
                    description={`We'll keep the fly's name on each catch as a text snapshot — your journal records stay intact, they just won't link back to a recipe.`}
                  />

                  <ModeOption
                    active={mode === "reassign"}
                    onClick={() => setMode("reassign")}
                    title="Reassign to another fly"
                    description="Useful when consolidating duplicates — every affected catch will point at the fly you pick."
                  >
                    {mode === "reassign" && (
                      <div className="mt-3 space-y-2">
                        {otherFlies.length === 0 ? (
                          <p className="text-xs text-[#6E7681]">
                            You don&apos;t have any other personal flies to reassign to.
                          </p>
                        ) : (
                          <>
                            <input
                              type="text"
                              placeholder="Search your flies…"
                              value={reassignQuery}
                              onChange={(e) => setReassignQuery(e.target.value)}
                              className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]/50"
                            />
                            <div className="max-h-48 overflow-y-auto rounded-lg border border-[#21262D] bg-[#0D1117]">
                              {filteredFlies.length === 0 ? (
                                <p className="p-3 text-xs text-[#6E7681]">
                                  No matches.
                                </p>
                              ) : (
                                filteredFlies.map((f) => {
                                  const active = reassignTarget === f.id;
                                  return (
                                    <button
                                      key={f.id}
                                      type="button"
                                      onClick={() => setReassignTarget(f.id)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                        active
                                          ? "bg-[#E8923A]/15 text-[#E8923A]"
                                          : "text-[#F0F6FC] hover:bg-[#161B22]"
                                      }`}
                                    >
                                      {active ? (
                                        <Check className="h-3.5 w-3.5 flex-shrink-0" />
                                      ) : (
                                        <span className="h-3.5 w-3.5 flex-shrink-0" />
                                      )}
                                      <span className="flex-1 truncate">{f.name}</span>
                                      {f.type && (
                                        <span className="text-[10px] text-[#6E7681] uppercase tracking-wider">
                                          {f.type}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </ModeOption>

                  <ModeOption
                    active={mode === "delete-catches"}
                    onClick={() => setMode("delete-catches")}
                    title="Delete the catches too"
                    description="Permanent. The sessions stay, but every catch logged on this fly is removed. Type the fly name to confirm."
                    destructive
                  >
                    {mode === "delete-catches" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder={`Type "${flyName}" to confirm`}
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className="w-full bg-[#0D1117] border border-red-500/30 rounded-lg px-3 py-2 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-red-400"
                        />
                      </div>
                    )}
                  </ModeOption>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#21262D] space-y-2">
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#21262D] text-sm text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#161B22] transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button
              onClick={handleConfirm}
              disabled={submitDisabled}
              loading={submitting}
              variant="destructive"
              size="md"
              icon={!submitting ? Trash2 : undefined}
              iconRight={!submitting ? ArrowRight : undefined}
              noUpper
              className="flex-[2]"
            >
              {submitting
                ? "Working…"
                : mode === "reassign" && hasCatches
                ? "Reassign + Delete"
                : mode === "delete-catches"
                ? "Delete catches + fly"
                : "Delete fly"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeOption({
  active,
  onClick,
  title,
  description,
  destructive,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
  destructive?: boolean;
  children?: React.ReactNode;
}) {
  const accent = destructive ? "#F87171" : "#E8923A";
  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
        active
          ? destructive
            ? "border-red-500/40 bg-red-500/5"
            : "border-[#E8923A]/40 bg-[#E8923A]/5"
          : "border-[#21262D] bg-[#161B22] hover:border-[#30363D]"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
            active ? "border-transparent" : "border-[#30363D]"
          }`}
          style={active ? { backgroundColor: accent } : undefined}
        >
          {active && <span className="h-1.5 w-1.5 rounded-full bg-[#0D1117]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium text-[#F0F6FC]"
            style={active ? { color: accent } : undefined}
          >
            {title}
          </p>
          <p className="text-xs text-[#A8B2BD] mt-0.5 leading-relaxed">
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
