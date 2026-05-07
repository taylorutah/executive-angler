"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Layers,
  Crosshair,
  Backpack,
  Archive,
  Folder,
} from "lucide-react";
import type { FlyBoxWithStats, FlyBoxTier } from "@/lib/db/fly-boxes";
import CreateBoxDialog from "@/components/flies/CreateBoxDialog";
import DataTable, { type Column } from "@/components/ui/DataTable";
import ViewModeToggle, { type ViewMode } from "@/components/ui/ViewModeToggle";

const TIER_ORDER: FlyBoxTier[] = ["kill", "support", "archive", "custom"];

const TIER_META: Record<
  FlyBoxTier,
  {
    title: string;
    subtitle: string;
    icon: typeof Crosshair;
    accent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
  }
> = {
  kill: {
    title: "Tier 1 · Kill",
    subtitle: "Chest-worn. Your highest-confidence flies.",
    icon: Crosshair,
    accent: "text-[#E8923A]",
    border: "border-[#E8923A]/30",
    badgeBg: "bg-[#E8923A]/15",
    badgeText: "text-[#E8923A]",
    barColor: "bg-[#E8923A]",
  },
  support: {
    title: "Tier 2 · Support",
    subtitle: "Pack & vest. Variations and situational patterns.",
    icon: Backpack,
    accent: "text-[#0BA5C7]",
    border: "border-[#0BA5C7]/30",
    badgeBg: "bg-[#0BA5C7]/15",
    badgeText: "text-[#0BA5C7]",
    barColor: "bg-[#0BA5C7]",
  },
  archive: {
    title: "Tier 3 · Archive",
    subtitle: "Truck & garage. Modular inserts.",
    icon: Archive,
    accent: "text-[#A8B2BD]",
    border: "border-[#30363D]",
    badgeBg: "bg-[#21262D]",
    badgeText: "text-[#A8B2BD]",
    barColor: "bg-[#A8B2BD]",
  },
  custom: {
    title: "Custom",
    subtitle: "Trip-specific, regional, themed.",
    icon: Folder,
    accent: "text-[#A8B2BD]",
    border: "border-[#30363D]",
    badgeBg: "bg-[#21262D]",
    badgeText: "text-[#A8B2BD]",
    barColor: "bg-[#A8B2BD]",
  },
};

interface BoxesTabProps {
  boxes: FlyBoxWithStats[];
}

