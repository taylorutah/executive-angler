import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
      })),
    ],
  };

  // Mobile shows only "← <parent>" (the most recent ancestor with an href).
  // If no item has an href, fall back to "← Home".
  const parent = [...items].reverse().find((it) => it.href);
  const mobileBack = parent ?? { label: "Home", href: "/" };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Mobile: compact back link only */}
      <nav aria-label="Breadcrumb" className="sm:hidden">
        <Link
          href={mobileBack.href ?? "/"}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="truncate max-w-[55vw]">{mobileBack.label}</span>
        </Link>
      </nav>

      {/* Desktop: full chain */}
      <nav
        aria-label="Breadcrumb"
        className="hidden sm:flex items-center gap-1.5 text-sm font-medium min-w-0 max-w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/"
          className="shrink-0 text-text-secondary hover:text-accent transition-colors"
        >
          Home
        </Link>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="shrink-0 h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="shrink-0 text-text-secondary hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-text-primary ${isLast ? "truncate" : "shrink-0"}`}
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
