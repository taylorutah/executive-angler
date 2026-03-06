"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight, Search, User, Heart } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

// ── Featured images for nav dropdowns ───────────────────────────────────────
const MEGA_MENU_FEATURED: Record<
  string,
  { src: string; alt: string; caption: string }
> = {
  Destinations: {
    src: "https://images.unsplash.com/photo-1569196769169-148d853ee706?w=600&q=80",
    alt: "Alaska wilderness fly fishing",
    caption: "30 premier destinations worldwide",
  },
  Rivers: {
    src: "https://images.unsplash.com/photo-1672941375895-7d6c67f87091?w=600&q=80",
    alt: "The Madison River, Montana",
    caption: "41 legendary rivers, fully mapped",
  },
  Articles: {
    src: "https://images.unsplash.com/photo-1612552001322-30d755f0980e?w=600&q=80",
    alt: "Fly fishing technique and instruction",
    caption: "Expert techniques, destinations & gear",
  },
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { email: user.email ?? undefined } : null);
    });
  }, []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.location.href = "/search";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isHomepage = pathname === "/";
  const headerBg =
    scrolled || !isHomepage
      ? "bg-white/95 backdrop-blur-md shadow-sm"
      : "bg-transparent";
  const textColor = scrolled || !isHomepage ? "text-forest-dark" : "text-white";
  const logoSrc =
    scrolled || !isHomepage
      ? "/images/logo-horizontal-forest.svg"
      : "/images/logo-horizontal-white.svg";

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={logoSrc}
                alt="Executive Angler"
                width={180}
                height={44}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const hasMegaImage =
                  "children" in link && link.label in MEGA_MENU_FEATURED;
                const featured =
                  hasMegaImage
                    ? MEGA_MENU_FEATURED[link.label as keyof typeof MEGA_MENU_FEATURED]
                    : null;

                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() =>
                      "children" in link && setActiveDropdown(link.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-forest/10 ${textColor} ${
                        pathname.startsWith(link.href) ? "font-semibold" : ""
                      }`}
                    >
                      {link.label}
                      {"children" in link && (
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      )}
                    </Link>

                    {/* Dropdown panel */}
                    {"children" in link && activeDropdown === link.label && (
                      <div
                        className={`absolute top-full left-0 mt-1 rounded-xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-fade-in ${
                          featured ? "w-[480px]" : "w-56"
                        }`}
                        style={{
                          opacity: 1,
                          transform: "translateY(0)",
                          transition: "opacity 150ms ease, transform 150ms ease",
                        }}
                      >
                        <div className="flex">
                          {/* Links column */}
                          <div className={`py-2 ${featured ? "flex-1" : "w-full"}`}>
                            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              {link.label}
                            </p>
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-cream hover:text-forest-dark transition-colors group/item"
                              >
                                <span>{child.label}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </Link>
                            ))}
                          </div>

                          {/* Featured image panel */}
                          {featured && (
                            <Link
                              href={link.href}
                              className="relative w-[168px] flex-shrink-0 overflow-hidden group/img"
                            >
                              <Image
                                src={featured.src}
                                alt={featured.alt}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                                sizes="168px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-forest-dark/20 to-transparent" />
                              <div className="absolute bottom-3 left-3 right-3">
                                <p className="text-white text-xs font-medium leading-snug">
                                  {featured.caption}
                                </p>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-forest/10 ${textColor}`}
                title="Search (⌘K)"
              >
                <Search className="h-4 w-4" />
              </Link>

              {user ? (
                <Link
                  href="/favorites"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-forest/10 ${textColor}`}
                >
                  <Heart className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-forest/10 ${textColor}`}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-lg ${textColor}`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-fade-in">
            <div className="p-6 pt-24">
              <nav className="space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const hasChildren = "children" in link;
                  const isExpanded = mobileExpanded === link.label;
                  const isActive = pathname.startsWith(link.href);

                  return (
                    <div key={link.label}>
                      {hasChildren ? (
                        /* Accordion toggle for items with sub-links */
                        <button
                          onClick={() => toggleMobileSection(link.label)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-cream text-forest-dark"
                              : "text-slate-700 hover:bg-cream"
                          }`}
                        >
                          <span>{link.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        /* Direct link for items without sub-links */
                        <Link
                          href={link.href}
                          className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-forest text-white"
                              : "text-slate-700 hover:bg-cream"
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}

                      {/* Expandable sub-links */}
                      {hasChildren && isExpanded && (
                        <div className="mt-0.5 ml-4 space-y-0.5 pb-1">
                          {/* Main section link */}
                          <Link
                            href={link.href}
                            className="block px-4 py-2 text-sm font-medium text-forest rounded-lg hover:bg-cream transition-colors"
                          >
                            All {link.label} →
                          </Link>
                          {link.children
                            .filter((c) => !c.label.startsWith("View"))
                            .map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2 text-sm text-slate-600 hover:text-forest-dark rounded-lg hover:bg-cream transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200 space-y-2">
                {user ? (
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-slate-700 rounded-lg hover:bg-cream"
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-slate-700 rounded-lg hover:bg-cream"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-3 text-base font-medium text-white bg-forest rounded-lg text-center hover:bg-forest-light"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
