"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Wrench,
  ListChecks,
  Share2,
  Plus,
  Heart,
  Feather,
} from "lucide-react";
import type { FlyPattern } from "@/types/fishing-log";
import type { FlyBoxEntry } from "@/lib/db/fly-patterns";
import {
  FlyBoxTabs,
  type SerializedFlyPattern,
  type SerializedFlyBoxEntry,
} from "@/components/flies/FlyBoxTabs";
import TieNextKanban from "@/components/flies/TieNextKanban";
import WorkbenchClient from "@/app/journal/flies/workbench/WorkbenchClient";
import HelpHint from "@/components/ui/HelpHint";

type Tab = "box" | "workbench" | "tie-next" | "shared";

const CATEGORY_TO_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

const TYPE_ORDER = [
  "Nymph",
  "Dry Fly",
  "Streamer",
  "Wet Fly",
  "Emerger",
  "Terrestrial",
  "Egg",
  "Midge",
  "Other",
];

interface Props {
  initialTab?: string;
  tiesOwnFlies: boolean;
  myPatterns: FlyPattern[];
  flyBoxEntries: FlyBoxEntry[];
  tieNextPatterns: FlyPattern[];
  tieNextBoxEntries: FlyBoxEntry[];
  shared: FlyPattern[];
  counts: { box: number; favorites: number; tieNext: number; sharedWithMe: number };
  canonicalNames: string[];
}

