"use client";

/**
 * ColumnPicker — small popover that lets the angler toggle which variant
 * option columns are visible on the Configurations table. Sits next to the
 * action buttons. Preferences are persisted to localStorage (key
 * `ea-variant-columns-v1`) so they survive reloads but don't sync across
 * devices — promote to a profile column when cross-device matters.
 *
 * Three-state model per axis:
 *   - undefined → follow the pattern's active axis list (default behavior)
 *   - true      → force-show even if the pattern doesn't declare it
 *   - false     → force-hide even if the pattern does declare it
 *
 * The popover groups axes into "Pattern axes" (what this pattern declares
 * via active_variant_axes / category default) and "Additional axes" (the
 * remainder the user can opt-in to). Both groups read from the same
 * preference map.
 *
 * `size` is always shown and not toggleable — every row needs a size.
 */
import { useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import type { VariantAxis } from "@/lib/flies/variant-axes";

const STORAGE_KEY = "ea-variant-columns-v1";

const ALL_AXES: { axis: VariantAxis; label: string }[] = [
  { axis: "hook", label: "Hook" },
  { axis: "bead", label: "Bead" },
  { axis: "body", label: "Body" },
  { axis: "rib", label: "Rib" },
  { axis: "tail", label: "Tail" },
  { axis: "wing", label: "Wing" },
  { axis: "thorax", label: "Thorax" },
  { axis: "collar", label: "Collar" },
  { axis: "hackle", label: "Hackle" },
];

export type ColumnPreferences = Partial<Record<VariantAxis, boolean>>;

function loadPreferences(): ColumnPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed != null ? parsed : {};
  } catch {
    return {};
  }
}

function savePreferences(prefs: ColumnPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota / private-mode errors — table still renders fine.
  }
}

/**
 * Hook that returns the current preference map and a setter. Reads
 * localStorage on mount; updates persist immediately.
 */
export function useColumnPreferences(): [
  ColumnPreferences,
  (axis: VariantAxis, value: boolean | undefined) => void,
] {
  const [prefs, setPrefs] = useState<ColumnPreferences>({});
  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);
  const setAxis = (axis: VariantAxis, value: boolean | undefined) => {
    setPrefs((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[axis];
      } else {
        next[axis] = value;
      }
      savePreferences(next);
      return next;
    });
  };
  return [prefs, setAxis];
}

/**
 * Combines the pattern's active axis list with the user's preferences to
 * produce the final visible set. Pure function — call it from VariantTable.
 */
export function applyColumnPreferences(
  activeAxes: VariantAxis[] | undefined,
  prefs: ColumnPreferences,
): Set<VariantAxis> {
  const visible = new Set<VariantAxis>(activeAxes ?? []);
  visible.add("size"); // always
  for (const [axis, value] of Object.entries(prefs) as [VariantAxis, boolean][]) {
    if (value === true) visible.add(axis);
    else if (value === false) visible.delete(axis);
  }
  visible.add("size"); // re-assert: never let prefs hide size
  return visible;
}

interface Props {
  /** What the pattern (or its category default) declares as active. */
  patternAxes: VariantAxis[];
  prefs: ColumnPreferences;
  onChange: (axis: VariantAxis, value: boolean | undefined) => void;
}

export default function ColumnPicker({ patternAxes, prefs, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const patternSet = new Set(patternAxes);
  const inPattern = ALL_AXES.filter(({ axis }) => patternSet.has(axis));
  const additional = ALL_AXES.filter(({ axis }) => !patternSet.has(axis));

  const isVisible = (axis: VariantAxis): boolean => {
    const override = prefs[axis];
    if (override === true) return true;
    if (override === false) return false;
    return patternSet.has(axis);
  };

  const handleToggle = (axis: VariantAxis, defaultVisible: boolean) => {
    const currentlyVisible = isVisible(axis);
    const nextVisible = !currentlyVisible;
    // If the new value matches the default, clear the override; else set it.
    if (nextVisible === defaultVisible) {
      onChange(axis, undefined);
    } else {
      onChange(axis, nextVisible);
    }
  };

  const customizedCount = (Object.keys(prefs) as VariantAxis[]).filter(
    (a) => prefs[a] !== undefined,
  ).length;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Show or hide columns"
        className="inline-flex items-center gap-1.5 rounded-md border border-[#21262D] bg-[#161B22] px-2.5 py-1.5 text-xs font-medium text-[#A8B2BD] hover:border-[#E8923A]/40 hover:text-[#F0F6FC] transition-colors"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Columns
        {customizedCount > 0 && (
          <span className="ml-0.5 rounded-full bg-[#E8923A]/20 px-1.5 text-[10px] font-semibold text-[#E8923A]">
            {customizedCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1.5 w-60 rounded-lg border border-[#21262D] bg-[#0D1117] shadow-xl">
          <div className="px-3 py-2 border-b border-[#21262D]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E7681]">
              Pattern axes
            </p>
          </div>
          <ul className="divide-y divide-[#21262D]/60">
            {inPattern.map(({ axis, label }) => (
              <li key={axis}>
                <label className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#F0F6FC] hover:bg-[#161B22] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible(axis)}
                    onChange={() => handleToggle(axis, true)}
                    className="rounded accent-[#E8923A]"
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
            {inPattern.length === 0 && (
              <li className="px-3 py-2 text-[11px] text-[#6E7681] italic">
                No additional axes declared for this pattern.
              </li>
            )}
          </ul>
          <div className="px-3 py-2 border-y border-[#21262D]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E7681]">
              Additional
            </p>
          </div>
          <ul className="divide-y divide-[#21262D]/60">
            {additional.map(({ axis, label }) => (
              <li key={axis}>
                <label className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#A8B2BD] hover:bg-[#161B22] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible(axis)}
                    onChange={() => handleToggle(axis, false)}
                    className="rounded accent-[#E8923A]"
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          {customizedCount > 0 && (
            <div className="px-3 py-2 border-t border-[#21262D]">
              <button
                type="button"
                onClick={() => {
                  for (const a of Object.keys(prefs) as VariantAxis[]) {
                    onChange(a, undefined);
                  }
                }}
                className="w-full text-left text-[11px] text-[#6E7681] hover:text-[#F0F6FC]"
              >
                Reset to pattern defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
