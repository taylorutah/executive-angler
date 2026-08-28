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
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    title: "The notebook",
    links: [
      { label: "App", href: "/app" },
      { label: "Journal", href: "/journal" },
      { label: "Today", href: "/today" },
    ],
  },
  {
    title: "Find",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Lodges", href: "/lodges" },
      { label: "Shops", href: "/fly-shops" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "What we don't do", href: "/#what-we-dont-do" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--vellum)] text-[var(--graphite)]">
      <div className="w-full px-5 pb-24 pt-12 sm:px-8 lg:pb-9 xl:px-20">
        <div>
          <p
            className="font-heading text-[28px] font-semibold leading-none text-[var(--ink)]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            {SITE_NAME}
          </p>
          <p className="mt-1 font-ui text-[11px] font-medium uppercase tracking-[1.6px] text-[var(--slate)]">
            THE WATER DESK
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-7 py-7 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12">
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="mb-2 font-ui text-[11px] font-medium uppercase tracking-[1.4px] text-[var(--slate)]">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover-copper ea-focus-ring font-ui text-[14px] text-[var(--ink)] hover:text-[var(--copper)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--rule)] pt-5">
          <p className="font-ui text-[13px] text-[var(--graphite)]">Every feature, free.</p>
          <p className="mt-1.5 font-ui text-[13px] text-[var(--graphite)]">
            We never publish locations or fish counts.
          </p>
        </div>
      </div>
    </footer>
  );
}
