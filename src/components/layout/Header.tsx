"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, User, Heart, BookOpen, Package } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; avatarUrl?: string; displayName?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setUser(null); return; }
      const { data: profile } = await supabase
        .from("angler_profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fall back to profiles table for display_name (iOS-written data)
      const { data: profilesRow } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setUser({
        email: user.email ?? undefined,
        avatarUrl: profile?.avatar_url || undefined,
        displayName: profilesRow?.display_name || profile?.display_name || user.user_metadata?.display_name || undefined,
      });
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

  return (
    <>
      <header className="ea-header fixed top-0 left-0 right-0 z-50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo — white for dark mode, forest for light mode */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo-horizontal-white.svg"
                alt="Executive Angler"
                width={160}
                height={32}
                className="h-8 w-auto block dark-logo"
                priority
              />
              <Image
                src="/images/logo-horizontal-forest.svg"
                alt="Executive Angler"
                width={160}
                height={32}
                className="h-8 w-auto hidden light-logo"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    pathname.startsWith(link.href)
                      ? "text-[#F0F6FC] font-medium"
                      : "text-[#8B949E] hover:text-[#F0F6FC]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/search"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#1F2937] text-[#8B949E] hover:text-[#F0F6FC]"
                title="Search (⌘K)"
              >
                <Search className="h-4 w-4" />
              </Link>

              {user ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    href="/journal"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1F2937] text-[#8B949E] hover:text-[#F0F6FC]"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Journal</span>
                  </Link>
                  <Link href="/account" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors">
                    <div className="h-7 w-7 rounded-lg overflow-hidden bg-[#1F2937] flex items-center justify-center flex-shrink-0">
                      {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="Profile" width={28} height={28} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-xs font-bold text-[#8B949E]">
                          {(user?.displayName || user?.email || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1F2937] text-[#8B949E] hover:text-[#F0F6FC]"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#E8923A] text-white hover:bg-[#d17d28] transition-colors"
                  >
                    <span>Join Free</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ top: "64px" }}>
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#161B22] shadow-2xl overflow-y-auto animate-fade-in border-l border-[#21262D]">
            <div className="p-6">
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      pathname.startsWith(link.href)
                        ? "bg-[#1F2937] text-[#F0F6FC]"
                        : "text-[#8B949E] hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[#21262D] space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/journal"
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-[#8B949E] rounded-lg hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    >
                      <BookOpen className="h-5 w-5" />
                      My Journal
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-[#8B949E] rounded-lg hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    >
                      <Heart className="h-5 w-5" />
                      Favorites
                    </Link>
                    <Link
                      href="/account/gear"
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-[#8B949E] rounded-lg hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    >
                      <Package className="h-5 w-5" />
                      Gear Locker
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-[#8B949E] rounded-lg hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    >
                      <User className="h-5 w-5" />
                      Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-[#8B949E] rounded-lg hover:bg-[#1F2937] hover:text-[#F0F6FC]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-3 text-base font-medium text-white bg-[#E8923A] rounded-lg text-center hover:bg-[#d17d28]"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-center"><ThemeToggle /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
