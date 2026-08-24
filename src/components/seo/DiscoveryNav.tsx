import Link from "next/link";
import { DISCOVERY_LINKS } from "@/lib/seo";

export default function DiscoveryNav({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Flagship fly fishing pages"
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm ${className}`}
    >
      {DISCOVERY_LINKS.map((link, i) => (
        <span key={link.href} className="inline-flex items-center gap-4">
          {i > 0 && (
            <span className="text-[var(--text-meta)]" aria-hidden="true">
              ·
            </span>
          )}
          <Link
            href={link.href}
            className="text-[var(--action)] hover:text-[var(--text-primary)] underline-offset-4 hover:underline"
          >
            {link.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
