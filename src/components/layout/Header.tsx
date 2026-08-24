"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu, X, Search, User, Heart, Bell,
  MessageSquare, Bug, FishSymbol, Package
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/notifications/NotificationDropdown";
import { MessageIcon } from "@/components/notifications/MessageIcon";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setPlusOpen(false); }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "text-[#F0F6FC] bg-[#F0F6FC]/5" : "text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#F0F6FC]/5"}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="ea-header-primary border-b border-[#21262D]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              {/* Logo */}
              <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 cursor-pointer select-none">
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
                  <Link href="/dashboard" className={navLinkClass(isActive("/dashboard"))}>
                    Dashboard
                  </Link>
                )}
                {user && (
                  <Link href="/journal" className={navLinkClass(isActive("/journal") && !pathname.startsWith("/journal/flies"))}>
                    Journal
                  </Link>
                )}
                <Link
                  href={user ? "/flies" : "/flies/library"}
                  className={navLinkClass(
                    pathname === "/flies" ||
                      pathname.startsWith("/flies/boxes") ||
                      pathname.startsWith("/flies/library") ||
                      pathname.startsWith("/flies/category") ||
                      pathname.startsWith("/flies/materials")
                  )}
                >
                  Flies
                </Link>
                {user && (
                  <Link
                    href="/account/gear"
                    className={navLinkClass(isActive("/account/gear") || pathname === "/gear")}
                  >
                    Gear
                  </Link>
                )}
                {user && (
                  <Link href="/feed" className={navLinkClass(isActive("/feed"))}>
                    Feed
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

                {isLoading ? (
                  <div className="hidden sm:flex items-center ml-2">
                    <div className="h-8 w-8 rounded-full bg-[#1F2937] animate-pulse" />
                  </div>
                ) : user ? (
                  <div className="hidden sm:flex items-center gap-0.5">
                    <NotificationBell />
                    <MessageIcon />
                    <Link href="/account" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors ml-1">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-[#1F2937] flex items-center justify-center flex-shrink-0 ring-2 ring-transparent hover:ring-[#E8923A]/40 transition-all">
                        {user.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs font-bold text-[#A8B2BD]">
                            {(user.displayName || user.email || "A")[0].toUpperCase()}
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
                    <Button href="/signup" variant="solid" size="sm">Join Free</Button>
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
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive("/dashboard") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  Dashboard
                </Link>
              )}
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
                href={user ? "/flies" : "/flies/library"}
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  pathname === "/flies" || pathname.startsWith("/flies/")
                    ? "bg-[#0D1117] text-[#F0F6FC]"
                    : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                }`}
              >
                Flies
              </Link>
              {user && (
                <Link
                  href="/account/gear"
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive("/account/gear") ? "bg-[#0D1117] text-[#F0F6FC]" : "text-[#A8B2BD] hover:bg-[#0D1117] hover:text-[#F0F6FC]"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  Gear
                </Link>
              )}
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
                    <div className="px-2 pt-2">
                      <Button href="/signup" variant="solid" size="md" fullWidth>Create Account</Button>
                    </div>
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
