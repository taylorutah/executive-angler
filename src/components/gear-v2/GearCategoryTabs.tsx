"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface CategoryTab {
  slug: string;
  label: string;
  count: number;
}

interface Props {
  categories: CategoryTab[];
}

export default function GearCategoryTabs({ categories }: Props) {
  const sp = useSearchParams();
  const active = sp.get("category") ?? "all";
  const total = categories.reduce((s, c) => s + c.count, 0);

  const tabs = [{ slug: "all", label: "All", count: total }, ...categories];

  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--border-rule)] mb-4 -mx-1">
      {tabs.map((t) => {
        const isActive = active === t.slug;
        const href = t.slug === "all" ? "/gear" : `/gear?category=${t.slug}`;
        return (
          <Link
            key={t.slug}
            href={href}
            scroll={false}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
              isActive
                ? "bg-[var(--surface-raised)] text-[var(--text-primary)] border-x border-t border-[var(--border-rule)] -mb-px"
                : "text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]/50"
            }`}
          >
            {t.label}{" "}
            <span className="font-['IBM_Plex_Mono'] text-[var(--text-meta)]">{t.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
