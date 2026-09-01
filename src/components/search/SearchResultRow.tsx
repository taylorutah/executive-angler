"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import { formatReadingTime } from "@/lib/utils";
import { SearchDocumentImage, type SearchDocument, type SearchType } from "@/lib/search";
import { TYPE_LABELS } from "./meta";

interface Props {
  item: SearchDocument;
  cfs?: number;
  exactFly?: boolean;
  active?: boolean;
}

class SearchResultCopy {
  static readonly TYPE_OVERLINE: Record<SearchType, string> = {
    river: "River",
    fly: "Fly",
    hatch: "Hatch",
    destination: "Place",
    article: "Field note",
    species: "Species",
    lodge: "Lodge",
    guide: "Guide",
    "fly-shop": "Fly shop",
  };

  static overline(item: SearchDocument): string {
    return SearchResultCopy.TYPE_OVERLINE[item.type];
  }

  static subtitle(item: SearchDocument): string {
    if (item.type === "article") {
      return item.category ? item.category.replace(/-/g, " ") : TYPE_LABELS.article;
    }
    if (item.type === "fly") {
      return [item.category, item.sizes ? `Sizes ${item.sizes}` : null]
        .filter(Boolean)
        .join(" · ");
    }
    return item.subtitle;
  }
}

class SearchResultTile {
  static contain(item: SearchDocument): boolean {
    return item.type === "fly";
  }

  static media(item: SearchDocument): ReactNode {
    if (!SearchDocumentImage.url(item.imageUrl)) return null;
    const contain = SearchResultTile.contain(item);
    return (
      <div
        data-search-media
        className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] empty:hidden"
      >
        <SafeEntityImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          fallback="none"
          contain={contain}
          className={contain ? "ea-photo object-contain p-1" : "ea-photo object-cover"}
          sizes="64px"
        />
      </div>
    );
  }
}

class SearchResultTrail {
  static node(item: SearchDocument, cfs?: number): ReactNode {
    if (item.type === "river") return SearchResultTrail.liveFlow(cfs);

    if (item.type === "article") {
      const minutes = item.readingTimeMinutes;
      return (
        <span className="num shrink-0 text-[13px] text-[var(--text-2)]">
          {minutes != null ? formatReadingTime(minutes) : TYPE_LABELS.article}
        </span>
      );
    }

    if (item.type === "fly") {
      return (
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">
          {item.sizes ? `#${item.sizes}` : item.category ?? "Fly"}
        </span>
      );
    }

    if (item.type === "hatch" && item.riverCount != null) {
      return (
        <span className="num shrink-0 text-[13px] text-[var(--text-2)]">
          {item.riverCount} {item.riverCount === 1 ? "river" : "rivers"}
        </span>
      );
    }

    return null;
  }

  /**
   * Live CFS uses --signal-live (teal). A search row is a pointer, not a
   * gauge — the chip is readable data on every viewport.
   */
  static liveFlow(cfs?: number): ReactNode {
    if (cfs == null) {
      return (
        <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--vellum)] px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-2)]">
          Gauge offline
        </span>
      );
    }

    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--vellum)] px-2.5 py-1.5">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-[var(--signal-live)]"
        />
        <span className="num text-[14px] font-semibold text-[var(--signal-live)]">
          {Math.round(cfs).toLocaleString("en-US")}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-2)]">
          cfs
        </span>
      </span>
    );
  }
}

export default function SearchResultRow({ item, cfs, exactFly, active }: Props) {
  const trail = SearchResultTrail.node(item, cfs);

  return (
    <div
      className={`group transition-colors duration-150 ease-standard ${
        active
          ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
          : "hover:bg-[var(--paper-deep)]"
      }`}
    >
      <Link
        href={item.href}
        className={`ea-focus-ring ${FOCUS_VISIBLE} flex min-h-11 min-w-0 flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:gap-4`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {SearchResultTile.media(item)}
          <div className="min-w-0 flex-1">
            <p className="ea-overline">{SearchResultCopy.overline(item)}</p>
            <p
              className={`line-clamp-2 font-display text-[18px] font-semibold leading-snug text-[var(--text-1)] ${
                exactFly ? "underline decoration-[var(--accent)] decoration-1 underline-offset-4" : ""
              }`}
            >
              {item.title}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-[var(--text-2)]">
              {SearchResultCopy.subtitle(item)}
            </p>
          </div>
        </div>
        {trail ? <div className="shrink-0 self-end sm:self-auto">{trail}</div> : null}
      </Link>
    </div>
  );
}
