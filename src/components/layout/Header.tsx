"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, User, Heart } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { email: user.email ?? undefined } : null);
    });
  }, []);

  // Cmd+K / Ctrl+K shortcut to navigate to search
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
  const headerBg = scrolled || !isHomepage
    ? "bg-white/95 backdrop-blur-md shadow-sm"
    : "bg-transparent";
  const textColor = scrolled || !isHomepage ? "text-forest-dark" : "text-white";
  const logoColor = scrolled || !isHomepage ? "text-forest-dark" : "text-white";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className={`font-heading text-xl font-bold tracking-tight ${logoColor}`}>
              {SITE_NAME}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
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
                    {"children" in link && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>

                  {/* Dropdown */}
                  {"children" in link && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-2 animate-fade-in">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cream hover:text-forest-dark transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-fade-in">
            <div className="p-6 pt-24">
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        pathname.startsWith(link.href)
                          ? "bg-forest text-white"
                          : "text-slate-700 hover:bg-cream"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {"children" in link && (
                      <div className="ml-4 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-slate-600 hover:text-forest-dark rounded-lg hover:bg-cream"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
