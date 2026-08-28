"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/notifications/NotificationDropdown";
import { MessageIcon } from "@/components/notifications/MessageIcon";
import HeaderSearch from "./nav/HeaderSearch";
import ExploreMenu from "./nav/ExploreMenu";
import MobileNavSheet from "./nav/MobileNavSheet";
import { FOCUS_VISIBLE, LEARN_LINK, MEMBER_NOUNS, PUBLIC_NOUNS, isSectionActive } from "./nav/links";
import { useRouteChangeReset } from "./nav/useRouteChangeReset";
import { POST_LOGIN_PATH } from "@/lib/auth-paths";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useRouteChangeReset(() => {
    setMobileOpen(false);
    setPlusOpen(false);
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nouns = user ? MEMBER_NOUNS : PUBLIC_NOUNS;
  const logoSrc = "/images/logo-horizontal-forest.svg";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 ea-header-primary">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
          <div className="flex h-[var(--header-h)] items-center gap-4">
            {/* Mark */}
            <Link
              href={user ? POST_LOGIN_PATH : "/"}
              className="ea-focus-ring flex flex-shrink-0 cursor-pointer select-none items-center"
              aria-label="Executive Angler — home"
            >
              <Image
                src={logoSrc}
                alt="Executive Angler"
                width={160}
                height={32}
                className="h-7 w-auto pointer-events-none"
                priority
                draggable={false}
              />
            </Link>

            {/* ── Primary nouns ── */}
            <nav aria-label="Primary" className="hidden md:flex h-[var(--header-h)] items-stretch">
              {nouns.map((item) => {
                const active = isSectionActive(pathname, item.section);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="ea-nav-link ea-focus-ring"
                  >
                    {item.label}
                  </Link>
                );
              })}

              {!user && (
                <>
                  <span className="ea-nav-divider self-center" aria-hidden />
                  <Link
                    href={LEARN_LINK.href}
                    aria-current={isSectionActive(pathname, LEARN_LINK.section) ? "page" : undefined}
                    className="ea-nav-link ea-focus-ring"
                  >
                    {LEARN_LINK.label}
                  </Link>
                </>
              )}
            </nav>

            {/* ── Utility zone ── */}
            <div className="ml-auto flex items-center gap-2">
              {user && <span className="ea-nav-divider hidden md:block" aria-hidden />}
              <HeaderSearch />

              {isLoading ? (
                <div className="hidden md:flex items-center">
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-raised)] animate-pulse" />
                </div>
              ) : user ? (
                <div className="hidden md:flex items-center gap-1">
                  <ExploreMenu />
                  <NotificationBell />
                  <MessageIcon />
                  <Link
                    href="/account"
                    aria-label="Your account"
                    className="ea-focus-ring ml-1 flex items-center rounded-full"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Your account"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[12px] font-semibold text-[var(--text-2)]">
                          {(user.displayName || user.email || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </span>
                  </Link>

                  {/* Quick actions (+) */}
                  <div ref={plusRef} className="relative ml-1">
                    <button
                      onClick={() => setPlusOpen(!plusOpen)}
                      aria-label="Quick actions"
                      aria-expanded={plusOpen}
                      aria-haspopup="menu"
                      className={`ea-focus-ring flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white transition-transform duration-200 ease-standard ${
                        plusOpen ? "rotate-45" : ""
                      }`}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                    </button>

                    {plusOpen && (
                      <div
                        role="menu"
                        aria-label="Quick actions"
                        className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
                      >
                        <Link
                          href="/journal/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-1)] transition-colors hover:bg-[var(--paper-deep)]"
                        >
                          <Icon name="hook" className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                          Log a session
                        </Link>
                        <div className="mx-4 h-px bg-[var(--border)]" />
                        <Link
                          href="/journal/flies/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-1)] transition-colors hover:bg-[var(--paper-deep)]"
                        >
                          <Icon name="hackle" className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                          New fly recipe
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="ea-btn ea-btn-ghost ea-btn-sm ea-focus-ring">
                    Sign in
                  </Link>
                  <Link href="/signup" className="ea-btn ea-btn-primary ea-btn-sm ea-focus-ring">
                    Create account
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                ref={menuButtonRef}
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-haspopup="dialog"
                className={`ea-focus-ring ${FOCUS_VISIBLE} md:hidden inline-flex h-11 items-center gap-2 rounded-md px-2 text-[14px] font-medium text-[var(--text-2)]`}
              >
                <Icon name="menu" className="h-5 w-5" />
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
