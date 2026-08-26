import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS, APP_STORE_URL } from "@/lib/constants";
import { Icon, type IconName } from "@/components/ui/Icon";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "The Desk",
    links: [
      { label: "Rivers", href: "/rivers" },
      { label: "Flies", href: "/flies/library" },
      { label: "Species", href: "/species" },
      { label: "Places", href: "/destinations" },
      { label: "Field Notes", href: "/articles" },
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    title: "Your Notebook",
    links: [
      { label: "Today", href: "/today" },
      { label: "Journal", href: "/journal" },
      { label: "Fly Box", href: "/flybox" },
      { label: "Your Rivers", href: "/rivers/mine" },
      { label: "Gear Locker", href: "/account/gear" },
      { label: "Import & Export", href: "/journal/import" },
      { label: "Feed", href: "/feed" },
    ],
  },
  {
    title: "Directory",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Lodges", href: "/lodges" },
      { label: "Fly Shops", href: "/fly-shops" },
      { label: "Gear Catalog", href: "/gear" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "For Guides", href: "/for-guides" },
      { label: "Contribute", href: "/contribute" },
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
    <footer className="bg-[var(--surface-card)] text-[var(--text-body)] border-t border-[var(--border-rule)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
        {/* Top — brand block + link grid */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-20">
          {/* Brand */}
          <div className="max-w-md">
            <Link
              href="/"
              className="ea-focus-ring inline-block"
              aria-label={SITE_NAME}
            >
              {/* Raw SVGs — next/image optimizer + lazy-load can leave this looking like alt text. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-horizontal-white.svg"
                alt=""
                width={220}
                height={42}
                className="h-10 w-[220px] max-w-full block dark-logo"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-horizontal-forest.svg"
                alt=""
                width={220}
                height={42}
                className="h-10 w-[220px] max-w-full hidden light-logo"
              />
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-body)]">
              Rivers, flies and hatches, documented. Plus a private journal that remembers what you
              learned.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-body)]">
              Every feature, free.
            </p>

            {/* App badges — light-mode store chips, not dusk leftovers */}
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ea-store-badge ea-focus-ring transition-colors hover:border-[var(--action)]"
                aria-label="Download on the App Store"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--text-primary)]" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="flex flex-col items-start leading-tight">
                  <span className="ea-store-badge-kicker">Download on the</span>
                  <span className="ea-store-badge-name">App Store</span>
                </span>
              </a>

              <div
                className="ea-store-badge cursor-default select-none"
                aria-label="Google Play — coming soon"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--text-primary)]" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.27 8.635-8.572zm3.196-3.196l2.792 1.6a1 1 0 010 1.738l-2.792 1.6L15.205 12l2.49-2.489zM5.864 2.658L16.802 8.93l-2.302 2.302-8.636-8.574z" />
                </svg>
                <span className="flex flex-col items-start leading-tight">
                  <span className="ea-store-badge-kicker">Get it on</span>
                  <span className="ea-store-badge-name">Google Play</span>
                </span>
                <span className="ea-store-badge-soon">Soon</span>
              </div>
            </div>

            {/* Social */}
            <div className="mt-8 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="ea-focus-ring group flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-rule)] bg-[var(--surface-raised)] transition-all hover:border-[var(--action)]/50 hover:bg-[var(--surface-card)]"
                >
                  <Icon
                    name={s.name}
                    className="h-4 w-4 text-[var(--text-body)] transition-colors group-hover:text-[var(--text-primary)]"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Link grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footerColumns.map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] mb-5">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="ea-focus-ring text-[13.5px] text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {title === "Your Notebook" && (
                    <li>
                      <Link
                        href="/app"
                        className="ea-focus-ring text-[13.5px] text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        Mobile App
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 lg:mt-20 h-px w-full bg-[var(--border-rule)]" />

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[var(--text-meta)] font-mono tracking-wide whitespace-nowrap">
            © {year} {SITE_NAME}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[var(--text-meta)]">
            <Link href="/privacy" className="ea-focus-ring hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="ea-focus-ring hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
