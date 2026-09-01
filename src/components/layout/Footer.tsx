import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "The desk",
    links: [
      { label: "Rivers", href: "/rivers" },
      { label: "Flies", href: "/flies" },
      { label: "Places", href: "/destinations" },
      { label: "Field Notes", href: "/articles" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Directory",
    links: [
      { label: "Fly Shops", href: "/fly-shops" },
      { label: "Guides", href: "/guides" },
      { label: "Lodges", href: "/lodges" },
      { label: "Species", href: "/species" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--container)] px-4 py-10 sm:px-6">
        <p className="font-ui text-[12px] uppercase tracking-[0.14em] text-[var(--text-3)]">
          {SITE_NAME} · a river gazette
        </p>
        <p className="mt-2 font-ui text-[12px] uppercase tracking-[0.14em] text-[var(--text-3)]">
          No spots. No counts. No noise.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="ea-overline mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="ea-focus-ring font-ui text-[13px] text-[var(--text-3)] hover:text-[var(--ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
