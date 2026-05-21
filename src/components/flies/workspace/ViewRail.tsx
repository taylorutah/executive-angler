"use client";
/**
 * ViewRail — left-rail list of views (virtual + user-saved). Tap a view
 * to switch; long-press / menu to rename or delete saved views.
 *
 * Phase 2 form: renders as a horizontal chip strip with a "+" affordance
 * to save the current filter/sort/display state as a new view. Phase 3
 * may promote to a true left rail on desktop.
 */
import { useState } from "react";
import {
  Sparkles,
  Star,
  Wrench,
  Boxes as BoxesIcon,
  Layers,
  Heart,
  Pin,
  Plus,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import type { FlyViewDescriptor } from "@/lib/flies/workspace-shared";

interface Props {
  views: FlyViewDescriptor[];
  activeViewId: string;
  onSelect: (viewId: string) => void;
  onSaveCurrent: (name: string) => Promise<{ ok: boolean; error?: string }>;
  onRename: (viewId: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (viewId: string) => Promise<{ ok: boolean; error?: string }>;
  onTogglePin: (viewId: string, pinned: boolean) => Promise<{ ok: boolean; error?: string }>;
  /** Whether the current filter/sort/display diverges from any saved view. */
  hasUnsavedChanges: boolean;
}

function viewIcon(viewId: string) {
  switch (viewId) {
    case "created-by-me":
      return <Sparkles className="h-3.5 w-3.5" />;
    case "favorites":
      return <Star className="h-3.5 w-3.5" />;
    case "tie-next":
      return <Wrench className="h-3.5 w-3.5" />;
    case "in-a-box":
      return <BoxesIcon className="h-3.5 w-3.5" />;
    case "restock":
      return <Heart className="h-3.5 w-3.5" />;
    case "all":
      return <Layers className="h-3.5 w-3.5" />;
    default:
      return <Pin className="h-3.5 w-3.5" />;
  }
}

export default function ViewRail({
  views,
  activeViewId,
  onSelect,
  onSaveCurrent,
  onRename,
  onDelete,
  onTogglePin,
  hasUnsavedChanges,
}: Props) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = saveName.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await onSaveCurrent(trimmed);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setSaveName("");
    setSaveOpen(false);
  }

  return (
    <div className="mb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max">
          {views.map((v) => (
            <ViewChip
              key={v.id}
              view={v}
              active={activeViewId === v.id}
              onSelect={() => onSelect(v.id)}
              onRename={onRename}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}

          {/* Save-as-new affordance */}
          <Popover.Root open={saveOpen} onOpenChange={setSaveOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                title="Save current view"
                disabled={!hasUnsavedChanges}
                className={[
                  "ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  hasUnsavedChanges
                    ? "text-[#E8923A] hover:bg-[#E8923A]/10"
                    : "text-[var(--color-text-muted)] cursor-not-allowed",
                ].join(" ")}
              >
                <Plus className="h-3 w-3" />
                Save view
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={6}
                className="z-50 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg outline-none space-y-2"
              >
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Save current view
                </p>
                <input
                  autoFocus
                  type="text"
                  maxLength={80}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                  }}
                  placeholder="View name…"
                  className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
                />
                {error && (
                  <p className="text-[11px] text-rose-500">{error}</p>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSaveOpen(false)}
                    className="rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={busy}
                    className="rounded-md bg-[#E8923A] px-3 py-1 text-xs font-semibold text-white hover:bg-[#F0A65A] disabled:opacity-60"
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
}

function ViewChip({
  view,
  active,
  onSelect,
  onRename,
  onDelete,
  onTogglePin,
}: {
  view: FlyViewDescriptor;
  active: boolean;
  onSelect: () => void;
  onRename: (id: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>;
  onTogglePin: (id: string, pinned: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameVal, setRenameVal] = useState(view.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename() {
    const trimmed = renameVal.trim();
    if (!trimmed || trimmed === view.name) {
      setRenameOpen(false);
      setMenuOpen(false);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await onRename(view.id, trimmed);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to rename");
      return;
    }
    setRenameOpen(false);
    setMenuOpen(false);
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={onSelect}
        className={[
          "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          active
            ? "bg-[#E8923A] text-white"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]",
        ].join(" ")}
      >
        {viewIcon(view.id)}
        {view.name}
        {view.is_pinned && !view.is_virtual && (
          <Pin
            className={[
              "h-2.5 w-2.5",
              active ? "text-white/80" : "text-[var(--color-text-muted)]",
            ].join(" ")}
            fill="currentColor"
          />
        )}
      </button>
      {!view.is_virtual && (
        <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              title="View options"
              className={[
                "h-7 w-5 -ml-1 inline-flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                active ? "text-white/80 hover:text-white" : "",
              ].join(" ")}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={4}
              className="z-50 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg outline-none"
            >
              {!renameOpen ? (
                <ul className="space-y-0.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setRenameVal(view.name);
                        setRenameOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={async () => {
                        await onTogglePin(view.id, !view.is_pinned);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
                    >
                      <Pin className="h-3 w-3" />
                      {view.is_pinned ? "Unpin" : "Pin"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !confirm(`Delete view "${view.name}"? This can't be undone.`)
                        )
                          return;
                        await onDelete(view.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="space-y-2 p-1">
                  <input
                    autoFocus
                    type="text"
                    maxLength={80}
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      else if (e.key === "Escape") {
                        setRenameOpen(false);
                        setError(null);
                      }
                    }}
                    className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#E8923A]/40"
                  />
                  {error && (
                    <p className="text-[11px] text-rose-500">{error}</p>
                  )}
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameOpen(false);
                        setError(null);
                      }}
                      className="rounded-md px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleRename}
                      className="rounded-md bg-[#E8923A] px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
