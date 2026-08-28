import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";
import { Icon, type IconName } from "@/components/ui/Icon";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Rivers", href: "/rivers" },
      { label: "Destinations", href: "/destinations" },
      { label: "Species", href: "/species" },
      { label: "Field Notes", href: "/articles" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "Flies", href: "/flies/library" },
      { label: "Gear", href: "/gear" },
    ],
  },
  {
    title: "Directory",
    links: [
      { label: "Fly Shops", href: "/fly-shops" },
      { label: "Guides", href: "/guides" },
      { label: "Lodges", href: "/lodges" },
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
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "For Guides", href: "/for-guides" },
      { label: "Contact", href: "/contact" },
      { label: "Feedback", href: "/feedback" },
      { label: "Privacy", href: "/privacy" },
      { label: "What we don't do", href: "/#what-we-dont-do" },
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
    <footer className="ea-band-ink ea-band-photo">
      {/* The site's one graded-photo ink band (client ruling 2026-08-28).
          Decorative: an existing library photograph under the flat ink scrim. */}
      <div className="ea-band-photo-media" aria-hidden="true">
        <Image
          src="/images/mongolia-river-aerial.jpg"
          alt=""
          fill
          sizes="100vw"
          className="ea-photo"
        />
      </div>
      <div className="ea-band-photo-scrim" aria-hidden="true" />

      <div className="relative mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="ea-focus-ring inline-block" aria-label={SITE_NAME}>
            <Image
              src="/images/logo-horizontal-white.svg"
              alt="Executive Angler"
              width={384}
              height={73}
              sizes="384px"
              className="h-10 w-[220px] max-w-full"
            />
          </Link>
          <div className="-mr-3 flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="ea-focus-ring inline-flex h-11 w-11 items-center justify-center"
              >
                <Icon name={s.name} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed">
          Every feature, free.
        </p>

        <p className="mt-12 max-w-[24ch] font-display text-4xl font-semibold leading-[1.15] tracking-[-0.01em] text-[var(--paper)] sm:text-5xl">
          We never publish locations or fish counts.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:mt-16 lg:grid-cols-5">
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="ea-band-heading mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="ea-focus-ring text-[14px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ea-band-rule mt-12 h-px w-full lg:mt-16" />

        <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="ea-band-meta text-[12px]">
            © {year} {SITE_NAME}
          </p>
          <Link href="/terms" className="ea-focus-ring text-[12px]">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