export default function MyFliesClient({
  initialTab,
  tiesOwnFlies,
  myPatterns,
  flyBoxEntries,
  tieNextPatterns,
  tieNextBoxEntries,
  shared,
  counts,
  canonicalNames,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const normalized = normalizeTab(initialTab, tiesOwnFlies);
  const [tab, setTab] = useState<Tab>(normalized);

  function switchTab(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === "box") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/my-flies?${qs}` : "/my-flies", { scroll: false });
  }

  // Group for the Fly Box tab — reuses the existing FlyBoxTabs component
  const flyBoxProps = useMemo(
    () => buildFlyBoxProps(myPatterns, flyBoxEntries, counts),
    [myPatterns, flyBoxEntries, counts]
  );

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
    visible: boolean;
  }[] = [
    {
      key: "box",
      label: "Fly Box",
      icon: <Layers className="h-4 w-4" />,
      count: counts.box,
      visible: true,
    },
    {
      key: "workbench",
      label: "Workbench",
      icon: <Wrench className="h-4 w-4" />,
      visible: tiesOwnFlies,
    },
    {
      key: "tie-next",
      label: "Tie Next",
      icon: <ListChecks className="h-4 w-4" />,
      count: counts.tieNext,
      visible: tiesOwnFlies,
    },
    {
      key: "shared",
      label: "Shared",
      icon: <Share2 className="h-4 w-4" />,
      count: counts.sharedWithMe,
      visible: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  const tabHelp: Partial<Record<Tab, React.ReactNode>> = {
    "tie-next": (
      <>
        <p>
          Your tying to-do list. Drag cards between <span className="text-[#F0F6FC] font-semibold">Want → Vise → Done</span> as you work through them.
        </p>
        <p className="text-[#6E7681]">
          <span className="text-[#F0F6FC]">Add a fly:</span> tap the <ListChecks className="inline h-3 w-3" /> icon on any card in your Fly Box, Library, or Workbench.
        </p>
        <p className="text-[#6E7681]">
          Done column auto-clears 14 days after you mark it — keeps focus on what&apos;s next.
        </p>
      </>
    ),
    workbench: (
      <>
        <p>Design personal patterns, pick from the Library, or see what you can tie from your materials on hand.</p>
      </>
    ),
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#F0F6FC]">My Flies</h1>
            <p className="mt-1 text-sm text-[#6E7681]">
              {counts.box} in box · {counts.favorites} favorite
              {counts.favorites === 1 ? "" : "s"} · {counts.tieNext} in tie-next
              {counts.sharedWithMe > 0 ? ` · ${counts.sharedWithMe} shared with you` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/flies"
              className="flex items-center gap-1.5 rounded-lg border border-[#21262D] bg-[#161B22] px-3 py-2 text-sm font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              href="/journal/flies/new"
              className="flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Pattern
            </Link>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-lg border border-[#21262D] bg-[#161B22] p-1">
          {visibleTabs.map((t) => (
            <div key={t.key} className="flex items-center">
              <button
                onClick={() => switchTab(t.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-[#E8923A] text-white"
                    : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                {t.icon}
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      tab === t.key ? "bg-white/20" : "bg-[#21262D]"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
              {tabHelp[t.key] ? (
                <HelpHint label={`About ${t.label}`} className="ml-0.5">
                  {tabHelp[t.key]}
                </HelpHint>
              ) : null}
            </div>
          ))}
        </div>

        {tab === "box" && <FlyBoxPanel {...flyBoxProps} canonicalNames={canonicalNames} />}
        {tab === "workbench" && <WorkbenchClient embedded />}
        {tab === "tie-next" && (
          <TieNextKanban
            initialPatterns={tieNextPatterns}
            initialBoxEntries={tieNextBoxEntries}
          />
        )}
        {tab === "shared" && <SharedPanel shared={shared} />}
      </div>
    </div>
  );
}

function normalizeTab(raw: string | undefined, tiesOwnFlies: boolean): Tab {
  const allowed: Tab[] = tiesOwnFlies
    ? ["box", "workbench", "tie-next", "shared"]
    : ["box", "shared"];
  if (raw && (allowed as string[]).includes(raw)) return raw as Tab;
  return "box";
}

/* ── Fly Box panel ───────────────────────────────────────────────── */

type UnifiedFly =
  | { source: "personal"; fly: SerializedFlyPattern }
  | { source: "library"; entry: SerializedFlyBoxEntry };

function buildFlyBoxProps(
  myPatterns: FlyPattern[],
  flyBoxEntries: FlyBoxEntry[],
  counts: { favorites: number; tieNext: number }
) {
  const personalCards: UnifiedFly[] = myPatterns.map((fly) => ({
    source: "personal" as const,
    fly: {
      id: fly.id,
      name: fly.name,
      type: fly.type,
      size: fly.size,
      hook: fly.hook,
      bead_size: fly.bead_size,
      bead_color: fly.bead_color,
      fly_color: fly.fly_color,
      image_url: fly.image_url ?? fly.my_tied_fly_photo_url ?? undefined,
      tags: fly.tags,
      description: fly.description,
      is_favorite: fly.is_favorite,
      is_tie_next: fly.is_tie_next,
    },
  }));

  const libraryCards: UnifiedFly[] = flyBoxEntries
    .filter((e) => e.canonical_fly)
    .map((e) => ({
      source: "library" as const,
      entry: {
        id: e.id,
        canonical_fly_id: e.canonical_fly_id ?? "",
        preferred_sizes: e.preferred_sizes,
        personal_notes: e.personal_notes,
        is_favorite: e.is_favorite,
        is_tie_next: e.is_tie_next,
        times_used: e.times_used,
        canonical_fly: {
          id: e.canonical_fly!.id,
          slug: e.canonical_fly!.slug,
          name: e.canonical_fly!.name,
          category: e.canonical_fly!.category,
          tagline: e.canonical_fly!.tagline ?? undefined,
          sizes: e.canonical_fly!.sizes ?? undefined,
          colors: e.canonical_fly!.colors ?? undefined,
          bead_options: e.canonical_fly!.bead_options ?? undefined,
          hook_styles: e.canonical_fly!.hook_styles ?? undefined,
          hero_image_url: e.canonical_fly!.hero_image_url ?? undefined,
        },
      },
    }));

  const grouped: Record<string, UnifiedFly[]> = {};
  for (const card of [...libraryCards, ...personalCards]) {
    let type: string;
    if (card.source === "library") {
      type = CATEGORY_TO_TYPE[card.entry.canonical_fly.category] || "Other";
    } else {
      type = card.fly.type || "Other";
    }
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(card);
  }

  const sortedTypes = [
    ...TYPE_ORDER.filter((t) => grouped[t]?.length),
    ...Object.keys(grouped).filter((t) => !TYPE_ORDER.includes(t) && grouped[t]?.length),
  ];

  return {
    favCount: counts.favorites,
    tieNextCount: counts.tieNext,
    sortedTypes,
    grouped,
  };
}

function FlyBoxPanel({
  favCount,
  tieNextCount,
  sortedTypes,
  grouped,
  canonicalNames,
}: {
  favCount: number;
  tieNextCount: number;
  sortedTypes: string[];
  grouped: Record<string, UnifiedFly[]>;
  canonicalNames: string[];
}) {
  const total = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
  if (total === 0) {
    return <EmptyBoxState />;
  }
  return (
    <FlyBoxTabs
      favCount={favCount}
      tieNextCount={tieNextCount}
      sortedTypes={sortedTypes}
      grouped={grouped}
      canonicalNames={canonicalNames}
    />
  );
}

function EmptyBoxState() {
  return (
    <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
      <Feather className="mx-auto h-10 w-10 text-[#6E7681]" />
      <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">
        Your fly box is empty
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
        Save patterns from the public library, or design your own in the Workbench.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/flies"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#21262D] bg-[#0D1117] px-4 py-2 text-sm font-medium text-[#A8B2BD] hover:text-[#F0F6FC] hover:border-[#E8923A]/40"
        >
          Browse Library
        </Link>
        <Link
          href="/journal/flies/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A]"
        >
          <Plus className="h-4 w-4" /> New Pattern
        </Link>
      </div>
    </div>
  );
}


/* ── Shared with me panel ────────────────────────────────────────── */

function SharedPanel({ shared }: { shared: FlyPattern[] }) {
  if (shared.length === 0) {
    return (
      <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
        <Share2 className="mx-auto h-10 w-10 text-[#6E7681]" />
        <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">
          Nothing shared with you yet
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
          When another angler shares a pattern with you directly, it shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shared.map((p) => (
        <div
          key={p.id}
          className="flex flex-col gap-2 rounded-xl border border-[#21262D] bg-[#161B22] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#0D1117]">
              {p.image_url || p.my_tied_fly_photo_url ? (
                <Image
                  src={(p.image_url || p.my_tied_fly_photo_url) as string}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl">🪝</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#F0F6FC]">{p.name}</p>
              <p className="truncate text-xs text-[#6E7681]">{p.type ?? "Personal pattern"}</p>
            </div>
          </div>
          {p.description ? (
            <p className="line-clamp-2 text-xs text-[#A8B2BD]">{p.description}</p>
          ) : null}
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0BA5C7]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0BA5C7]">
              <Heart className="h-3 w-3" /> Shared
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
