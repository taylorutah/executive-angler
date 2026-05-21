"use client";
/**
 * FlyCard — single workspace card. Container-query aware so the same card
 * works in a wide grid, a narrow 2-col grid, and the inline drawer
 * preview without media queries.
 *
 * Uses Tailwind v4 `@container` utility — set the parent element's
 * `container-type` via the `@container` class.
 */
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Wrench, Heart } from "lucide-react";
import type { WorkspaceRow } from "@/lib/flies/workspace-shared";

const CATEGORY_LABELS: Record<string, string> = {
  nymph: "Nymph",
  dry: "Dry Fly",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

interface Props {
  row: WorkspaceRow;
  viewerUsername: string | null;
}

export default function FlyCard({ row, viewerUsername }: Props) {
  void viewerUsername; // Kept on the prop for API compatibility — no longer used.
  // Every fly (canonical OR private) routes through /flies/{slug}.
  // getFlyBySlug() in fly-model has a "submitter peek" branch that returns
  // private/pending flies to their owner via RLS, so the same URL works for
  // both shapes. The old /anglers/{username}/flies/{slug} path is a
  // deprecated redirect-only handler that lands on /flies → /flies/workspace,
  // which was the source of the "Click my fly → workspace" bug.
  const flyStatus = (row.fly as { status?: string | null }).status ?? null;
  const href = `/flies/${row.fly.slug}`;
  const transitionName = `fly-${row.fly.id}`;

  return (
    <div className="@container h-full" style={{ viewTransitionName: transitionName }}>
      <Link
        href={href}
        className="block h-full rounded-lg border border-[var(--color-border)] hover:border-[#E8923A]/60 hover:bg-[#E8923A]/5 transition-colors @[320px]:flex @[320px]:items-stretch @[320px]:gap-3 @[320px]:p-3 p-3"
      >
        {/* Image — top on narrow, left on wide */}
        <div className="relative h-24 w-full @[320px]:h-auto @[320px]:w-24 @[320px]:flex-shrink-0 overflow-hidden rounded-md bg-[var(--color-surface)] mb-3 @[320px]:mb-0">
          {row.fly.hero_image_url ? (
            <Image
              src={row.fly.hero_image_url}
              alt={row.fly.name}
              fill
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl text-[#E8923A]/30 font-heading">
              {row.fly.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="font-medium truncate text-[var(--color-text-primary)]">
                  {row.fly.name}
                </p>
                {row.is_custom && (
                  <span
                    title={
                      flyStatus === "pending"
                        ? "Submitted for review"
                        : flyStatus === "approved"
                          ? "Your fly, now canonical"
                          : "Created by you"
                    }
                    className="inline-flex items-center gap-0.5 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-1 py-0.5 text-[9px] font-medium text-[#0BA5C7] flex-shrink-0"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {flyStatus === "pending"
                      ? "Pending"
                      : flyStatus === "approved"
                        ? "Canonical"
                        : "Custom"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                {CATEGORY_LABELS[(row.fly.category as string) ?? ""] ??
                  row.fly.category ??
                  "Fly"}
                {row.versions.length > 0
                  ? ` · ${row.versions.length} version${row.versions.length === 1 ? "" : "s"}`
                  : " · No versions yet"}
              </p>
            </div>
            {row.favorite_any && (
              <Heart
                className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
              />
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
            <Stat label="In box" value={row.in_box_count} />
            <Stat label="Target" value={row.target_total} />
            <Stat label="Δ" value={row.deficit} warn={row.deficit > 0} />
            {row.tie_next_count > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-[#E8923A]/40 bg-[#E8923A]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#E8923A]">
                <Wrench className="h-3 w-3" /> {row.tie_next_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[9px] uppercase tracking-wider">{label}</span>
      <span
        className={`font-[var(--font-mono)] tabular-nums ${
          warn ? "text-[#E8923A] font-semibold" : ""
        }`}
      >
        {value}
      </span>
    </span>
  );
}
