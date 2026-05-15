"use client";
/**
 * TieNextHub — kanban-style view of the user's tie-next queue, sourced
 * from user_fly_configurations. Three columns: Wanted, At the vise,
 * Done (last 14 days).
 *
 * Each card renders fly hero + name + version summary + target / progress
 * + "advance" / "mark done" buttons. Clicking a card opens the fly's
 * detail page.
 *
 * Replaces the legacy TieNextKanban which read from fly_patterns +
 * user_fly_box + derived-shortage variants.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ListChecks, Wrench, CheckCircle2, ArrowRight, Undo2 } from "lucide-react";
import type { FlyConfigurationWithFly } from "@/lib/db/fly-model";
import { summarizeVersion } from "./summarize-version";

type ColumnKey = "wanted" | "at_vise" | "done";

const COLUMNS: { key: ColumnKey; label: string; icon: React.ReactNode; tint: string }[] = [
  { key: "wanted",  label: "Want to tie",         icon: <ListChecks className="h-4 w-4 text-[#00B4D8]" />,  tint: "border-[#00B4D8]/30 bg-[#00B4D8]/[0.04]" },
  { key: "at_vise", label: "At the vise",         icon: <Wrench       className="h-4 w-4 text-[#E8923A]" />, tint: "border-[#E8923A]/30 bg-[#E8923A]/[0.04]" },
  { key: "done",    label: "Done (last 14 days)", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, tint: "border-emerald-500/30 bg-emerald-500/[0.03]" },
];

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

interface Props {
  configurations: FlyConfigurationWithFly[];
}

export default function TieNextHub({ configurations }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const items = useMemo(() => {
    const cutoff = Date.now() - FOURTEEN_DAYS_MS;
    const byCol: Record<ColumnKey, FlyConfigurationWithFly[]> = { wanted: [], at_vise: [], done: [] };
    for (const c of configurations) {
      const status = (c.tie_next_status ?? "none") as ColumnKey | "none";
      if (status === "wanted") byCol.wanted.push(c);
      else if (status === "at_vise") byCol.at_vise.push(c);
      else if (status === "done") {
        // Keep done items only if updated_at within the last 14 days.
        const ts = c.updated_at ? Date.parse(c.updated_at) : 0;
        if (ts >= cutoff) byCol.done.push(c);
      }
    }
    // Sort by tie_next_order then updated_at desc.
    for (const k of Object.keys(byCol) as ColumnKey[]) {
      byCol[k].sort((a, b) => {
        const ao = a.tie_next_order ?? 9999;
        const bo = b.tie_next_order ?? 9999;
        if (ao !== bo) return ao - bo;
        return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
      });
    }
    return byCol;
  }, [configurations]);

  async function advance(c: FlyConfigurationWithFly, to: "at_vise" | "done" | "wanted") {
    setPendingId(c.id);
    // Keep is_tie_next=true through the done state. The client-side filter
    // hides done items past 14 days; a server-side scheduled job (TBD) can
    // sweep them to is_tie_next=false. Unsetting on transition to done
    // removes them from the kanban immediately, which loses the "recent
    // wins" Done column entirely.
    await fetch("/api/fishing/fly-configurations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: c.id,
        tie_next_status: to,
        is_tie_next: true,
      }),
    });
    startTransition(() => {
      router.refresh();
      setPendingId(null);
    });
  }

  const total = items.wanted.length + items.at_vise.length + items.done.length;
  if (total === 0) {
    return (
      <section>
        <h2 className="font-heading text-xl mb-2">Tie next</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your tie-next queue is empty. From any fly&apos;s page, tap the wrench on a version to add it here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-heading text-xl">Tie next</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {items.wanted.length} wanted · {items.at_vise.length} at the vise · {items.done.length} done recently
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className={`rounded-lg border ${col.tint} p-3`}>
            <div className="flex items-center gap-2 mb-2">
              {col.icon}
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
                {items[col.key].length}
              </span>
            </div>
            {items[col.key].length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
                —
              </p>
            ) : (
              <ul className="space-y-2">
                {items[col.key].map((c) => (
                  <li key={c.id}>
                    <Card
                      cfg={c}
                      column={col.key}
                      busy={pendingId === c.id}
                      onAdvance={(to) => advance(c, to)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Card({
  cfg,
  column,
  busy,
  onAdvance,
}: {
  cfg: FlyConfigurationWithFly;
  column: ColumnKey;
  busy: boolean;
  onAdvance: (to: "wanted" | "at_vise" | "done") => void;
}) {
  const summary = summarizeVersion(cfg);
  const targetText = cfg.tie_next_target_qty
    ? `Target ${cfg.tie_next_target_qty}`
    : cfg.target_count
      ? `Target ${cfg.target_count}`
      : null;
  return (
    <div className="rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] bg-[var(--color-surface,#fff)] dark:bg-[#161B22] p-2.5">
      <div className="flex items-start gap-2.5">
        <Link href={`/flies/${cfg.fly.slug}`} className="flex-1 min-w-0 group">
          <div className="flex items-start gap-2.5">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-[var(--color-surface-hover,#f3f4f6)] dark:bg-[#0D1117]">
              {cfg.fly.hero_image_url && (
                <Image src={cfg.fly.hero_image_url} alt={cfg.fly.name} fill className="object-cover" sizes="40px" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm group-hover:text-[#E8923A] truncate">{cfg.fly.name}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] truncate">{summary}</p>
              {targetText && (
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Tied {cfg.tied_count} / {targetText.replace("Target ", "")}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {column === "wanted" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAdvance("at_vise")}
            className="inline-flex items-center gap-1 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-2 py-1 text-[11px] text-[#E8923A] hover:bg-[#E8923A]/20 disabled:opacity-60"
          >
            <ArrowRight className="h-3 w-3" /> Start
          </button>
        )}
        {column === "at_vise" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance("done")}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3 w-3" /> Mark done
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance("wanted")}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] px-2 py-1 text-[11px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] disabled:opacity-60"
              title="Move back to wanted"
            >
              <Undo2 className="h-3 w-3" />
            </button>
          </>
        )}
        {column === "done" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAdvance("at_vise")}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border,#e5e7eb)] dark:border-[#30363D] px-2 py-1 text-[11px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover,#f3f4f6)] dark:hover:bg-[#21262D] disabled:opacity-60"
            title="Move back to vise"
          >
            <Undo2 className="h-3 w-3" /> Reopen
          </button>
        )}
      </div>
    </div>
  );
}
