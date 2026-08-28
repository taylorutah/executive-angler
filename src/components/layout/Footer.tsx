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
    <footer className="ea-band-ink">
      <div className="mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div className="max-w-md">
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
            <p className="mt-4 text-[14px] leading-relaxed">
              Every feature, free.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed">
              We never publish locations or fish counts.
            </p>
            <div className="mt-8 -ml-3 flex items-center gap-1">
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
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
