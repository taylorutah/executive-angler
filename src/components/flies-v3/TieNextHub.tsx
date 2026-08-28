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
import { ListChecks, Wrench, CheckCircle2, ArrowRight, Undo2 } from "@/icons";
import type { FlyConfigurationWithFly } from "@/lib/db/fly-model";
import { summarizeVersion } from "./summarize-version";

type ColumnKey = "wanted" | "at_vise" | "done";

const COLUMNS: { key: ColumnKey; label: string; icon: React.ReactNode }[] = [
  { key: "wanted",  label: "Want to tie",         icon: <ListChecks className="h-4 w-4 text-[var(--accent)]" /> },
  { key: "at_vise", label: "At the vise",         icon: <Wrench       className="h-4 w-4 text-[var(--accent)]" /> },
  { key: "done",    label: "Done (last 14 days)", icon: <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> },
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
        <h2 className="font-display text-xl font-semibold text-[var(--text-1)] mb-2">Tie next</h2>
        <p className="text-sm text-[var(--text-2)]">
          Your tie-next queue is empty. From any fly&apos;s page, tap the wrench on a version to add it here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">Tie next</h2>
          <p className="text-xs text-[var(--text-3)] num">
            {items.wanted.length} wanted · {items.at_vise.length} at the vise · {items.done.length} done recently
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--paper-deep)] p-3">
            <div className="flex items-center gap-2 mb-2">
              {col.icon}
              <h3 className="text-sm font-semibold text-[var(--text-1)]">{col.label}</h3>
              <span className="text-xs num text-[var(--text-3)] ml-auto">
                {items[col.key].length}
              </span>
            </div>
            {items[col.key].length === 0 ? (
              <p className="text-xs text-[var(--text-3)] py-4 text-center">
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
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <div className="flex items-start gap-2.5">
        <Link href={`/flies/${cfg.fly.slug}`} className="flex-1 min-w-0 group">
          <div className="flex items-start gap-2.5">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--paper-deep)]">
              {cfg.fly.hero_image_url && (
                <Image src={cfg.fly.hero_image_url} alt={cfg.fly.name} fill className="object-cover" sizes="40px" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--text-1)] group-hover:text-[var(--accent)] truncate">{cfg.fly.name}</p>
              <p className="text-xs text-[var(--text-3)] truncate">{summary}</p>
              {targetText && (
                <p className="text-xs num text-[var(--text-3)] mt-0.5">
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
            className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-2.5 text-xs font-medium text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface))] disabled:opacity-50 transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" aria-hidden /> Start
          </button>
        )}
        {column === "at_vise" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance("done")}
              className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--success)]/10 px-2.5 text-xs font-medium text-[var(--success)] hover:bg-[var(--success)]/20 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark done
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAdvance("wanted")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)] disabled:opacity-50 transition-colors"
              title="Move back to wanted"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </>
        )}
        {column === "done" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAdvance("at_vise")}
            className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] px-2.5 text-xs font-medium text-[var(--text-3)] hover:bg-[var(--paper-deep)] hover:text-[var(--text-1)] disabled:opacity-50 transition-colors"
            title="Move back to vise"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden /> Reopen
          </button>
        )}
      </div>
    </div>
  );
}