export default function BoxesTab({ boxes: initialBoxes }: BoxesTabProps) {
  const router = useRouter();
  const [boxes, setBoxes] = useState(initialBoxes);
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");

  const grouped = useMemo(
    () =>
      TIER_ORDER.reduce(
        (acc, tier) => {
          acc[tier] = boxes.filter((b) => b.tier === tier);
          return acc;
        },
        {} as Record<FlyBoxTier, FlyBoxWithStats[]>,
      ),
    [boxes],
  );

  function handleCreated(newBox: FlyBoxWithStats) {
    setBoxes((prev) => [...prev, newBox]);
    setCreateOpen(false);
    router.refresh();
  }

  if (boxes.length === 0) {
    return <EmptyState onCreate={() => setCreateOpen(true)} createOpen={createOpen} onCreateClose={() => setCreateOpen(false)} onCreated={handleCreated} />;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)] max-w-xl leading-relaxed">
          Organize like the{" "}
          <Link href="/articles/fly-box-tier-system" className="text-[#E8923A] hover:underline">
            tier system
          </Link>
          : Kill on your chest, Support in your pack, Archive in storage.
        </p>
        <div className="flex items-center gap-2">
          <ViewModeToggle storageKey="flies:view:boxes" defaultMode="grid" onChange={setView} />
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#E8923A] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors"
          >
            <Plus className="h-4 w-4" /> New Box
          </button>
        </div>
      </div>

      {view === "table" ? (
        <BoxesTable boxes={boxes} />
      ) : (
        <div className="space-y-8">
          {TIER_ORDER.map((tier) => {
            const tierBoxes = grouped[tier];
            if (!tierBoxes.length) return null;
            const meta = TIER_META[tier];
            const Icon = meta.icon;
            return (
              <section key={tier}>
                <div className="mb-3 flex items-baseline gap-2">
                  <Icon className={`h-4 w-4 ${meta.accent}`} />
                  <h2 className={`text-sm font-semibold uppercase tracking-wider ${meta.accent}`}>
                    {meta.title}
                  </h2>
                  <span className="text-xs text-[var(--color-text-muted)]">— {meta.subtitle}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tierBoxes.map((box) => (
                    <BoxCard key={box.id} box={box} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {createOpen ? (
        <CreateBoxDialog onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      ) : null}
    </div>
  );
}

function BoxCard({ box }: { box: FlyBoxWithStats }) {
  const meta = TIER_META[box.tier];
  const capacityPct =
    box.total_capacity && box.total_capacity > 0
      ? Math.min(100, Math.round((box.total_quantity / box.total_capacity) * 100))
      : null;
  return (
    <Link
      href={`/flies/boxes/${box.id}`}
      className={`group flex flex-col rounded-xl border ${meta.border} bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors overflow-hidden`}
    >
      <div className="relative aspect-[5/3] bg-[var(--color-bg)] overflow-hidden">
        {box.cover_image_url ? (
          <Image
            src={box.cover_image_url}
            alt={box.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(min-width: 1024px) 30vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            {box.icon || (box.tier === "kill" ? "🎯" : box.tier === "support" ? "🎒" : box.tier === "archive" ? "📦" : "🗂️")}
          </div>
        )}
        <span
          className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeBg} ${meta.badgeText} backdrop-blur-sm ring-1 ring-white/10`}
        >
          {box.tier}
        </span>
        {box.is_default ? (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 ring-1 ring-white/15">
            Default
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">{box.name}</h3>
        {box.description ? (
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {box.description}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)] font-[var(--font-mono)] tabular-nums">
          <span>
            <span className="text-[var(--color-text-primary)] font-semibold">{box.fly_count}</span> flies
          </span>
          <span className="text-[var(--color-border)]">·</span>
          <span>
            <span className="text-[var(--color-text-primary)] font-semibold">{box.total_quantity}</span>
            {box.total_target > 0 ? ` / ${box.total_target}` : ""} stocked
          </span>
          {box.low_stock_count > 0 ? (
            <>
              <span className="text-[var(--color-border)]">·</span>
              <span className="text-[#E8923A]">{box.low_stock_count} low</span>
            </>
          ) : null}
        </div>
        {capacityPct !== null ? (
          <div className="mt-2">
            <div className="h-1 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className={`h-full ${box.low_stock_count > 0 ? "bg-[#E8923A]" : meta.barColor}`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)] font-[var(--font-mono)] tabular-nums">
              {box.total_quantity}/{box.total_capacity}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function BoxesTable({ boxes }: { boxes: FlyBoxWithStats[] }) {
  const router = useRouter();
  const columns: Column<FlyBoxWithStats>[] = [
    {
      id: "name",
      header: "Box",
      accessor: (b) => b.name,
      sortable: true,
      render: (b) => (
        <span className="font-medium text-[var(--color-text-primary)]">{b.name}</span>
      ),
    },
    {
      id: "tier",
      header: "Tier",
      accessor: (b) => b.tier,
      sortable: true,
      render: (b) => {
        const meta = TIER_META[b.tier];
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeBg} ${meta.badgeText}`}
          >
            {b.tier}
          </span>
        );
      },
    },
    { id: "fly_count", header: "Flies", accessor: (b) => b.fly_count, sortable: true, numeric: true },
    {
      id: "stocked",
      header: "Stocked",
      accessor: (b) => b.total_quantity,
      sortable: true,
      numeric: true,
    },
    {
      id: "target",
      header: "Target",
      accessor: (b) => b.total_target,
      sortable: true,
      numeric: true,
      render: (b) => (b.total_target > 0 ? b.total_target : "—"),
    },
    {
      id: "capacity",
      header: "Capacity",
      accessor: (b) => b.total_capacity ?? -1,
      sortable: true,
      hideOnSm: true,
      render: (b) => {
        if (!b.total_capacity || b.total_capacity <= 0) return <span className="text-[var(--color-text-muted)]">—</span>;
        const pct = Math.min(100, Math.round((b.total_quantity / b.total_capacity) * 100));
        return (
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className={`h-full ${b.low_stock_count > 0 ? "bg-[#E8923A]" : "bg-[#0BA5C7]"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)] font-[var(--font-mono)] tabular-nums">
              {b.total_quantity}/{b.total_capacity}
            </span>
          </div>
        );
      },
    },
    {
      id: "low_stock",
      header: "Low",
      accessor: (b) => b.low_stock_count,
      sortable: true,
      numeric: true,
      render: (b) =>
        b.low_stock_count > 0 ? (
          <span className="text-[#E8923A]">{b.low_stock_count}</span>
        ) : (
          <span className="text-[var(--color-text-muted)]">0</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={boxes}
      getRowKey={(b) => b.id}
      defaultSort={{ id: "tier", dir: "asc" }}
      onRowClick={(b) => router.push(`/flies/boxes/${b.id}`)}
      emptyMessage="No boxes yet."
    />
  );
}

function EmptyState({
  onCreate,
  createOpen,
  onCreateClose,
  onCreated,
}: {
  onCreate: () => void;
  createOpen: boolean;
  onCreateClose: () => void;
  onCreated: (b: FlyBoxWithStats) => void;
}) {
  return (
    <>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
        <Layers className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
        <h2 className="mt-4 font-heading text-lg font-bold text-[var(--color-text-primary)]">
          No fly boxes yet
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
          Build your Kill Box (highest-confidence flies on the chest), a Support Box for
          variations, and Archive boxes for storage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A]"
          >
            <Plus className="h-4 w-4" /> Create your first box
          </button>
        </div>
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          Or read the{" "}
          <Link href="/articles/fly-box-tier-system" className="text-[#E8923A] hover:underline">
            Fly Box Tier System article
          </Link>{" "}
          first.
        </p>
      </div>
      {createOpen ? <CreateBoxDialog onClose={onCreateClose} onCreated={onCreated} /> : null}
    </>
  );
}
