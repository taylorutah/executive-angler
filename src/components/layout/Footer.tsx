import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { Icon, type IconName } from "@/components/ui/Icon";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "The desk",
    links: [
      { label: "Rivers", href: "/rivers" },
      { label: "Flies", href: "/flies/library" },
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
      { label: "What we don't do", href: "/#what-we-dont-do" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socials: { href: string; label: string; name: IconName }[] = [
  { href: SOCIAL_LINKS.instagram, label: "Instagram", name: "instagram" },
  { href: SOCIAL_LINKS.youtube, label: "YouTube", name: "youtube" },
  { href: SOCIAL_LINKS.facebook, label: "Facebook", name: "facebook" },
  { href: SOCIAL_LINKS.x, label: "X", name: "social-x" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-rule)] bg-[var(--surface-page)] text-[var(--text-body)]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
          <div className="max-w-md">
            <Link href="/" className="ea-focus-ring inline-block" aria-label={SITE_NAME}>
              <Image
                src="/images/logo-horizontal-forest.svg"
                alt="Executive Angler"
                width={220}
                height={42}
                className="h-10 w-[220px] max-w-full"
              />
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-body)]">
              Every feature, free.
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-body)]">
              We never publish locations or fish counts.
            </p>
            <div className="mt-8 flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="ea-focus-ring text-[var(--text-body)] transition-colors hover:text-[var(--text-primary)]"
                >
                  <Icon name={s.name} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footerColumns.map(({ title, links }) => (
              <div key={title}>
                <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="ea-focus-ring text-[13.5px] text-[var(--text-body)] transition-colors hover:text-[var(--text-primary)]"
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

        <div className="mt-14 h-px w-full bg-[var(--border-rule)] lg:mt-20" />

        <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="whitespace-nowrap font-mono text-[11px] tracking-wide text-[var(--text-meta)]">
            © {year} {SITE_NAME}
          </p>
          <Link
            href="/terms"
            className="ea-focus-ring text-[11px] text-[var(--text-meta)] transition-colors hover:text-[var(--text-primary)]"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
