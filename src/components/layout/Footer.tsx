import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

const footerColumns = {
  Product: [
    { label: "Journal", href: "/journal" },
    { label: "Rivers", href: "/rivers" },
    { label: "Fly Workbench", href: "/journal/flies" },
    { label: "Fly Library", href: "/flies" },
    { label: "Data Export", href: "/journal/export" },
    { label: "Pricing", href: "/pricing" },
  ],
  Explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Species", href: "/species" },
    { label: "Lodges", href: "/lodges" },
    { label: "Guides", href: "/guides" },
    { label: "Fly Shops", href: "/fly-shops" },
    { label: "Articles", href: "/articles" },
  ],
  Resources: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Search", href: "/search" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0D1117] text-[#A8B2BD] border-t border-[#21262D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="inline-block">
              <span className="text-[#F0F6FC] font-['DM_Serif_Display'] text-xl tracking-tight">
                Executive Angler
              </span>
            </Link>
            <p className="mt-3 text-sm text-[#8B949E] leading-relaxed max-w-xs">
              Better data. Better days on the water.
            </p>

            {/* App Download Badges */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://apps.apple.com/app/executive-angler/id6744145937"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#161B22] border border-[#30363D] px-3 py-1.5 text-xs text-[#F0F6FC] hover:border-[#8B949E] transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                iOS
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#161B22] border border-[#30363D] px-3 py-1.5 text-xs text-[#8B949E] cursor-default"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 2.27l-1.443 2.5a6.047 6.047 0 00-4.08-1.563 6.047 6.047 0 00-4.08 1.563l-1.443-2.5A.5.5 0 005.61 2.5l1.46 2.53A7.498 7.498 0 004.5 10.5h15a7.498 7.498 0 00-2.57-5.47l1.46-2.53a.5.5 0 00-.867-.23zM8.5 8a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zM5 11.5v7a1.5 1.5 0 001.5 1.5h1v2.5a1.5 1.5 0 003 0V20h3v2.5a1.5 1.5 0 003 0V20h1a1.5 1.5 0 001.5-1.5v-7H5zm-2.5 0a1.5 1.5 0 00-1.5 1.5v4a1.5 1.5 0 003 0v-4a1.5 1.5 0 00-1.5-1.5zm19 0a1.5 1.5 0 00-1.5 1.5v4a1.5 1.5 0 003 0v-4a1.5 1.5 0 00-1.5-1.5z" />
                </svg>
                Android
                <span className="text-[10px] text-[#6E7681]">Soon</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-5">
              {[
                {
                  href: SOCIAL_LINKS.instagram,
                  label: "Instagram",
                  icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
                },
                {
                  href: SOCIAL_LINKS.youtube,
                  label: "YouTube",
                  icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                },
                {
                  href: SOCIAL_LINKS.facebook,
                  label: "Facebook",
                  icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                },
                {
                  href: SOCIAL_LINKS.x,
                  label: "X",
                  icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6E7681] hover:text-[#F0F6FC] transition-colors"
                  aria-label={s.label}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-[0.12em] mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-[0.12em] mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors"
                >
                  X / Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#21262D] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-[#484F58] font-['IBM_Plex_Mono'] tracking-wide">
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </p>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="text-[11px] text-[#484F58] hover:text-[#8B949E] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-[#484F58] hover:text-[#8B949E] transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
