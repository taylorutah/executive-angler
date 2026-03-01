import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link href="/" className="text-slate-500 hover:text-forest-dark transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-500 hover:text-forest-dark transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-forest-dark font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
