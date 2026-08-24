"use client";

import Link from "next/link";
import SafeEntityImage from "@/components/media/SafeEntityImage";
import { FOCUS_VISIBLE } from "@/components/layout/nav/links";
import { formatReadingTime } from "@/lib/utils";
import type { SearchDocument } from "@/lib/search";
import { TYPE_LABELS } from "./meta";

interface Props {
  item: SearchDocument;
  cfs?: number;
  exactFly?: boolean;
  active?: boolean;
}

export default function SearchResultRow({ item, cfs, exactFly, active }: Props) {
  return (
    <div
      className={`group flex items-center gap-4 rounded-md px-2 py-2.5 transition-colors duration-[120ms] ease-out ${
        active
          ? "bg-[var(--surface-raised)] ring-1 ring-[var(--signal-live)]"
          : "hover:bg-[var(--surface-raised)]"
      }`}
    >
      <Link
        href={item.href}
        className={`ea-focus-ring ${FOCUS_VISIBLE} flex min-w-0 flex-1 items-center gap-4`}
      >
        <Media item={item} />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-heading text-[18px] font-semibold leading-snug text-[var(--text-primary)] ${
              exactFly ? "underline decoration-[var(--action)] decoration-1 underline-offset-4" : ""
            }`}
          >
            {item.title}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-[var(--text-body)]">
            {rowSubtitle(item)}
          </p>
        </div>
        <WorthChoosing item={item} cfs={cfs} />
      </Link>
    </div>
  );
}

function Media({ item }: { item: SearchDocument }) {
  if (item.type === "fly") {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[var(--surface-page)]">
        <SafeEntityImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          meta={item.subtitle}
          contain
          className="object-contain p-1"
          sizes="64px"
        />
      </div>
    );
  }

  if (item.type === "destination") {
    return (
      <div className="relative h-14 w-[88px] shrink-0 overflow-hidden bg-[var(--surface-raised)]">
        <SafeEntityImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          meta={item.subtitle}
          className="object-cover"
          sizes="88px"
        />
      </div>
    );
  }

  if (item.type === "article" || item.type === "hatch") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--surface-raised)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-body)]">
          {item.type === "article" ? "Note" : "Hatch"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[var(--surface-raised)]">
      <SafeEntityImage
        src={item.imageUrl}
        alt={item.title}
        title={item.title}
        meta={item.subtitle}
        className="object-cover"
        sizes="48px"
      />
    </div>
  );
}

function WorthChoosing({
  item,
  cfs,
}: {
  item: SearchDocument;
  cfs?: number;
}) {
  if (item.type === "river") {
    return <LiveFlow cfs={cfs} />;
  }

  if (item.type === "article") {
    const minutes = item.readingTimeMinutes;
    return (
      <span className="num shrink-0 text-[13px] text-[var(--text-body)]">
        {minutes != null ? formatReadingTime(minutes) : TYPE_LABELS.article}
      </span>
    );
  }

  if (item.type === "fly") {
    return (
      <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-body)] sm:inline">
        {item.sizes ? `#${item.sizes}` : item.category ?? "Fly"}
      </span>
    );
  }

  if (item.type === "hatch" && item.riverCount != null) {
    return (
      <span className="num hidden shrink-0 text-[13px] text-[var(--text-body)] sm:inline">
        {item.riverCount} {item.riverCount === 1 ? "river" : "rivers"}
      </span>
    );
  }

  if (item.type === "destination") return null;

  return (
    <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-body)] sm:inline">
      {TYPE_LABELS[item.type]}
    </span>
  );
}

function LiveFlow({ cfs }: { cfs?: number }) {
  if (cfs == null) {
    return (
      <span className="register-dusk hidden shrink-0 rounded-sm bg-[var(--surface-raised)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)] sm:inline">
        Gauge offline
      </span>
    );
  }

  return (
    <span className="register-dusk inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-[var(--surface-raised)] px-2 py-1">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-[var(--signal-live)]"
      />
      <span className="num text-[14px] font-semibold text-[var(--signal-live)]">
        {Math.round(cfs).toLocaleString("en-US")}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
        cfs
      </span>
    </span>
  );
}

function rowSubtitle(item: SearchDocument): string {
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
