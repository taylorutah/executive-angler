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
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const isActive = active === t.slug;
        const href = t.slug === "all" ? "/gear" : `/gear?category=${t.slug}`;
        return (
          <Link
            key={t.slug}
            href={href}
            scroll={false}
            className={`rounded-[2px] border px-3 py-1.5 font-ui text-[12px] ${
              isActive
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--hero-type)]"
                : "border-[var(--border-rule)] bg-[var(--paper)] text-[var(--graphite)] hover:text-[var(--ink)]"
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
