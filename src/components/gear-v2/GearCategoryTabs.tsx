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
    <div className="flex flex-wrap gap-1 border-b border-[var(--border)] mb-4 -mx-1">
      {tabs.map((t) => {
        const isActive = active === t.slug;
        const href = t.slug === "all" ? "/gear" : `/gear?category=${t.slug}`;
        return (
          <Link
            key={t.slug}
            href={href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
            }`}
          >
            {t.label}{" "}
            <span className="num text-[var(--text-3)]">{t.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
