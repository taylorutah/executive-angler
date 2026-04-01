"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Search, User, Heart, Package, Bell,
  MessageSquare, Map, Mountain, Fish, Building2, Compass,
  BookOpen, ShoppingBag, Newspaper, Bug, Wrench,
  Plus, FishSymbol, Lightbulb, GitPullRequest, Sparkles
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { isPermanentPro } from "@/lib/admin";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationDropdown";
import { MessageIcon } from "@/components/notifications/MessageIcon";

/* ── Explore mega-menu sections ── */
const EXPLORE_SECTIONS = [
  {
    title: "Destinations",
    icon: Mountain,
    links: [
      { label: "Montana", href: "/destinations/montana" },
      { label: "Wyoming", href: "/destinations/wyoming" },
      { label: "Colorado", href: "/destinations/colorado" },
      { label: "Idaho", href: "/destinations/idaho" },
      { label: "Alaska", href: "/destinations/alaska" },
      { label: "New Zealand", href: "/destinations/new-zealand" },
    ],
    viewAll: { label: "All Destinations", href: "/destinations" },
  },
  {
    title: "Species",
    icon: Fish,
    links: [
      { label: "Rainbow Trout", href: "/species/rainbow-trout" },
      { label: "Brown Trout", href: "/species/brown-trout" },
      { label: "Cutthroat Trout", href: "/species/cutthroat-trout" },
      { label: "Brook Trout", href: "/species/brook-trout" },
      { label: "Steelhead", href: "/species/steelhead" },
    ],
    viewAll: { label: "All Species", href: "/species" },
  },
  {
    title: "Directory",
    icon: Building2,
    links: [
      { label: "Lodges", href: "/lodges" },
      { label: "Guides", href: "/guides" },
      { label: "Fly Shops", href: "/fly-shops" },
    ],
  },
  {
    title: "Learn",
    icon: Newspaper,
    links: [
      { label: "All Articles", href: "/articles" },
      { label: "Techniques", href: "/articles?category=technique" },
      { label: "Gear Reviews", href: "/articles?category=gear" },
      { label: "Conservation", href: "/articles?category=conservation" },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; avatarUrl?: string; displayName?: string; isPremium?: boolean } | null>(null);
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setMobileOpen(false); setPlusOpen(false); setExploreOpen(false); }, [pathname]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUserProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setUser(null); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, is_premium")
        .eq("user_id", authUser.id)
        .maybeSingle();

      let premium = isPermanentPro(authUser.email);
      if (!premium) premium = profile?.is_premium === true;
      if (!premium) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", authUser.id)
          .in("status", ["active", "trialing"])
          .maybeSingle();
        if (sub) premium = true;
      }

      setUser({
        email: authUser.email ?? undefined,
        avatarUrl: profile?.avatar_url || undefined,
        displayName: profile?.display_name || authUser.user_metadata?.display_name || undefined,
        isPremium: premium,
      });
    }

    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
      else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") fetchUserProfile();
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  // Cmd+K shortcut
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isExploreActive = ["/destinations", "/species", "/lodges", "/guides", "/fly-shops", "/articles"].some(p => pathname.startsWith(p));

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "text-[#F0F6FC] bg-[#F0F6FC]/5" : "text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#F0F6FC]/5"}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="ea-header-primary border-b border-[#21262D]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 cursor-pointer select-none">
                <Image
                  src="/images/logo-horizontal-white.svg"
                  alt="Executive Angler"
                  width={160}
                  height={32}
                  className="h-7 w-auto block dark-logo pointer-events-none"
                  priority
                  draggable={false}
                />
                <Image
                  src="/images/logo-horizontal-forest.svg"
                  alt="Executive Angler"
                  width={160}
                  height={32}
                  className="h-7 w-auto hidden light-logo pointer-events-none"
                  priority
                  draggable={false}
                />
              </Link>

              {/* ── Desktop Nav ── */}
              <nav className="hidden lg:flex items-center gap-0.5">
                {user && (
                  <Link href="/journal" className={navLinkClass(isActive("/journal") && !pathname.startsWith("/journal/flies/workbench"))}>
                    Journal
                  </Link>
                )}
                <Link href="/rivers" className={navLinkClass(isActive("/rivers"))}>
                  Rivers
                </Link>
                <Link href="/flies" className={navLinkClass(isActive("/flies") || pathname.startsWith("/journal/flies"))}>
                  Flies
                </Link>

                {/* Explore dropdown */}
                <div
                  ref={exploreRef}
                  className="relative"
                  onMouseEnter={() => { clearTimeout(exploreTimeout.current); setExploreOpen(true); }}
                  onMouseLeave={() => { exploreTimeout.current = setTimeout(() => setExploreOpen(false), 200); }}
                >
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isExploreActive || exploreOpen
                        ? "text-[#F0F6FC] bg-[#F0F6FC]/5"
                        : "text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#F0F6FC]/5"
                    }`}
                    onClick={() => setExploreOpen(!exploreOpen)}
                  >
                    Explore
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {exploreOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                      <div className="bg-[#161B22] border border-[#21262D] rounded-xl shadow-2xl overflow-hidden w-[560px]">
                        <div className="h-0.5 bg-gradient-to-r from-[#E8923A] via-[#0BA5C7] to-[#E8923A]" />
                        <div className="grid grid-cols-4 gap-0 p-4">
                          {EXPLORE_SECTIONS.map((section) => {
                            const Icon = section.icon;
                            return (
                              <div key={section.title}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Icon className="h-3.5 w-3.5 text-[#E8923A]" />
                                  <span className="text-[10px] font-bold text-[#6E7681] uppercase tracking-widest">{section.title}</span>
                                </div>
                                {section.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-2 py-1.5 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117] rounded transition-colors"
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                                {section.viewAll && (
                                  <Link
                                    href={section.viewAll.href}
                                    className="block px-2 py-1 mt-1 text-xs font-medium text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
                                  >
                                    {section.viewAll.label} &rarr;
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {user && (
                  <Link href="/feed" className={navLinkClass(isActive("/feed"))}>
                    Feed
                  </Link>
                )}

                {!user?.isPremium && (
                  <Link
                    href="/pricing"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/pricing"
                        ? "text-[#E8923A]"
                        : "text-[#E8923A]/70 hover:text-[#E8923A]"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Pro
                  </Link>
                )}
              </nav>

              {/* ── Right Actions ── */}
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link
                  href="/search"
                  className="flex items-center px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-[#1F2937] text-[#A8B2BD] hover:text-[#F0F6FC]"
                  title="Search (Cmd+K)"
                >
                  <Search className="h-4.5 w-4.5" />
                </Link>

                {user ? (
                  <div className="hidden sm:flex items-center gap-0.5">
                    <NotificationBell />
                    <MessageIcon />
                    <Link href="/account" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors ml-1">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-[#1F2937] flex items-center justify-center flex-shrink-0 ring-2 ring-transparent hover:ring-[#E8923A]/40 transition-all">
                        {user?.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs font-bold text-[#A8B2BD]">
                            {(user?.displayName || user?.email || "A")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937]">
                      Sign In
                    </Link>
                    <Link href="/signup" className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#E8923A] text-white hover:bg-[#d17d28] transition-colors">
                      Join Free
                    </Link>
                  </div>
                )}

                {/* Quick Actions (+) */}
                {user && (
                  <div ref={plusRef} className="relative">
                    <button
                      onClick={() => setPlusOpen(!plusOpen)}
                      aria-label="Quick actions"
                      className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#E8923A] text-white hover:bg-[#F0A65A] transition-all shadow-md hover:shadow-lg active:scale-95 ${plusOpen ? "rotate-45" : ""} duration-200`}
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                    </button>

                    {plusOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[#161B22] border border-[#21262D] rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                        <div className="h-0.5 bg-[#E8923A]" />
                        <div className="py-1">
                          <Link href="/journal/new" className="flex items-center gap-3 px-4 py-3 text-sm text-[#F0F6FC] hover:bg-[#0D1117] transition-colors">
                            <FishSymbol className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
                            Log a Session
                          </Link>
                          <div className="h-px bg-[#21262D] mx-4" />
                          <Link href="/journal/flies/new" className="flex items-center gap-3 px-4 py-3 text-sm text-[#F0F6FC] hover:bg-[#0D1117] transition-colors">
                            <Bug className="h-5 w-5 text-[#E8923A] flex-shrink-0" />
                            New Fly Recipe
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#1F2937]"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ top: "56px" }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-[#161B22] shadow-2xl overflow-y-auto animate-fade-in border-l border-[#21262D]">
            <div className="p-5">
              {/* Search */}
              <Link href="/search" className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC] transition-colors">
                <Search className="h-5 w-5" />
                Search
              </Link>

              {/* Core nav */}
              {user && (
                <Link
                  href="/journal"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive("/journal") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  Journal
                </Link>
              )}
              <Link
                href="/rivers"
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive("/rivers") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                Rivers
              </Link>
              <Link
                href="/flies"
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive("/flies") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                Flies
              </Link>
              {user && (
                <Link
                  href="/feed"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive("/feed") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  Feed
                </Link>
              )}

              {!user?.isPremium && (
                <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg text-[#E8923A]/70 hover:text-[#E8923A] hover:bg-[#E8923A]/5 transition-colors">
                  <Sparkles className="h-5 w-5" />
                  Pro
                </Link>
              )}

              {/* Explore accordion */}
              <div className="mt-4 pt-4 border-t border-[#21262D]">
                <button
                  onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-[#E8923A] rounded-lg hover:bg-[#0D1117] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Explore
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileExploreOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileExploreOpen && (
                  <div className="mt-1 space-y-3 pb-2">
                    {EXPLORE_SECTIONS.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.title} className="px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-3.5 w-3.5 text-[#E8923A]" />
                            <span className="text-[10px] font-bold text-[#6E7681] uppercase tracking-widest">{section.title}</span>
                          </div>
                          {section.links.map((link) => (
                            <Link
                              key={link.href + link.label}
                              href={link.href}
                              className="block px-3 py-2 text-sm text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117] rounded transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                          {section.viewAll && (
                            <Link
                              href={section.viewAll.href}
                              className="block px-3 py-1.5 text-xs font-medium text-[#0BA5C7] hover:text-[#F0F6FC] transition-colors"
                            >
                              {section.viewAll.label} &rarr;
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick actions — mobile */}
              {user && (
                <div className="mt-4 pt-4 border-t border-[#21262D] space-y-1">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">Quick Actions</p>
                  <Link href="/journal/new" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#F0F6FC] rounded-lg hover:bg-[#0D1117] transition-colors">
                    <FishSymbol className="h-5 w-5 text-[#E8923A]" /> Log a Session
                  </Link>
                  <Link href="/journal/flies/new" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC] transition-colors">
                    <Bug className="h-5 w-5 text-[#E8923A]" /> New Fly Recipe
                  </Link>
                </div>
              )}

              {/* User section */}
              <div className="mt-4 pt-4 border-t border-[#21262D] space-y-1">
                {user ? (
                  <>
                    <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <Bell className="h-5 w-5" /> Notifications
                    </Link>
                    <Link href="/messages" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <MessageSquare className="h-5 w-5" /> Messages
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <Heart className="h-5 w-5" /> Favorites
                    </Link>
                    <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      <User className="h-5 w-5" /> Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-3 text-base font-medium text-[#A8B2BD] rounded-lg hover:bg-[#0D1117] hover:text-[#F0F6FC]">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-4 py-3 text-base font-medium text-white bg-[#E8923A] rounded-lg text-center hover:bg-[#d17d28]">
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
