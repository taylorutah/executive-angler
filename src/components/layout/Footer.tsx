import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const FOOTER_NOUNS: { label: string; href: string }[] = [
  { label: "Rivers", href: "/rivers" },
  { label: "Patterns", href: "/flies" },
  { label: "Field Notes", href: "/articles" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

const HOUSE: { label: string; href: string }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--paper)]">
      <div className="grid gap-3 px-4 py-6 sm:px-6 md:grid-cols-3 md:items-center md:py-5">
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] md:justify-self-start">
          {SITE_NAME} · a fly-fishing gazette.
        </p>
        <nav
          aria-label="Gazette"
          className="flex flex-wrap gap-x-3 gap-y-1 font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] md:justify-center"
        >
          {FOOTER_NOUNS.map((link, i) => (
            <span key={link.href} className="inline-flex items-center gap-x-3">
              {i > 0 ? <span aria-hidden>·</span> : null}
              <Link href={link.href} className="ea-focus-ring hover:text-[var(--copper)]">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
        <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] md:justify-self-end">
          No spots. No counts. No leaderboard.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 px-4 pb-5 font-ui text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] sm:px-6">
        {HOUSE.map((link) => (
          <Link key={link.href} href={link.href} className="ea-focus-ring hover:text-[var(--ink)]">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
