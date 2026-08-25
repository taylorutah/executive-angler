import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS, APP_STORE_URL } from "@/lib/constants";

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

const socials = [
  {
    href: SOCIAL_LINKS.instagram,
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    href: SOCIAL_LINKS.youtube,
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    href: SOCIAL_LINKS.facebook,
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    href: SOCIAL_LINKS.x,
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
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
                  <svg
                    className="h-4 w-4 text-[var(--text-body)] transition-colors group-hover:text-[var(--text-primary)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
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
