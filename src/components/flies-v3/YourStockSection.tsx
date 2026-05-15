"use client";
/**
 * YourStockSection — the user's saved versions of a fly on the canonical
 * detail page. Lists each configuration with inline counts, box badges,
 * and tie-next/favorite toggles. "+ Add another version" opens
 * ConfigureSheet.
 *
 * Empty state (logged in, no versions) renders an explanation + AddToBoxButton.
 * Anonymous viewers see "Log in to track your stock of this fly."
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Wrench, Pencil, Trash2, Plus } from "lucide-react";
import type { Fly, FlyConfigurationWithBoxes } from "@/types/flies";
import ConfigureSheet from "./ConfigureSheet";
import { summarizeVersion } from "./summarize-version";

interface BoxOption { id: string; name: string; }

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
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[#E8923A] px-4 py-2 text-sm font-medium text-white hover:bg-[#d17d28]"
        >
          <Plus className="h-4 w-4" />
          Add a version
        </button>

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

  return (
    <section className="my-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-heading text-xl">Your stock</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            You tie this fly in {versions.length} version{versions.length === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-3 py-1.5 text-xs font-medium text-[#E8923A] hover:bg-[#E8923A]/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another version
        </button>
      </div>

      <ul className="space-y-2">
        {versions.map((v) => (
          <VersionCard key={v.id} version={v} fly={fly} onEdit={() => setEditing(v)} />
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
  onEdit,
}: {
  version: FlyConfigurationWithBoxes;
  fly: Fly;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const summary = summarizeVersion(version);
  const deficit = Math.max(0, version.target_count - version.tied_count - version.bought_count);

  async function toggle(field: "is_favorite" | "is_tie_next") {
    setBusy(true);
    try {
      const newVal = !version[field];
      await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: version.id,
          [field]: newVal,
          ...(field === "is_tie_next" ? { tie_next_status: newVal ? "wanted" : "none" } : {}),
        }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function bumpTied(delta: number) {
    setBusy(true);
    try {
      await fetch("/api/fishing/fly-configurations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: version.id,
          tied_count: Math.max(0, version.tied_count + delta),
        }),
      });
      router.refresh();
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

  return (
    <li className="rounded-lg border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-medium">{summary}</p>
          {version.in_boxes.length > 0 && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              In: {version.in_boxes.map((b) => b.box_name).join(", ")}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span>
              Tied <span className="font-semibold">{version.tied_count}</span> / Target{" "}
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
            title="Tied one more"
            className="h-7 w-7 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-xs hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
          >
            +
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => bumpTied(-1)}
            title="Used / lost one"
            className="h-7 w-7 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-xs hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
          >
            −
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle("is_favorite")}
            title="Favorite"
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs transition-colors ${
              version.is_favorite
                ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={version.is_favorite ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle("is_tie_next")}
            title="Tie next"
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs transition-colors ${
              version.is_tie_next
                ? "border-[#E8923A]/40 bg-[#E8923A]/10 text-[#E8923A]"
                : "border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            title="Delete version"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
