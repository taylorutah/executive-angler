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
import { registerForPath } from "@/lib/register";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const plusRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useRouteChangeReset(() => {
    setMobileOpen(false);
    setPlusOpen(false);
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) setPlusOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nouns = user ? MEMBER_NOUNS : PUBLIC_NOUNS;
  const onHome = pathname === "/";
  const duskApp = Boolean(user) && registerForPath(pathname) === "dusk";
  const logoSrc = duskApp
    ? "/images/logo-horizontal-white.svg"
    : "/images/logo-horizontal-forest.svg";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ea-header-primary ${
          scrolled ? "ea-header-scrolled" : "ea-header-flat"
        } ${duskApp ? "" : "ea-header-public"}`}
      >
        <div className="w-full px-5 sm:px-8 xl:px-20">
          <div className="flex h-14 items-center gap-4 lg:gap-7">
            <Link
              href={user ? POST_LOGIN_PATH : "/"}
              className="ea-focus-ring flex flex-shrink-0 cursor-pointer select-none items-center"
              aria-label="Executive Angler — home"
            >
              {/* One mark, both viewports. Native SVG — next/image's 160×32
                  box cropped ANGLER at 390 into a one-line copper smear. */}
              <img
                src={logoSrc}
                alt="Executive Angler"
                width={136}
                height={26}
                data-wordmark={duskApp ? "white-horizontal" : "forest-horizontal"}
                className="pointer-events-none h-[26px] w-[136px] max-h-[26px] object-contain object-left"
              />
            </Link>

            {/* 56px hit area. Do not use ea-nav-link — unlayered display leaks Menu onto 1440. */}
            <button
              ref={menuButtonRef}
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
              className={`ea-focus-ring ${FOCUS_VISIBLE} lg:hidden flex h-14 items-center font-ui text-[13px] leading-none text-[var(--text-body)]`}
            >
              Menu
            </button>

            <nav aria-label="Primary" className="hidden lg:flex h-14 items-stretch gap-7">
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
              {user && <span className="ea-nav-divider hidden lg:block" aria-hidden />}
              {!onHome && (
                <div className={user ? undefined : "hidden lg:block"}>
                  <HeaderSearch />
                </div>
              )}

              {isLoading ? (
                <div className="hidden lg:flex items-center">
                  <div className="h-8 w-8 rounded-full bg-[var(--surface-card)] animate-pulse" />
                </div>
              ) : user ? (
                <div className="hidden lg:flex items-center gap-1">
                  <ExploreMenu />
                  <NotificationBell />
                  <MessageIcon />
                  <Link
                    href="/account"
                    aria-label="Your account"
                    className="ea-focus-ring ml-1 flex items-center rounded-full"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-card)]">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Your account"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[var(--text-body)]">
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
                      className={`ea-focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-[var(--action)] text-[var(--on-action)] transition-transform duration-200 ${
                        plusOpen ? "rotate-45" : ""
                      }`}
                    >
                      <Icon name="plus" className="h-5 w-5" />
                    </button>

                    {plusOpen && (
                      <div
                        role="menu"
                        aria-label="Quick actions"
                        className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] shadow-2xl"
                      >
                        <Link
                          href="/journal/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-page)]"
                        >
                          <Icon name="hook" className="h-5 w-5 flex-shrink-0 text-[var(--action)]" />
                          Log a session
                        </Link>
                        <div className="mx-4 h-px bg-[var(--border-rule)]" />
                        <Link
                          href="/journal/flies/new"
                          role="menuitem"
                          className="ea-focus-ring flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-page)]"
                        >
                          <Icon name="hackle" className="h-5 w-5 flex-shrink-0 text-[var(--action)]" />
                          New fly recipe
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/login" className="ea-nav-link ea-focus-ring">
                  Sign in
                </Link>
              )}
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
