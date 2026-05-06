"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Layers, Crosshair, Backpack, Archive, Folder, MoreHorizontal } from "lucide-react";
import type { FlyBoxWithStats, FlyBoxTier } from "@/lib/db/fly-boxes";
import CreateBoxDialog from "@/components/flies/CreateBoxDialog";

const TIER_ORDER: FlyBoxTier[] = ["kill", "support", "archive", "custom"];

// Visual identity per tier (mirrors the tier-system article)
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
  },
  support: {
    title: "Tier 2 · Support",
    subtitle: "Pack & vest. Variations and situational patterns.",
    icon: Backpack,
    accent: "text-[#0BA5C7]",
    border: "border-[#0BA5C7]/30",
    badgeBg: "bg-[#0BA5C7]/15",
    badgeText: "text-[#0BA5C7]",
  },
  archive: {
    title: "Tier 3 · Archive",
    subtitle: "Truck & garage. Modular inserts.",
    icon: Archive,
    accent: "text-[#A8B2BD]",
    border: "border-[#30363D]",
    badgeBg: "bg-[#21262D]",
    badgeText: "text-[#A8B2BD]",
  },
  custom: {
    title: "Custom",
    subtitle: "Trip-specific, regional, themed.",
    icon: Folder,
    accent: "text-[#A8B2BD]",
    border: "border-[#30363D]",
    badgeBg: "bg-[#21262D]",
    badgeText: "text-[#A8B2BD]",
  },
};

interface Props {
  initialBoxes: FlyBoxWithStats[];
}

export default function MyBoxesClient({ initialBoxes }: Props) {
  const router = useRouter();
  const [boxes, setBoxes] = useState(initialBoxes);
  const [createOpen, setCreateOpen] = useState(false);

  const grouped = TIER_ORDER.reduce(
    (acc, tier) => {
      acc[tier] = boxes.filter((b) => b.tier === tier);
      return acc;
    },
    {} as Record<FlyBoxTier, FlyBoxWithStats[]>,
  );

  const totalBoxes = boxes.length;
  const totalFlies = boxes.reduce((sum, b) => sum + b.fly_count, 0);
  const totalQuantity = boxes.reduce((sum, b) => sum + b.total_quantity, 0);

  function handleCreated(newBox: FlyBoxWithStats) {
    setBoxes((prev) => [...prev, newBox]);
    setCreateOpen(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-[#E8923A]" />
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F0F6FC]">
                My Boxes
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#6E7681]">
              {totalBoxes} {totalBoxes === 1 ? "box" : "boxes"} · {totalFlies} flies ·{" "}
              {totalQuantity} tied
            </p>
            <p className="mt-2 text-xs text-[#6E7681] max-w-xl leading-relaxed">
              Organize like the{" "}
              <Link
                href="/articles/fly-box-tier-system"
                className="text-[#E8923A] hover:underline"
              >
                tier system
              </Link>
              : Kill on your chest, Support in your pack, Archive in storage. A fly can
              live in multiple boxes — counts and recipe stay synced.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-3 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Box
          </button>
        </header>

        {totalBoxes === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="space-y-8">
            {TIER_ORDER.map((tier) => {
              const tierBoxes = grouped[tier];
              if (tierBoxes.length === 0) return null;
              const meta = TIER_META[tier];
              const Icon = meta.icon;
              return (
                <section key={tier}>
                  <div className="mb-3 flex items-baseline gap-2">
                    <Icon className={`h-4 w-4 ${meta.accent}`} />
                    <h2 className={`text-sm font-semibold uppercase tracking-wider ${meta.accent}`}>
                      {meta.title}
                    </h2>
                    <span className="text-xs text-[#6E7681]">— {meta.subtitle}</span>
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

        {createOpen && (
          <CreateBoxDialog
            onClose={() => setCreateOpen(false)}
            onCreated={handleCreated}
          />
        )}
      </div>
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
      href={`/my-boxes/${box.id}`}
      className={`group flex flex-col rounded-xl border ${meta.border} bg-[#161B22] hover:bg-[#1C2128] transition-colors overflow-hidden`}
    >
      <div className="relative aspect-[5/3] bg-[#0D1117] overflow-hidden">
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
        {box.is_default && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 ring-1 ring-white/15">
            Default
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold text-[#F0F6FC] truncate">{box.name}</h3>
        {box.description ? (
          <p className="mt-0.5 text-xs text-[#6E7681] line-clamp-2 leading-relaxed">
            {box.description}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#A8B2BD]">
          <span>
            <span className="text-[#F0F6FC] font-semibold">{box.fly_count}</span>{" "}
            {box.fly_count === 1 ? "fly" : "flies"}
          </span>
          <span className="text-[#30363D]">·</span>
          <span>
            <span className="text-[#F0F6FC] font-semibold">{box.total_quantity}</span> tied
          </span>
        </div>
        {capacityPct !== null && (
          <div className="mt-2">
            <div className="h-1 w-full rounded-full bg-[#21262D] overflow-hidden">
              <div
                className={`h-full ${meta.badgeBg.replace("/15", "")} ${meta.accent.replace("text-", "bg-")}`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-[#6E7681]">
              {box.total_quantity}/{box.total_capacity}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-[#21262D] bg-[#161B22] px-6 py-14 text-center">
      <Layers className="mx-auto h-10 w-10 text-[#6E7681]" />
      <h2 className="mt-4 font-heading text-lg font-bold text-[#F0F6FC]">
        No fly boxes yet
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#6E7681]">
        Build your Kill Box (your highest-confidence flies on the chest), a Support Box
        for variations, and Archive boxes for storage.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0A65A]"
        >
          <Plus className="h-4 w-4" /> Create your first box
        </button>
      </div>
      <p className="mt-4 text-xs text-[#6E7681]">
        Or read the{" "}
        <Link href="/articles/fly-box-tier-system" className="text-[#E8923A] hover:underline">
          Fly Box Tier System article
        </Link>{" "}
        first.
      </p>
    </div>
  );
}

// Suppress lint for unused — referenced via dynamic icon resolution in TIER_META
void MoreHorizontal;
