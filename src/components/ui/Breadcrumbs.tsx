import Link from "next/link";
import { ChevronRight, ChevronLeft } from "@/icons";
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

  const parent = [...items].reverse().find((it) => it.href);
  const homeIsMobileBack = !parent;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm font-medium min-w-0 max-w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/"
          className={`${homeIsMobileBack ? "inline-flex items-center gap-1" : "hidden sm:inline"} shrink-0 text-text-secondary hover:text-accent transition-colors`}
        >
          {homeIsMobileBack ? <ChevronLeft className="h-4 w-4 sm:hidden" aria-hidden="true" /> : null}
          Home
        </Link>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isMobileBack = Boolean(parent && item.href === parent.href && item.label === parent.label);
          return (
            <span key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight
                className="hidden sm:block shrink-0 h-3.5 w-3.5 text-text-muted"
                aria-hidden="true"
              />
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${isMobileBack ? "inline-flex items-center gap-1" : "hidden sm:inline"} shrink-0 text-text-secondary hover:text-accent transition-colors`}
                >
                  {isMobileBack ? (
                    <ChevronLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
                  ) : null}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`hidden sm:inline text-text-primary ${isLast ? "truncate" : "shrink-0"}`}
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
