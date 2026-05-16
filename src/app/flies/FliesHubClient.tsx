"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Boxes as BoxesIcon,
  Layers,
  Wrench,
  ListChecks,
  Share2,
  Plus,
} from "lucide-react";
import type { FlyBoxV2, BoxStats } from "@/lib/db/fly-v2";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import type { FlyPattern } from "@/types/fishing-log";
import type { PatternsHubRow } from "@/lib/db/fly-model";
import TieNextKanban from "@/components/flies/TieNextKanban";
import TieNextHub from "@/components/flies-v3/TieNextHub";
import type { FlyConfigurationWithFly } from "@/lib/db/fly-model";
import type { VariantRow } from "@/types/fly-v2";
import WorkbenchClient from "@/app/journal/flies/workbench/WorkbenchClient";
import HelpHint from "@/components/ui/HelpHint";
import PatternsHub from "@/components/flies-v3/PatternsHub";
import BoxesManager from "@/components/flies-v2/BoxesManager";
import SharedPanel from "./tabs/SharedPanel";

type Tab = "boxes" | "patterns" | "workbench" | "tie-next" | "shared";

interface Props {
  initialTab?: string;
  tiesOwnFlies: boolean;
  boxes: FlyBoxV2[];
  boxStats: Record<string, BoxStats>;
  myPatterns: FlyPattern[];
  flyBoxEntries: FlyBoxEntry[];
  patternsHubRows: PatternsHubRow[];
  tieNextConfigurations: FlyConfigurationWithFly[];
  tieNextPatterns: FlyPattern[];
  tieNextBoxEntries: FlyBoxEntry[];
  tieNextDerivedVariants: VariantRow[];
  shared: FlyPattern[];
  sharedOwnerUsernames: Record<string, string>;
  counts: { box: number; favorites: number; tieNext: number; sharedWithMe: number };
  canonicalNames: string[];
  viewerUsername: string | null;
  viewerIsAdmin?: boolean;
}

export default function FliesHubClient({
  initialTab,
  tiesOwnFlies,
  boxes,
  boxStats,
  myPatterns,
  flyBoxEntries,
  patternsHubRows,
  tieNextConfigurations,
  tieNextPatterns,
  tieNextBoxEntries,
  tieNextDerivedVariants,
  shared,
  sharedOwnerUsernames,
  counts,
  canonicalNames,
  viewerUsername,
  viewerIsAdmin = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(normalizeTab(initialTab, tiesOwnFlies));

  function switchTab(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === "boxes") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/flies?${qs}` : "/flies", { scroll: false });
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number; visible: boolean }[] = [
    { key: "boxes", label: "Boxes", icon: <BoxesIcon className="h-4 w-4" />, count: boxes.length, visible: true },
    { key: "patterns", label: "Patterns", icon: <Layers className="h-4 w-4" />, count: counts.box, visible: true },
    { key: "workbench", label: "Workbench", icon: <Wrench className="h-4 w-4" />, visible: tiesOwnFlies },
    { key: "tie-next", label: "Tie Next", icon: <ListChecks className="h-4 w-4" />, count: counts.tieNext, visible: tiesOwnFlies },
    { key: "shared", label: "Shared", icon: <Share2 className="h-4 w-4" />, count: counts.sharedWithMe, visible: true },
  ];
  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        <header className="mb-5 sm:mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Flies
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            <span className="font-[var(--font-mono)] tabular-nums">{boxes.length}</span> boxes ·{" "}
            <span className="font-[var(--font-mono)] tabular-nums">{counts.box}</span> patterns ·{" "}
            <span className="font-[var(--font-mono)] tabular-nums">{counts.tieNext}</span> in tie-next
            {counts.sharedWithMe > 0 ? (
              <>
                {" "}· <span className="font-[var(--font-mono)] tabular-nums">{counts.sharedWithMe}</span> shared
              </>
            ) : null}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/flies/library"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[#E8923A]/40 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Pattern
            </Link>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Flies hub"
          className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1 sm:flex-wrap overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 min-w-max sm:min-w-0">
            {visibleTabs.map((t) => (
              <div key={t.key} className="flex items-center">
                <button
                  onClick={() => switchTab(t.key)}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-md px-3 sm:px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    tab === t.key
                      ? "bg-[#E8923A] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]",
                  ].join(" ")}
                >
                  {t.icon}
                  {t.label}
                  {t.count !== undefined && t.count > 0 ? (
                    <span
                      className={[
                        "rounded-full px-1.5 text-[10px] font-[var(--font-mono)] tabular-nums",
                        tab === t.key ? "bg-white/20" : "bg-[var(--color-border)]",
                      ].join(" ")}
                    >
                      {t.count}
                    </span>
                  ) : null}
                </button>
                {t.key === "tie-next" ? (
                  <span className="hidden sm:inline-flex">
                    <HelpHint label="About Tie Next" className="ml-0.5">
                      <p>
                        Your tying to-do list. Drag cards between Want → Vise → Done as you work.
                      </p>
                      <p className="text-[var(--color-text-muted)]">
                        Done items auto-clear after 14 days.
                      </p>
                    </HelpHint>
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {tab === "boxes" && (
          <BoxesManager initialBoxes={boxes} initialStats={boxStats} />
        )}
        {tab === "patterns" && (
          <PatternsHub rows={patternsHubRows} />
        )}
        {tab === "workbench" && <WorkbenchClient embedded viewerIsAdmin={viewerIsAdmin} />}
        {tab === "tie-next" && (
          <TieNextHub configurations={tieNextConfigurations} />
        )}
        {tab === "shared" && <SharedPanel shared={shared} ownerUsernames={sharedOwnerUsernames} />}
      </div>
    </div>
  );
}

function normalizeTab(raw: string | undefined, tiesOwnFlies: boolean): Tab {
  const allowed: Tab[] = tiesOwnFlies
    ? ["boxes", "patterns", "workbench", "tie-next", "shared"]
    : ["boxes", "patterns", "shared"];
  // Back-compat: redirect callers used the old "box" tab key on /my-flies.
  const normalized = raw === "box" ? "patterns" : raw;
  if (normalized && (allowed as string[]).includes(normalized)) return normalized as Tab;
  return "boxes";
}
